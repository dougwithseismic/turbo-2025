-- API Usage Tracking Functions

-- Function to track API usage
CREATE OR REPLACE FUNCTION track_api_usage(
    p_service_id uuid,
    p_user_id uuid,
    p_request_count integer DEFAULT 1,
    p_metadata jsonb DEFAULT '{}'
)
RETURNS TABLE (
    service_id uuid,
    user_id uuid,
    daily_usage integer,
    last_request_at timestamptz,
    requests_per_minute integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_usage RECORD;
BEGIN
    -- Get or create quota allocation
    INSERT INTO api_quota_allocations (
        service_id,
        user_id,
        daily_quota,
        queries_per_second
    )
    SELECT 
        p_service_id,
        p_user_id,
        default_daily_quota,
        default_queries_per_second
    FROM api_services
    WHERE id = p_service_id
    ON CONFLICT (user_id, service_id) DO NOTHING;

    -- Update usage tracking
    WITH usage_update AS (
        UPDATE api_usage_tracking
        SET 
            daily_usage = CASE 
                WHEN date_trunc('day', last_request_at) < date_trunc('day', now()) 
                THEN p_request_count 
                ELSE daily_usage + p_request_count 
            END,
            last_request_at = now(),
            requests_per_minute = CASE
                WHEN last_request_at < now() - interval '1 minute'
                THEN 1
                ELSE requests_per_minute + 1
            END
        WHERE service_id = p_service_id
        AND user_id = p_user_id
        RETURNING *
    )
    INSERT INTO api_usage_tracking (
        service_id,
        user_id,
        daily_usage,
        last_request_at,
        requests_per_minute
    )
    SELECT 
        p_service_id,
        p_user_id,
        p_request_count,
        now(),
        1
    WHERE NOT EXISTS (SELECT 1 FROM usage_update)
    RETURNING *;

    RETURN QUERY
    SELECT 
        ut.service_id,
        ut.user_id,
        ut.daily_usage,
        ut.last_request_at,
        ut.requests_per_minute
    FROM api_usage_tracking ut
    WHERE ut.service_id = p_service_id
    AND ut.user_id = p_user_id;
END;
$$;

-- Function to check API quota
CREATE OR REPLACE FUNCTION check_api_quota(
    p_service_id uuid,
    p_user_id uuid
)
RETURNS TABLE (
    can_proceed boolean,
    current_usage integer,
    daily_quota integer,
    queries_per_second integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE
            WHEN ut.daily_usage >= qa.daily_quota THEN false
            WHEN ut.requests_per_minute >= qa.queries_per_second * 60 THEN false
            ELSE true
        END as can_proceed,
        COALESCE(ut.daily_usage, 0) as current_usage,
        qa.daily_quota,
        qa.queries_per_second
    FROM api_quota_allocations qa
    LEFT JOIN api_usage_tracking ut ON 
        ut.service_id = qa.service_id 
        AND ut.user_id = qa.user_id
        AND date_trunc('day', ut.last_request_at) = date_trunc('day', now())
    WHERE qa.service_id = p_service_id
    AND qa.user_id = p_user_id;
END;
$$;

-- Function to reset API usage
CREATE OR REPLACE FUNCTION reset_api_usage(
    p_service_id uuid,
    p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE api_usage_tracking
    SET 
        daily_usage = 0,
        requests_per_minute = 0
    WHERE service_id = p_service_id
    AND user_id = p_user_id;
END;
$$;

-- Function to get API usage stats
CREATE OR REPLACE FUNCTION get_api_usage_stats(
    p_service_id uuid,
    p_user_id uuid,
    p_start_date timestamptz,
    p_end_date timestamptz
)
RETURNS TABLE (
    total_requests integer,
    daily_average numeric,
    peak_usage integer,
    by_day json
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH daily_stats AS (
        SELECT 
            date_trunc('day', created_at) as date,
            sum(request_count) as requests
        FROM api_request_logs
        WHERE service_id = p_service_id
        AND user_id = p_user_id
        AND created_at BETWEEN p_start_date AND p_end_date
        GROUP BY date_trunc('day', created_at)
    )
    SELECT 
        COALESCE(sum(ds.requests), 0)::integer as total_requests,
        COALESCE(avg(ds.requests), 0)::numeric as daily_average,
        COALESCE(max(ds.requests), 0)::integer as peak_usage,
        COALESCE(
            json_agg(
                json_build_object(
                    'date', ds.date,
                    'requests', ds.requests
                )
                ORDER BY ds.date
            ),
            '[]'::json
        ) as by_day
    FROM daily_stats ds;
END;
$$;

-- Credit Pool Functions

-- Function to add credits to a pool
CREATE OR REPLACE FUNCTION add_credits_to_pool(
    p_pool_id uuid,
    p_amount integer,
    p_source text,
    p_description text
)
RETURNS TABLE (
    pool json,
    transaction json
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_pool credit_pools%ROWTYPE;
    v_transaction credit_transactions%ROWTYPE;
BEGIN
    -- Update pool balance
    UPDATE credit_pools
    SET total_credits = total_credits + p_amount
    WHERE id = p_pool_id
    RETURNING * INTO v_pool;

    -- Record transaction
    INSERT INTO credit_transactions (
        pool_id,
        amount,
        balance_after,
        description,
        metadata
    )
    VALUES (
        p_pool_id,
        p_amount,
        v_pool.total_credits,
        p_description,
        jsonb_build_object('source', p_source)
    )
    RETURNING * INTO v_transaction;

    RETURN QUERY
    SELECT 
        row_to_json(v_pool)::json AS pool,
        row_to_json(v_transaction)::json AS transaction;
END;
$$;

-- Function to reserve credits from a pool
CREATE OR REPLACE FUNCTION reserve_credits_from_pool(
    p_pool_id uuid,
    p_amount integer,
    p_description text
)
RETURNS TABLE (
    pool json,
    transaction json
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_pool credit_pools%ROWTYPE;
    v_transaction credit_transactions%ROWTYPE;
BEGIN
    -- Check if enough credits are available
    SELECT * INTO v_pool
    FROM credit_pools
    WHERE id = p_pool_id
    FOR UPDATE;

    IF v_pool.total_credits < p_amount THEN
        RAISE EXCEPTION 'Insufficient credits available';
    END IF;

    -- Update pool balance
    UPDATE credit_pools
    SET 
        total_credits = total_credits - p_amount,
        reserved_credits = reserved_credits + p_amount
    WHERE id = p_pool_id
    RETURNING * INTO v_pool;

    -- Record transaction
    INSERT INTO credit_transactions (
        pool_id,
        amount,
        balance_after,
        description,
        metadata
    )
    VALUES (
        p_pool_id,
        -p_amount,
        v_pool.total_credits,
        p_description,
        jsonb_build_object('type', 'reserve')
    )
    RETURNING * INTO v_transaction;

    RETURN QUERY
    SELECT 
        row_to_json(v_pool)::json AS pool,
        row_to_json(v_transaction)::json AS transaction;
END;
$$;

-- Function to allocate subscription credits
CREATE OR REPLACE FUNCTION allocate_subscription_credits(
    p_subscriber_type text,
    p_subscriber_id uuid,
    p_credits integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_pool_id uuid;
BEGIN
    -- Get or create credit pool
    INSERT INTO credit_pools (
        owner_type,
        owner_id,
        total_credits,
        source
    )
    VALUES (
        p_subscriber_type,
        p_subscriber_id,
        0,
        'subscription'
    )
    ON CONFLICT (owner_type, owner_id)
    DO NOTHING
    RETURNING id INTO v_pool_id;

    IF v_pool_id IS NULL THEN
        SELECT id INTO v_pool_id
        FROM credit_pools
        WHERE owner_type = p_subscriber_type
        AND owner_id = p_subscriber_id;
    END IF;

    -- Add credits to pool
    PERFORM add_credits_to_pool(
        v_pool_id,
        p_credits,
        'subscription',
        'Monthly subscription credits'
    );
END;
$$; 