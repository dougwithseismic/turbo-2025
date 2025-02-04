-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS content_suggestions CASCADE;
DROP TABLE IF EXISTS keyword_clusters CASCADE;
DROP TABLE IF EXISTS gsc_sync_jobs CASCADE;
DROP TABLE IF EXISTS url_html_snapshots CASCADE;
DROP TABLE IF EXISTS gsc_metrics CASCADE;
DROP TABLE IF EXISTS url_metrics CASCADE;
DROP TABLE IF EXISTS crawl_jobs CASCADE;
DROP TABLE IF EXISTS gsc_verification_methods CASCADE;
DROP TABLE IF EXISTS gsc_properties CASCADE;
DROP TABLE IF EXISTS user_google_accounts CASCADE;
DROP TABLE IF EXISTS sites CASCADE;

-- Sites within projects
CREATE TABLE sites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    domain text NOT NULL,
    sitemap_url text,
    gsc_property_id text,
    ga_property_id text,
    crawl_frequency interval NOT NULL DEFAULT '1 week'::interval,
    last_crawl_at timestamptz,
    settings jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(project_id, domain)
);

-- Crawl jobs with consolidated results
CREATE TABLE crawl_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    user_email text,
    gsc_property_id text,
    ga_property_id text,
    status text NOT NULL DEFAULT 'pending',
    started_at timestamptz,
    completed_at timestamptz,
    total_urls integer DEFAULT 0,
    processed_urls integer DEFAULT 0,
    error_count integer DEFAULT 0,
    settings jsonb DEFAULT '{}',
    results jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Performance Indexes
CREATE INDEX idx_crawl_jobs_site ON crawl_jobs(site_id);
CREATE INDEX idx_crawl_jobs_status ON crawl_jobs(status);
CREATE INDEX idx_crawl_jobs_results ON crawl_jobs USING GIN (results);
CREATE INDEX idx_crawl_jobs_user ON crawl_jobs(user_id);

-- Create function to automatically set user information
CREATE OR REPLACE FUNCTION set_crawl_job_user_info()
RETURNS TRIGGER AS $$
BEGIN
    -- Set user_id if not provided
    IF NEW.user_id IS NULL THEN
        NEW.user_id := auth.uid();
    END IF;
    
    -- Set user_email from profiles table
    SELECT email INTO NEW.user_email
    FROM profiles
    WHERE id = NEW.user_id;
    
    -- Set property IDs directly from the site
    SELECT 
        gsc_property_id,
        ga_property_id 
    INTO 
        NEW.gsc_property_id,
        NEW.ga_property_id
    FROM sites
    WHERE id = NEW.site_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set user information
CREATE TRIGGER set_crawl_job_user_info_trigger
    BEFORE INSERT OR UPDATE ON crawl_jobs
    FOR EACH ROW
    EXECUTE FUNCTION set_crawl_job_user_info();

-- Enable RLS
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_jobs ENABLE ROW LEVEL SECURITY;

-- Enable realtime for sites and crawl_jobs
ALTER PUBLICATION supabase_realtime ADD TABLE sites;
ALTER PUBLICATION supabase_realtime ADD TABLE crawl_jobs; 