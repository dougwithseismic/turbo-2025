-- Profiles
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Organizations
CREATE POLICY "Users can view organizations they belong to"
    ON organizations FOR SELECT
    USING (has_organization_access(id));

CREATE POLICY "Organization owners can update their organizations"
    ON organizations FOR UPDATE
    USING (is_organization_owner(id));

CREATE POLICY "Users can create organizations"
    ON organizations FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Organization owners can delete their organizations"
    ON organizations FOR DELETE
    USING (is_organization_owner(id));

-- Projects
CREATE POLICY "Users can view projects they have access to"
    ON projects FOR SELECT
    USING (has_project_access(id));

CREATE POLICY "Organization members can create projects"
    ON projects FOR INSERT
    WITH CHECK (has_organization_access(organization_id));

CREATE POLICY "Organization members can update projects"
    ON projects FOR UPDATE
    USING (has_project_access(id));

CREATE POLICY "Organization owners can delete projects"
    ON projects FOR DELETE
    USING (organization_id IN (
        SELECT id FROM organizations WHERE owner_id = auth.uid()
    ));

-- Memberships
CREATE POLICY "Users can view relevant memberships"
    ON memberships FOR SELECT
    USING (
        user_id = auth.uid()
        OR (resource_type = 'organization' AND has_organization_access(resource_id))
        OR (resource_type = 'project' AND has_project_access(resource_id))
    );

CREATE POLICY "Organization owners can manage memberships"
    ON memberships FOR ALL
    USING (
        CASE 
            WHEN resource_type = 'organization' THEN is_organization_owner(resource_id)
            WHEN resource_type = 'project' THEN 
                resource_id IN (
                    SELECT id FROM projects 
                    WHERE organization_id IN (
                        SELECT id FROM organizations 
                        WHERE owner_id = auth.uid()
                    )
                )
            ELSE false
        END
    );

-- Subscription Plans
CREATE POLICY "Anyone can view active subscription plans"
    ON subscription_plans FOR SELECT
    USING (is_active = true);

-- Subscriptions
CREATE POLICY "Users can view their subscriptions"
    ON subscriptions FOR SELECT
    USING (
        (subscriber_type = 'user' AND subscriber_id = auth.uid())
        OR (
            subscriber_type = 'organization' 
            AND has_organization_access(subscriber_id)
        )
    );

CREATE POLICY "Users can manage their subscriptions"
    ON subscriptions FOR ALL
    USING (
        (subscriber_type = 'user' AND subscriber_id = auth.uid())
        OR (
            subscriber_type = 'organization' 
            AND is_organization_owner(subscriber_id)
        )
    );

-- Credit Pools
CREATE POLICY "Users can view their credit pools"
    ON credit_pools FOR SELECT
    USING (
        (owner_type = 'user' AND owner_id = auth.uid())
        OR (
            owner_type = 'organization' 
            AND has_organization_access(owner_id)
        )
    );

CREATE POLICY "Users can manage their credit pools"
    ON credit_pools FOR ALL
    USING (
        (owner_type = 'user' AND owner_id = auth.uid())
        OR (
            owner_type = 'organization' 
            AND is_organization_owner(owner_id)
        )
    );

-- Credit Allocations
CREATE POLICY "Users can view credit allocations"
    ON credit_allocations FOR SELECT
    USING (has_project_access(project_id));

CREATE POLICY "Organization owners can manage credit allocations"
    ON credit_allocations FOR ALL
    USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE organization_id IN (
                SELECT id FROM organizations 
                WHERE owner_id = auth.uid()
            )
        )
    );

-- Credit Transactions
CREATE POLICY "Users can view credit transactions"
    ON credit_transactions FOR SELECT
    USING (
        has_project_access(project_id)
        OR pool_id IN (
            SELECT id FROM credit_pools 
            WHERE (owner_type = 'user' AND owner_id = auth.uid())
            OR (owner_type = 'organization' AND has_organization_access(owner_id))
        )
    );

-- API Services
CREATE POLICY "Anyone can view API services"
    ON api_services FOR SELECT
    USING (true);

-- API Quota Allocations
CREATE POLICY "Users can view their API quota allocations"
    ON api_quota_allocations FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage their API quota allocations"
    ON api_quota_allocations FOR ALL
    USING (user_id = auth.uid());

-- User Onboarding
CREATE POLICY "Users can view their onboarding status"
    ON user_onboarding FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage their onboarding status"
    ON user_onboarding FOR ALL
    USING (user_id = auth.uid());

-- OAuth States
CREATE POLICY "Users can view their OAuth states"
    ON oauth_states FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage their OAuth states"
    ON oauth_states FOR ALL
    USING (user_id = auth.uid()); 