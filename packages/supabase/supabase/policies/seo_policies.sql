-- RLS Policies for sites
CREATE POLICY "Users can view their sites"
    ON sites FOR SELECT
    USING (has_project_access(project_id));

CREATE POLICY "Users can manage their sites"
    ON sites FOR ALL
    USING (has_project_access(project_id));

-- RLS Policies for crawl jobs
CREATE POLICY "Users can view their crawl jobs"
    ON crawl_jobs FOR SELECT
    USING (
        site_id IN (
            SELECT id FROM sites WHERE has_project_access(project_id)
        )
    );

CREATE POLICY "Users can manage their crawl jobs"
    ON crawl_jobs FOR ALL
    USING (
        site_id IN (
            SELECT id FROM sites WHERE has_project_access(project_id)
        )
    ); 