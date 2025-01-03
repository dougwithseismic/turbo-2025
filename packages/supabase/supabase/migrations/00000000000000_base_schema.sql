-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS user_oauth_tokens CASCADE;
DROP TABLE IF EXISTS oauth_states CASCADE;
DROP TABLE IF EXISTS user_onboarding CASCADE;
DROP TABLE IF EXISTS api_quota_allocations CASCADE;
DROP TABLE IF EXISTS api_services CASCADE;
DROP TABLE IF EXISTS credit_transactions CASCADE;
DROP TABLE IF EXISTS credit_allocations CASCADE;
DROP TABLE IF EXISTS credit_pools CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS memberships CASCADE;
DROP TABLE IF EXISTS invitations CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS onboarding_step CASCADE;

-- Create types first
CREATE TYPE onboarding_step AS ENUM (
    'signup_completed',
    'google_connected',
    'gsc_connected',
    'first_project_created',
    'first_site_added',
    'first_crawl_completed',
    'subscription_selected'
);

-- Core user profile (extends Supabase auth.users)
CREATE TABLE profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email text UNIQUE NOT NULL,
    full_name text,
    company text,
    avatar_url text,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- OAuth tokens for third-party services
CREATE TABLE user_oauth_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users ON DELETE CASCADE,
    email text NOT NULL,
    provider text NOT NULL,
    access_token text NOT NULL,
    refresh_token text NOT NULL,
    token_expires_at timestamptz NOT NULL,
    scopes text[] NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, provider, email)
);

-- Organizations
CREATE TABLE organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    owner_id uuid REFERENCES auth.users ON DELETE CASCADE,
    settings jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Projects
CREATE TABLE projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations ON DELETE CASCADE,
    name text NOT NULL,
    settings jsonb DEFAULT '{}',
    client_name text,
    client_email text,
    is_client_portal boolean DEFAULT false,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Unified membership system
CREATE TABLE memberships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users ON DELETE CASCADE,
    resource_type text NOT NULL CHECK (resource_type IN ('project', 'organization')),
    resource_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'member',
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(resource_type, resource_id, user_id)
);

-- API service definitions
CREATE TABLE api_services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    description text,
    default_daily_quota integer NOT NULL,
    default_queries_per_second integer NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE api_quota_allocations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users ON DELETE CASCADE,
    service_id uuid REFERENCES api_services ON DELETE CASCADE,
    daily_quota integer NOT NULL,
    queries_per_second integer NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, service_id)
);

-- Subscription system
CREATE TABLE subscription_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type text NOT NULL CHECK (type IN ('individual', 'agency')),
    name text NOT NULL,
    stripe_price_id text UNIQUE,
    monthly_credits integer NOT NULL,
    max_clients integer,
    max_team_members integer,
    features jsonb DEFAULT '{}',
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subscriber_type text NOT NULL CHECK (subscriber_type IN ('user', 'organization')),
    subscriber_id uuid NOT NULL,
    plan_id uuid REFERENCES subscription_plans(id),
    stripe_subscription_id text UNIQUE NOT NULL,
    status text NOT NULL DEFAULT 'active',
    trial_ends_at timestamptz,
    next_credit_allocation_at timestamptz,
    current_period_start timestamptz,
    current_period_end timestamptz,
    cancel_at_period_end boolean DEFAULT false,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(subscriber_type, subscriber_id)
);



-- Credit system
CREATE TABLE credit_pools (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_type text NOT NULL CHECK (owner_type IN ('user', 'organization')),
    owner_id uuid NOT NULL,
    total_credits integer NOT NULL DEFAULT 0,
    reserved_credits integer NOT NULL DEFAULT 0,
    expires_at timestamptz,
    source text NOT NULL CHECK (source IN ('subscription', 'purchase', 'bonus')),
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT positive_credits CHECK (total_credits >= 0),
    CONSTRAINT valid_reserved CHECK (reserved_credits >= 0 AND reserved_credits <= total_credits),
    UNIQUE(owner_type, owner_id)
);

CREATE TABLE credit_allocations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id uuid REFERENCES credit_pools(id) ON DELETE CASCADE,
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    monthly_limit integer NOT NULL,
    current_usage integer NOT NULL DEFAULT 0,
    reset_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT positive_limit CHECK (monthly_limit >= 0),
    CONSTRAINT valid_usage CHECK (current_usage >= 0 AND current_usage <= monthly_limit)
);

CREATE TABLE credit_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id uuid REFERENCES credit_pools(id) ON DELETE CASCADE,
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    amount integer NOT NULL,
    balance_after integer NOT NULL,
    description text NOT NULL,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_amount CHECK (amount != 0)
);

-- Onboarding system
CREATE TABLE user_onboarding (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users ON DELETE CASCADE UNIQUE,
    current_step onboarding_step NOT NULL,
    completed_steps onboarding_step[] DEFAULT '{}',
    is_completed boolean DEFAULT false,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE oauth_states (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users ON DELETE CASCADE,
    state text NOT NULL UNIQUE,
    redirect_to text,
    expires_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Create invitations table
CREATE TABLE invitations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL,
    resource_type text NOT NULL CHECK (resource_type IN ('project', 'organization')),
    resource_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'member',
    invited_by uuid REFERENCES auth.users ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(email, resource_type, resource_id, status)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscriber ON subscriptions(subscriber_type, subscriber_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_quota_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
-- Profiles
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

-- Organizations
CREATE POLICY "Organizations are viewable by authenticated users" ON organizations
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Organizations are insertable by authenticated users" ON organizations
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = owner_id);

-- Projects
CREATE POLICY "Projects are viewable by authenticated users" ON projects
    FOR SELECT TO authenticated
    USING (true);

-- Memberships
CREATE POLICY "Memberships are viewable by authenticated users" ON memberships
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Memberships are modifiable by authenticated users" ON memberships
    FOR ALL TO authenticated
    USING (true);

-- User OAuth Tokens
CREATE POLICY "OAuth tokens are viewable by token owner" ON user_oauth_tokens
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "OAuth tokens are modifiable by token owner" ON user_oauth_tokens
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

-- User Onboarding
CREATE POLICY "Onboarding is viewable by user" ON user_onboarding
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Onboarding is modifiable by user" ON user_onboarding
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

-- OAuth States
CREATE POLICY "OAuth states are viewable by user" ON oauth_states
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "OAuth states are modifiable by user" ON oauth_states
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

-- Invitations
CREATE POLICY "Invitations are viewable by authenticated users" ON invitations
    FOR SELECT TO authenticated
    USING (true);

-- Enable Realtime
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE 
    user_oauth_tokens,
    organizations,
    projects,
    memberships,
    subscriptions,
    user_onboarding,
    invitations,
    profiles;

-- Configure the publication to handle all operations (insert, update, delete, truncate)
ALTER PUBLICATION supabase_realtime SET (publish = 'insert,update,delete');