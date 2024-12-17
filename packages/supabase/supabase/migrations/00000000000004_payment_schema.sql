-- Payment Provider Schema

-- Drop existing tables if they exist
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS payment_provider_accounts CASCADE;
DROP TABLE IF EXISTS payment_providers CASCADE;

-- Create payment providers table
CREATE TABLE payment_providers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    is_active boolean DEFAULT true,
    settings jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create payment provider accounts table (links users/orgs to provider accounts)
CREATE TABLE payment_provider_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id uuid REFERENCES payment_providers(id) ON DELETE CASCADE,
    owner_type text NOT NULL CHECK (owner_type IN ('user', 'organization')),
    owner_id uuid NOT NULL,
    provider_customer_id text NOT NULL,
    provider_data jsonb DEFAULT '{}',
    is_default boolean DEFAULT false,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(provider_id, owner_type, owner_id),
    UNIQUE(provider_id, provider_customer_id)
);

-- Create payment methods table
CREATE TABLE payment_methods (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id uuid REFERENCES payment_provider_accounts(id) ON DELETE CASCADE,
    provider_payment_method_id text NOT NULL,
    type text NOT NULL,
    provider_data jsonb DEFAULT '{}',
    is_default boolean DEFAULT false,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(account_id, provider_payment_method_id)
);

-- Add indexes
CREATE INDEX idx_payment_provider_accounts_owner ON payment_provider_accounts(owner_type, owner_id);
CREATE INDEX idx_payment_methods_account ON payment_methods(account_id);

-- Enable RLS
ALTER TABLE payment_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_provider_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Payment Providers policies
CREATE POLICY "Payment providers are readable by authenticated users"
    ON payment_providers FOR SELECT
    TO authenticated
    USING (true);

-- Payment Provider Accounts policies
CREATE POLICY "Users can view their own payment accounts"
    ON payment_provider_accounts FOR SELECT
    TO authenticated
    USING (
        (owner_type = 'user' AND owner_id = auth.uid())
        OR 
        (owner_type = 'organization' AND EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.resource_type = 'organization'
            AND m.resource_id = owner_id
            AND m.user_id = auth.uid()
        ))
    );

CREATE POLICY "Users can manage their own payment accounts"
    ON payment_provider_accounts FOR ALL
    TO authenticated
    USING (
        (owner_type = 'user' AND owner_id = auth.uid())
        OR 
        (owner_type = 'organization' AND EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.resource_type = 'organization'
            AND m.resource_id = owner_id
            AND m.user_id = auth.uid()
            AND m.role = 'owner'
        ))
    );

-- Payment Methods policies
CREATE POLICY "Users can view payment methods they have access to"
    ON payment_methods FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM payment_provider_accounts ppa
            WHERE ppa.id = account_id
            AND (
                (ppa.owner_type = 'user' AND ppa.owner_id = auth.uid())
                OR 
                (ppa.owner_type = 'organization' AND EXISTS (
                    SELECT 1 FROM memberships m
                    WHERE m.resource_type = 'organization'
                    AND m.resource_id = ppa.owner_id
                    AND m.user_id = auth.uid()
                ))
            )
        )
    );

CREATE POLICY "Users can manage payment methods they have access to"
    ON payment_methods FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM payment_provider_accounts ppa
            WHERE ppa.id = account_id
            AND (
                (ppa.owner_type = 'user' AND ppa.owner_id = auth.uid())
                OR 
                (ppa.owner_type = 'organization' AND EXISTS (
                    SELECT 1 FROM memberships m
                    WHERE m.resource_type = 'organization'
                    AND m.resource_id = ppa.owner_id
                    AND m.user_id = auth.uid()
                    AND m.role = 'owner'
                ))
            )
        )
    );

-- Insert default payment provider (Stripe)
INSERT INTO payment_providers (name, settings) 
VALUES ('stripe', '{"api_version": "2023-10-16"}');

-- Modify existing subscriptions table to use new payment schema
ALTER TABLE subscriptions 
    DROP COLUMN IF EXISTS stripe_customer_id,
    DROP COLUMN IF EXISTS stripe_subscription_id,
    ADD COLUMN payment_account_id uuid REFERENCES payment_provider_accounts(id),
    ADD COLUMN provider_subscription_id text,
    ADD COLUMN provider_data jsonb DEFAULT '{}';

-- Create helper functions

-- Function to get payment account for owner
CREATE OR REPLACE FUNCTION get_payment_account(
    p_owner_type text,
    p_owner_id uuid,
    p_provider_name text DEFAULT 'stripe'
)
RETURNS TABLE (
    account_id uuid,
    provider_id uuid,
    provider_customer_id text,
    provider_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ppa.id as account_id,
        ppa.provider_id,
        ppa.provider_customer_id,
        ppa.provider_data
    FROM payment_provider_accounts ppa
    JOIN payment_providers pp ON pp.id = ppa.provider_id
    WHERE ppa.owner_type = p_owner_type
    AND ppa.owner_id = p_owner_id
    AND pp.name = p_provider_name
    AND ppa.is_default = true;
END;
$$;

-- Function to get payment methods for account
CREATE OR REPLACE FUNCTION get_payment_methods(
    p_account_id uuid
)
RETURNS TABLE (
    payment_method_id uuid,
    provider_payment_method_id text,
    type text,
    provider_data jsonb,
    is_default boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pm.id as payment_method_id,
        pm.provider_payment_method_id,
        pm.type,
        pm.provider_data,
        pm.is_default
    FROM payment_methods pm
    WHERE pm.account_id = p_account_id
    ORDER BY pm.is_default DESC, pm.created_at DESC;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_payment_account TO authenticated;
GRANT EXECUTE ON FUNCTION get_payment_methods TO authenticated;

-- Enable Realtime for payment methods
ALTER PUBLICATION supabase_realtime ADD TABLE payment_methods; 