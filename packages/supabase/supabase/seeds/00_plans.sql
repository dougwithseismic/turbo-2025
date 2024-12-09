-- Initialize subscription plans
INSERT INTO subscription_plans (type, name, stripe_price_id, monthly_credits, features, max_clients, max_team_members)
VALUES 
    -- Individual plans
    (
        'individual',
        'Basic',
        'price_basic_monthly',
        5000,
        '{"max_projects": 1, "max_team_members": 2}',
        1,
        2
    ),
    (
        'individual',
        'Pro',
        'price_pro_monthly',
        20000,
        '{"max_projects": 5, "max_team_members": 5}',
        5,
        5
    ),
    (
        'individual',
        'Business',
        'price_business_monthly',
        50000,
        '{"max_projects": -1, "max_team_members": -1}',
        -1,
        -1
    ),
    -- Agency plans
    (
        'agency',
        'Agency Starter',
        'price_agency_starter',
        100000,
        '{"white_label": false, "priority_support": false}',
        5,
        3
    ),
    (
        'agency',
        'Agency Pro',
        'price_agency_pro',
        500000,
        '{"white_label": true, "priority_support": true}',
        20,
        10
    ),
    (
        'agency',
        'Agency Enterprise',
        'price_agency_enterprise',
        2000000,
        '{"white_label": true, "priority_support": true, "dedicated_support": true}',
        -1,
        -1
    ); 