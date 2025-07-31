-- Create enum types that are missing
CREATE TYPE IF NOT EXISTS user_role AS ENUM (
  'admin',
  'doctor', 
  'nurse',
  'hospital',
  'case-coordinator',
  'finance',
  'customer-care'
);

CREATE TYPE IF NOT EXISTS user_status AS ENUM (
  'pending',
  'active',
  'inactive'
);

CREATE TYPE IF NOT EXISTS request_status AS ENUM (
  'pending',
  'in_progress', 
  'approved',
  'rejected',
  'completed'
);