-- Helper function to check if a user has access to an organization
CREATE OR REPLACE FUNCTION has_organization_access(organization_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM organizations o
        LEFT JOIN memberships m ON m.resource_id = o.id AND m.resource_type = 'organization'
        WHERE o.id = organization_id_param
        AND (o.owner_id = auth.uid() OR m.user_id = auth.uid())
    );
END;
$$;

-- Helper function to check if a user has access to a project
CREATE OR REPLACE FUNCTION has_project_access(project_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM projects p
        JOIN organizations o ON o.id = p.organization_id
        LEFT JOIN memberships m ON 
            (m.resource_id = o.id AND m.resource_type = 'organization')
            OR (m.resource_id = p.id AND m.resource_type = 'project')
        WHERE p.id = project_id_param
        AND (o.owner_id = auth.uid() OR m.user_id = auth.uid())
    );
END;
$$;

-- Helper function to check if a user is an organization owner
CREATE OR REPLACE FUNCTION is_organization_owner(organization_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM organizations
        WHERE id = organization_id_param
        AND owner_id = auth.uid()
    );
END;
$$;

-- Function to get available credits for a user or organization
CREATE OR REPLACE FUNCTION get_available_credits(
    owner_type_param text,
    owner_id_param uuid
)
RETURNS TABLE (
    total_credits integer,
    available_credits integer,
    reserved_credits integer,
    expires_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check access
    IF owner_type_param = 'organization' AND NOT has_organization_access(owner_id_param) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    IF owner_type_param = 'user' AND owner_id_param != auth.uid() THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    RETURN QUERY
    SELECT 
        cp.total_credits,
        cp.total_credits - cp.reserved_credits as available_credits,
        cp.reserved_credits,
        cp.expires_at
    FROM credit_pools cp
    WHERE cp.owner_type = owner_type_param
    AND cp.owner_id = owner_id_param;
END;
$$;

-- Function to allocate credits to a project
CREATE OR REPLACE FUNCTION allocate_project_credits(
    project_id_param uuid,
    monthly_limit_param integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    organization_id_var uuid;
    pool_id_var uuid;
    allocation_id uuid;
BEGIN
    -- Get project's organization
    SELECT organization_id INTO organization_id_var
    FROM projects
    WHERE id = project_id_param;

    -- Check access
    IF NOT has_organization_access(organization_id_var) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    -- Get credit pool
    SELECT id INTO pool_id_var
    FROM credit_pools
    WHERE owner_type = 'organization'
    AND owner_id = organization_id_var;

    -- Create allocation
    INSERT INTO credit_allocations (
        pool_id,
        project_id,
        monthly_limit,
        reset_at
    )
    VALUES (
        pool_id_var,
        project_id_param,
        monthly_limit_param,
        date_trunc('month', now()) + interval '1 month'
    )
    RETURNING id INTO allocation_id;

    -- Update reserved credits in pool
    UPDATE credit_pools
    SET reserved_credits = reserved_credits + monthly_limit_param
    WHERE id = pool_id_var;

    RETURN allocation_id;
END;
$$;

-- Function to record credit usage
CREATE OR REPLACE FUNCTION record_credit_usage(
    project_id_param uuid,
    amount_param integer,
    description_param text,
    metadata_param jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    pool_id_var uuid;
    allocation_var RECORD;
    transaction_id uuid;
BEGIN
    -- Check access
    IF NOT has_project_access(project_id_param) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    -- Get allocation and pool
    SELECT 
        ca.id,
        ca.monthly_limit,
        ca.current_usage,
        ca.pool_id,
        cp.total_credits
    INTO allocation_var
    FROM credit_allocations ca
    JOIN credit_pools cp ON cp.id = ca.pool_id
    WHERE ca.project_id = project_id_param
    AND ca.reset_at > now()
    ORDER BY ca.created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No active credit allocation found for project';
    END IF;

    -- Check if enough credits are available
    IF allocation_var.current_usage + amount_param > allocation_var.monthly_limit THEN
        RAISE EXCEPTION 'Monthly credit limit exceeded';
    END IF;

    -- Record transaction
    INSERT INTO credit_transactions (
        pool_id,
        project_id,
        amount,
        balance_after,
        description,
        metadata
    )
    VALUES (
        allocation_var.pool_id,
        project_id_param,
        -amount_param,
        allocation_var.total_credits - amount_param,
        description_param,
        metadata_param
    )
    RETURNING id INTO transaction_id;

    -- Update usage
    UPDATE credit_allocations
    SET current_usage = current_usage + amount_param
    WHERE id = allocation_var.id;

    -- Update pool balance
    UPDATE credit_pools
    SET total_credits = total_credits - amount_param
    WHERE id = allocation_var.pool_id;

    RETURN transaction_id;
END;
$$;

-- Function to get credit usage history
CREATE OR REPLACE FUNCTION get_credit_usage(
    project_id_param uuid,
    start_date timestamptz DEFAULT date_trunc('month', now()),
    end_date timestamptz DEFAULT now()
)
RETURNS TABLE (
    transaction_date timestamptz,
    credits_used integer,
    balance_after integer,
    description text,
    metadata jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check access
    IF NOT has_project_access(project_id_param) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    RETURN QUERY
    SELECT 
        ct.created_at as transaction_date,
        -ct.amount as credits_used,
        ct.balance_after,
        ct.description,
        ct.metadata
    FROM credit_transactions ct
    WHERE ct.project_id = project_id_param
    AND ct.created_at BETWEEN start_date AND end_date
    ORDER BY ct.created_at DESC;
END;
$$;

-- Function to get membership details
CREATE OR REPLACE FUNCTION get_memberships(
    resource_type_param text,
    resource_id_param uuid
)
RETURNS TABLE (
    user_id uuid,
    email text,
    full_name text,
    role text,
    joined_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check access
    IF resource_type_param = 'organization' AND NOT has_organization_access(resource_id_param) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    IF resource_type_param = 'project' AND NOT has_project_access(resource_id_param) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    RETURN QUERY
    SELECT 
        m.user_id,
        p.email,
        p.full_name,
        m.role,
        m.created_at as joined_at
    FROM memberships m
    JOIN profiles p ON p.id = m.user_id
    WHERE m.resource_type = resource_type_param
    AND m.resource_id = resource_id_param
    ORDER BY m.created_at;
END;
$$;

-- Function to add a member
CREATE OR REPLACE FUNCTION add_member(
    resource_type_param text,
    resource_id_param uuid,
    user_email_param text,
    role_param text DEFAULT 'member'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id_var uuid;
    membership_id uuid;
BEGIN
    -- Check access
    IF resource_type_param = 'organization' AND NOT is_organization_owner(resource_id_param) THEN
        RAISE EXCEPTION 'Only organization owners can add members';
    END IF;

    IF resource_type_param = 'project' AND NOT has_project_access(resource_id_param) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    -- Get user ID from email
    SELECT id INTO user_id_var
    FROM profiles
    WHERE email = user_email_param;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    -- Create membership
    INSERT INTO memberships (
        user_id,
        resource_type,
        resource_id,
        role
    )
    VALUES (
        user_id_var,
        resource_type_param,
        resource_id_param,
        role_param
    )
    RETURNING id INTO membership_id;

    RETURN membership_id;
END;
$$;

-- Function to remove a member
CREATE OR REPLACE FUNCTION remove_member(
    resource_type_param text,
    resource_id_param uuid,
    user_id_param uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check access
    IF resource_type_param = 'organization' AND NOT is_organization_owner(resource_id_param) THEN
        RAISE EXCEPTION 'Only organization owners can remove members';
    END IF;

    IF resource_type_param = 'project' AND NOT has_project_access(resource_id_param) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    -- Remove membership
    DELETE FROM memberships
    WHERE resource_type = resource_type_param
    AND resource_id = resource_id_param
    AND user_id = user_id_param;

    RETURN FOUND;
END;
$$;

-- Function to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    _user_id uuid;
BEGIN
    -- Store user_id to ensure consistency
    _user_id := COALESCE(NEW.id, gen_random_uuid());
    
    -- Create profile with NULL handling
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        _user_id,
        COALESCE(NEW.email, ''),
        NULLIF(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), '')
    );

    -- Create onboarding record with detailed error handling
    BEGIN
        RAISE NOTICE 'Attempting to create onboarding record for user %', _user_id;
        
        INSERT INTO public.user_onboarding (
            user_id,
            current_step,
            completed_steps,
            is_completed,
            metadata
        )
        VALUES (
            _user_id,
            'signup_completed'::public.onboarding_step,
            ARRAY['signup_completed']::public.onboarding_step[],
            false,
            '{}'::jsonb
        );
        
        RAISE NOTICE 'Successfully created onboarding record for user %', _user_id;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Failed to create onboarding record for user %. Error: %. Detail: %. Hint: %.', 
            _user_id, SQLERRM, SQLSTATE, SQLERRM;
    END;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to handle new user creation for user %. Error: %. Detail: %. Hint: %.', 
        _user_id, SQLERRM, SQLSTATE, SQLERRM;
    RETURN NEW;
END;
$$;

-- Trigger to create profile after user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION has_organization_access TO authenticated;
GRANT EXECUTE ON FUNCTION has_project_access TO authenticated;
GRANT EXECUTE ON FUNCTION is_organization_owner TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_credits TO authenticated;
GRANT EXECUTE ON FUNCTION allocate_project_credits TO authenticated;
GRANT EXECUTE ON FUNCTION record_credit_usage TO authenticated;
GRANT EXECUTE ON FUNCTION get_credit_usage TO authenticated;
GRANT EXECUTE ON FUNCTION get_memberships TO authenticated;
GRANT EXECUTE ON FUNCTION add_member TO authenticated;
GRANT EXECUTE ON FUNCTION remove_member TO authenticated; 