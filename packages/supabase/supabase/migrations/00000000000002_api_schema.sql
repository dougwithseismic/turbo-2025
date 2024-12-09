-- API Usage Tracking Tables

-- API Usage Tracking
CREATE TABLE api_usage_tracking (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id uuid REFERENCES api_services(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    daily_usage integer NOT NULL DEFAULT 0,
    last_request_at timestamptz NOT NULL DEFAULT now(),
    requests_per_minute integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(service_id, user_id)
);

-- API Request Logs
CREATE TABLE api_request_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id uuid REFERENCES api_services(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    request_count integer NOT NULL DEFAULT 1,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE api_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_request_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_api_usage_tracking_service_user ON api_usage_tracking(service_id, user_id);
CREATE INDEX idx_api_usage_tracking_last_request ON api_usage_tracking(last_request_at);
CREATE INDEX idx_api_request_logs_service_user ON api_request_logs(service_id, user_id);
CREATE INDEX idx_api_request_logs_created_at ON api_request_logs(created_at);

-- Create policies
CREATE POLICY "Users can view their own API usage"
    ON api_usage_tracking
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Service can update API usage"
    ON api_usage_tracking
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can view their own API request logs"
    ON api_request_logs
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Service can create API request logs"
    ON api_request_logs
    FOR INSERT
    WITH CHECK (true); 