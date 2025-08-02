-- Create enum types for user_role and user_status
CREATE TYPE user_role AS ENUM (
  'admin',
  'doctor', 
  'nurse',
  'hospital',
  'case-coordinator',
  'finance',
  'customer-care'
);

CREATE TYPE user_status AS ENUM (
  'pending',
  'active', 
  'inactive',
  'suspended'
);

CREATE TYPE request_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'completed',
  'in-progress'
);