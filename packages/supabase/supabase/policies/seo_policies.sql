-- RLS Policies for sites
CREATE POLICY "Users can view their sites"
    ON sites FOR SELECT
    USING (has_project_access(project_id));

CREATE POLICY "Users can manage their sites"
    ON sites FOR ALL
    USING (has_project_access(project_id));

-- RLS Policies for metrics
CREATE POLICY "Users can view their site's metrics"
    ON url_metrics FOR SELECT
    USING (
        site_id IN (
            SELECT id FROM sites WHERE has_project_access(project_id)
        )
    );

CREATE POLICY "Users can view their GSC metrics"
    ON gsc_metrics FOR SELECT
    USING (
        site_id IN (
            SELECT id FROM sites WHERE has_project_access(project_id)
        )
    );

-- RLS Policies for Google accounts
CREATE POLICY "Users can view their own Google accounts"
    ON user_google_accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own Google accounts"
    ON user_google_accounts FOR ALL
    USING (auth.uid() = user_id);

-- RLS Policies for GSC properties
CREATE POLICY "Users can view their GSC properties"
    ON gsc_properties FOR SELECT
    USING (
        google_account_id IN (
            SELECT id FROM user_google_accounts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their GSC properties"
    ON gsc_properties FOR ALL
    USING (
        google_account_id IN (
            SELECT id FROM user_google_accounts WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for verification methods
CREATE POLICY "Users can view their verification methods"
    ON gsc_verification_methods FOR SELECT
    USING (
        property_id IN (
            SELECT id FROM gsc_properties WHERE 
            google_account_id IN (
                SELECT id FROM user_google_accounts WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage their verification methods"
    ON gsc_verification_methods FOR ALL
    USING (
        property_id IN (
            SELECT id FROM gsc_properties WHERE 
            google_account_id IN (
                SELECT id FROM user_google_accounts WHERE user_id = auth.uid()
            )
        )
    );

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

-- RLS Policies for keyword clusters
CREATE POLICY "Users can view their keyword clusters"
    ON keyword_clusters FOR SELECT
    USING (
        site_id IN (
            SELECT id FROM sites WHERE has_project_access(project_id)
        )
    );

CREATE POLICY "Users can manage their keyword clusters"
    ON keyword_clusters FOR ALL
    USING (
        site_id IN (
            SELECT id FROM sites WHERE has_project_access(project_id)
        )
    );

-- RLS Policies for content suggestions
CREATE POLICY "Users can view their content suggestions"
    ON content_suggestions FOR SELECT
    USING (
        site_id IN (
            SELECT id FROM sites WHERE has_project_access(project_id)
        )
    );

CREATE POLICY "Users can manage their content suggestions"
    ON content_suggestions FOR ALL
    USING (
        site_id IN (
            SELECT id FROM sites WHERE has_project_access(project_id)
        )
    );

-- RLS Policies for HTML snapshots
CREATE POLICY "Users can view their HTML snapshots"
    ON url_html_snapshots FOR SELECT
    USING (
        site_id IN (
            SELECT id FROM sites WHERE has_project_access(project_id)
        )
    );

CREATE POLICY "Users can manage their HTML snapshots"
    ON url_html_snapshots FOR ALL
    USING (
        site_id IN (
            SELECT id FROM sites WHERE has_project_access(project_id)
        )
    );

-- RLS Policies for sync jobs
CREATE POLICY "Users can view their sync jobs"
    ON gsc_sync_jobs FOR SELECT
    USING (
        site_id IN (
            SELECT id FROM sites WHERE has_project_access(project_id)
        )
    );

CREATE POLICY "Users can manage their sync jobs"
    ON gsc_sync_jobs FOR ALL
    USING (
        site_id IN (
            SELECT id FROM sites WHERE has_project_access(project_id)
        )
    ); 