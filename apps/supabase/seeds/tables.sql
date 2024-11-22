-- First: Extensions and Types
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Drop existing types and tables
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS service_category CASCADE;
DROP TYPE IF EXISTS post_status CASCADE;
DROP TYPE IF EXISTS job_type CASCADE;
DROP TYPE IF EXISTS company_size CASCADE;

DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS service_reviews CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS job_listings CASCADE;
DROP TABLE IF EXISTS success_stories CASCADE;

-- Create ENUMs
CREATE TYPE user_role AS ENUM ('user', 'service_provider', 'admin', 'moderator');
CREATE TYPE service_category AS ENUM ('medical', 'legal', 'translation', 'relocation', 'real_estate', 'language_school', 'other');
CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE job_type AS ENUM ('full_time', 'part_time', 'contract', 'internship', 'remote');
CREATE TYPE company_size AS ENUM ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+');

-- Base tables remain similar but with some additions
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    location GEOGRAPHY(POINT),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    preferred_language VARCHAR(50) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role user_role DEFAULT 'user',
    nationality VARCHAR(100),
    languages_spoken TEXT[],
    bio TEXT,
    avatar_url TEXT,
    primary_address_id UUID REFERENCES addresses(id),
    billing_address_id UUID REFERENCES addresses(id),
    shipping_address_id UUID REFERENCES addresses(id),
    primary_contact_id UUID REFERENCES contacts(id),
    billing_contact_id UUID REFERENCES contacts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Services directory
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES users(id) NOT NULL,
    category service_category NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    website_url TEXT,
    address_id UUID REFERENCES addresses(id),
    contact_id UUID REFERENCES contacts(id),
    languages_offered TEXT[],
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Service reviews
CREATE TABLE service_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) NOT NULL,
    reviewer_id UUID REFERENCES users(id) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Events calendar
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID REFERENCES users(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    address_id UUID REFERENCES addresses(id),
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    is_online BOOLEAN DEFAULT false,
    online_meeting_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website_url TEXT,
    logo_url TEXT,
    size company_size,
    industry VARCHAR(100),
    year_founded INTEGER,
    linkedin_url TEXT,
    primary_address_id UUID REFERENCES addresses(id),
    primary_contact_id UUID REFERENCES contacts(id),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Modified job_listings table to reference companies
CREATE TABLE job_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    poster_id UUID REFERENCES users(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    job_type job_type NOT NULL,
    salary_range_min INTEGER,
    salary_range_max INTEGER,
    currency VARCHAR(3) DEFAULT 'CZK',
    requirements TEXT[],
    benefits TEXT[],
    work_location_address_id UUID REFERENCES addresses(id),
    contact_id UUID REFERENCES contacts(id),
    languages_required TEXT[],
    is_remote_friendly BOOLEAN DEFAULT false,
    experience_level VARCHAR(50),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status post_status DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Success stories
CREATE TABLE success_stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES users(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status post_status DEFAULT 'draft',
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_addresses_location ON addresses USING GIST(location);
CREATE INDEX idx_addresses_postal_code ON addresses(postal_code);
CREATE INDEX idx_addresses_city_country ON addresses(city, country);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_job_listings_company ON job_listings(company_id);
CREATE INDEX idx_job_listings_expires_at ON job_listings(expires_at);
CREATE INDEX idx_job_listings_status ON job_listings(status);
