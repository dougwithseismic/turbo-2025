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

-- Google OAuth and GSC management
CREATE TABLE user_google_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users ON DELETE CASCADE,
    google_email text NOT NULL,
    access_token text NOT NULL,
    refresh_token text NOT NULL,
    token_expires_at timestamptz NOT NULL,
    scopes text[] NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, google_email)
);

CREATE TABLE gsc_properties (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    google_account_id uuid REFERENCES user_google_accounts(id) ON DELETE CASCADE,
    property_type text NOT NULL, -- 'SITE', 'DOMAIN'
    property_url text NOT NULL,
    permission_level text NOT NULL, -- 'FULL', 'RESTRICTED', 'OWNER'
    verified boolean NOT NULL DEFAULT false,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(google_account_id, property_url)
);

CREATE TABLE gsc_verification_methods (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id uuid REFERENCES gsc_properties(id) ON DELETE CASCADE,
    verification_method text NOT NULL, -- 'HTML_FILE', 'META_TAG', 'DNS'
    verification_token text NOT NULL,
    verified boolean NOT NULL DEFAULT false,
    verified_at timestamptz,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crawl and metrics tables
CREATE TABLE crawl_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'pending',
    started_at timestamptz,
    completed_at timestamptz,
    total_urls integer DEFAULT 0,
    processed_urls integer DEFAULT 0,
    error_count integer DEFAULT 0,
    settings jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE url_metrics (
    id uuid DEFAULT gen_random_uuid(),
    time timestamptz NOT NULL,
    site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
    crawl_job_id uuid REFERENCES crawl_jobs(id) ON DELETE CASCADE,
    url text NOT NULL,
    status_code integer,
    redirect_url text,
    title text,
    meta_description text,
    h1 text[],
    canonical_url text,
    robots_directives text[],
    load_time_ms integer,
    word_count integer,
    internal_links integer,
    external_links integer,
    images_count integer,
    images_without_alt integer,
    schema_types text[],
    meta_robots text,
    viewport text,
    lang text,
    mobile_friendly boolean,
    issues jsonb DEFAULT '{}',
    PRIMARY KEY (id),
    UNIQUE (site_id, url, time)
);

CREATE TABLE gsc_metrics (
    id uuid DEFAULT gen_random_uuid(),
    time timestamptz NOT NULL,
    site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
    url text NOT NULL,
    query text NOT NULL,
    country text,
    device text,
    clicks integer,
    impressions integer,
    position numeric(5,2),
    ctr numeric(5,2),
    PRIMARY KEY (id),
    UNIQUE (site_id, url, query, time)
);

-- Content and keyword tables
CREATE TABLE keyword_clusters (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
    name text NOT NULL,
    queries text[] NOT NULL,
    total_impressions integer,
    avg_position numeric(5,2),
    opportunity_score integer,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE content_suggestions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
    url text NOT NULL,
    cluster_id uuid REFERENCES keyword_clusters(id) ON DELETE CASCADE,
    type text NOT NULL,
    suggestion text NOT NULL,
    implemented boolean DEFAULT false,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Storage and sync tables
CREATE TABLE url_html_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
    url text NOT NULL,
    crawl_job_id uuid REFERENCES crawl_jobs(id) ON DELETE CASCADE,
    html_storage_key text NOT NULL, -- Reference to Supabase Storage
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE gsc_sync_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'pending',
    date_range tstzrange NOT NULL,
    error_message text,
    metrics_synced integer DEFAULT 0,
    started_at timestamptz,
    completed_at timestamptz,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add unique constraint to prevent overlapping date ranges for the same site
CREATE UNIQUE INDEX idx_gsc_sync_jobs_no_overlap 
ON gsc_sync_jobs (site_id, date_range)
WHERE status != 'completed';

-- Performance Indexes
CREATE INDEX idx_url_metrics_lookup ON url_metrics(site_id, url);
CREATE INDEX idx_url_metrics_time ON url_metrics(time DESC);
CREATE INDEX idx_url_metrics_site_time ON url_metrics(site_id, time DESC);
CREATE INDEX idx_url_metrics_crawl ON url_metrics(crawl_job_id);

CREATE INDEX idx_gsc_metrics_lookup ON gsc_metrics(site_id, url);
CREATE INDEX idx_gsc_metrics_time ON gsc_metrics(time DESC);
CREATE INDEX idx_gsc_metrics_site_time ON gsc_metrics(site_id, time DESC);
CREATE INDEX idx_gsc_metrics_query ON gsc_metrics(site_id, query);

CREATE INDEX idx_url_metrics_issues ON url_metrics USING GIN (issues);
CREATE INDEX idx_url_html_snapshots_lookup ON url_html_snapshots(site_id, url);
CREATE INDEX idx_gsc_sync_jobs_status ON gsc_sync_jobs(site_id, status);
CREATE INDEX idx_gsc_sync_jobs_date ON gsc_sync_jobs USING GIST (date_range);

-- Enable RLS
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_google_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsc_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsc_verification_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE url_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsc_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE url_html_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsc_sync_jobs ENABLE ROW LEVEL SECURITY; 