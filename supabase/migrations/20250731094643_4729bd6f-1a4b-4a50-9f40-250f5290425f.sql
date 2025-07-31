-- Create enum types that are missing
DO $$ 
BEGIN
    -- Create user_role enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM (
            'admin',
            'doctor', 
            'nurse',
            'hospital',
            'case-coordinator',
            'finance',
            'customer-care'
        );
    END IF;

    -- Create user_status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM (
            'pending',
            'active',
            'inactive'
        );
    END IF;

    -- Create request_status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
        CREATE TYPE request_status AS ENUM (
            'pending',
            'in_progress', 
            'approved',
            'rejected',
            'completed'
        );
    END IF;
END $$;