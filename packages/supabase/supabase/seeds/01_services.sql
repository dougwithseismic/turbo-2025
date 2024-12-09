-- Initialize API services
INSERT INTO api_services (name, description, default_daily_quota, default_queries_per_second)
VALUES 
    (
        'GSC',
        'Google Search Console API',
        50000,
        5
    ),
    (
        'GA4',
        'Google Analytics 4 API',
        100000,
        10
    ),
    (
        'SERP',
        'Search Engine Results Page API',
        10000,
        2
    ); 