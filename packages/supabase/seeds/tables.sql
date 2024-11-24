-- First: Extensions and Types
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Drop existing types and tables
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS event_status CASCADE;
DROP TYPE IF EXISTS ticket_status CASCADE;
DROP TYPE IF EXISTS refund_status CASCADE;
DROP TYPE IF EXISTS address_type CASCADE;
DROP TYPE IF EXISTS contact_type CASCADE;
DROP TYPE IF EXISTS participant_role CASCADE;

DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS venues CASCADE;
DROP TABLE IF EXISTS ticket_types CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS event_ticket_types CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS refunds CASCADE;
DROP TABLE IF EXISTS event_participants CASCADE;

-- Create ENUMs
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE ticket_status AS ENUM ('reserved', 'paid', 'cancelled', 'used', 'refunded', 'transferred');
CREATE TYPE participant_role AS ENUM ('host', 'attendee');
CREATE TYPE refund_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
CREATE TYPE address_type AS ENUM ('primary', 'billing', 'shipping');
CREATE TYPE contact_type AS ENUM ('primary', 'emergency', 'billing');

-- Create normalized address table
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

-- Create normalized contact information table
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role user_role DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create venues table
CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address_id UUID NOT NULL REFERENCES addresses(id),
    contact_id UUID NOT NULL REFERENCES contacts(id),
    max_capacity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create ticket_types table
CREATE TABLE ticket_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL REFERENCES venues(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status event_status DEFAULT 'draft',
    max_tickets INTEGER NOT NULL,
    min_tickets INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    CONSTRAINT valid_ticket_range CHECK (max_tickets >= min_tickets AND min_tickets > 0)
);

-- Create event_ticket_types table
CREATE TABLE event_ticket_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id),
    ticket_type_id UUID NOT NULL REFERENCES ticket_types(id),
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, ticket_type_id),
    CONSTRAINT valid_quantity CHECK (quantity > 0)
);

-- Create tickets table
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id),
    ticket_type_id UUID NOT NULL REFERENCES ticket_types(id),
    user_id UUID NOT NULL REFERENCES users(id),
    status ticket_status DEFAULT 'reserved',
    purchase_price DECIMAL(10, 2) NOT NULL,
    eventbrite_order_id VARCHAR(255),
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    transferred_from_ticket_id UUID REFERENCES tickets(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create refunds table
CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id),
    amount DECIMAL(10, 2) NOT NULL,
    status refund_status DEFAULT 'pending',
    reason TEXT,
    eventbrite_refund_id VARCHAR(255),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create event_participants table
CREATE TABLE event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id),
    user_id UUID NOT NULL REFERENCES users(id),
    role participant_role NOT NULL DEFAULT 'attendee',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);

-- Create indexes
CREATE INDEX idx_addresses_location ON addresses USING GIST(location);
CREATE INDEX idx_addresses_postal_code ON addresses(postal_code);
CREATE INDEX idx_addresses_city_country ON addresses(city, country);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_events_venue_id ON events(venue_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_tickets_event_id ON tickets(event_id);
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_eventbrite_order_id ON tickets(eventbrite_order_id);
CREATE INDEX idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX idx_event_participants_user_id ON event_participants(user_id);
CREATE INDEX idx_refunds_ticket_id ON refunds(ticket_id);
