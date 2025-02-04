-- Update existing crawl job policies to include user_id checks
DROP POLICY IF EXISTS "Users can view their crawl jobs" ON crawl_jobs;
DROP POLICY IF EXISTS "Users can manage their crawl jobs" ON crawl_jobs;

CREATE POLICY "Users can view their crawl jobs"
    ON crawl_jobs FOR SELECT
    USING (
        site_id IN (
            SELECT id FROM sites WHERE has_project_access(project_id)
        )
        OR user_id = auth.uid()
    );

CREATE POLICY "Users can manage their crawl jobs"
    ON crawl_jobs FOR ALL
    USING (
        site_id IN (
            SELECT id FROM sites WHERE has_project_access(project_id)
        )
        OR user_id = auth.uid()
    ); 