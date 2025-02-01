-- Add user information and property name to crawl jobs
ALTER TABLE crawl_jobs
    ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id),
    ADD COLUMN IF NOT EXISTS user_email text,
    ADD COLUMN IF NOT EXISTS gsc_property_id text,
    ADD COLUMN IF NOT EXISTS ga_property_id text;

-- Add index for faster lookups
DROP INDEX IF EXISTS idx_crawl_jobs_user;
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
DROP TRIGGER IF EXISTS set_crawl_job_user_info_trigger ON crawl_jobs;
CREATE TRIGGER set_crawl_job_user_info_trigger
    BEFORE INSERT OR UPDATE ON crawl_jobs
    FOR EACH ROW
    EXECUTE FUNCTION set_crawl_job_user_info();

-- Backfill existing records
DO $$ 
BEGIN
    WITH user_info AS (
        SELECT 
            cj.id as job_id,
            p.id as user_id,
            p.email as user_email,
            s.gsc_property_id,
            s.ga_property_id
        FROM crawl_jobs cj
        JOIN sites s ON s.id = cj.site_id
        JOIN projects pr ON pr.id = s.project_id
        JOIN organizations o ON o.id = pr.organization_id
        JOIN profiles p ON p.id = o.owner_id
    )
    UPDATE crawl_jobs cj
    SET 
        user_id = ui.user_id,
        user_email = ui.user_email,
        gsc_property_id = ui.gsc_property_id,
        ga_property_id = ui.ga_property_id
    FROM user_info ui
    WHERE cj.id = ui.job_id;
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Error during backfill: %', SQLERRM;
END $$;

-- Make user_id required for future records
ALTER TABLE crawl_jobs
    ALTER COLUMN user_id SET NOT NULL; 