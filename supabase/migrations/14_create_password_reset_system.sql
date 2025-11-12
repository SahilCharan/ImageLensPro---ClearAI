/*
# Password Reset System

## Purpose
Implement forgot password functionality with admin approval workflow

## Tables
1. password_reset_requests
   - id (uuid, primary key)
   - user_id (uuid, references profiles)
   - email (text, not null)
   - status (enum: pending, approved, rejected)
   - requested_at (timestamptz)
   - processed_at (timestamptz)
   - processed_by (uuid, references profiles)
   - notes (text)

## Security
- RLS disabled to allow public password reset requests
- Admin approval required before sending password
- Passwords are system-generated and hashed

## Workflow
1. User requests password reset
2. System checks if email exists
3. If exists, creates reset request
4. Admin receives email notification
5. Admin approves/rejects request
6. If approved, user receives password via email
*/

-- Create status enum for password reset requests
CREATE TYPE password_reset_status AS ENUM ('pending', 'approved', 'rejected');

-- Create password_reset_requests table
CREATE TABLE IF NOT EXISTS password_reset_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  email text NOT NULL,
  status password_reset_status DEFAULT 'pending'::password_reset_status NOT NULL,
  requested_at timestamptz DEFAULT now() NOT NULL,
  processed_at timestamptz,
  processed_by uuid REFERENCES profiles(id),
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Disable RLS to allow public password reset requests
ALTER TABLE password_reset_requests DISABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX idx_password_reset_requests_email ON password_reset_requests(email);
CREATE INDEX idx_password_reset_requests_status ON password_reset_requests(status);
CREATE INDEX idx_password_reset_requests_user_id ON password_reset_requests(user_id);

-- Add comment
COMMENT ON TABLE password_reset_requests IS 
  'Password reset requests with admin approval workflow. Users request password reset, admins approve/reject.';

-- Create function to get user by email
CREATE OR REPLACE FUNCTION get_user_by_email(user_email text)
RETURNS TABLE(id uuid, email text, full_name text, role user_role)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.email, p.full_name, p.role
  FROM profiles p
  WHERE p.email = user_email;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_by_email(text) TO anon, authenticated;
