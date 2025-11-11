/*
# Create Account Request System for ClearAI

## Purpose
Implement admin-approved account creation system where users request access and admins manually approve.

## 1. New Tables

### account_requests
- `id` (uuid, primary key, default: gen_random_uuid())
- `full_name` (text, not null)
- `email` (text, unique, not null)
- `password_hash` (text, not null) - Store hashed password for later account creation
- `message` (text) - User's reason for requesting access
- `status` (text, default: 'pending') - pending, approved, rejected
- `approved_by` (uuid, references profiles.id) - Admin who approved/rejected
- `approved_at` (timestamptz) - When the request was processed
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

## 2. Profile Table Updates
- Add `approval_status` (text, default: 'approved') - For existing users
- Add `approved_by` (uuid, references profiles.id)
- Add `approved_at` (timestamptz)

## 3. Security
- Enable RLS on account_requests table
- Only admins can view and manage account requests
- Public can insert new requests (for account request form)
- Users cannot view other requests

## 4. Functions
- Function to approve account request (creates auth user and profile)
- Function to reject account request
- Function to check if user is approved before login

## 5. Admin Emails
- Dmanopla91@gmail.com
- sahilcharandwary@gmail.com
*/

-- Create account_requests table
CREATE TABLE IF NOT EXISTS account_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by uuid REFERENCES profiles(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add approval fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS approved_at timestamptz;

-- Update existing profiles to be approved
UPDATE profiles SET approval_status = 'approved', approved_at = now() WHERE approval_status IS NULL;

-- Enable RLS on account_requests
ALTER TABLE account_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert account requests (public access for request form)
CREATE POLICY "Anyone can create account requests" ON account_requests
  FOR INSERT TO anon WITH CHECK (true);

-- Policy: Admins can view all account requests
CREATE POLICY "Admins can view all account requests" ON account_requests
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- Policy: Admins can update account requests
CREATE POLICY "Admins can update account requests" ON account_requests
  FOR UPDATE TO authenticated USING (is_admin(auth.uid()));

-- Policy: Admins can delete account requests
CREATE POLICY "Admins can delete account requests" ON account_requests
  FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- Function to approve account request and create user
CREATE OR REPLACE FUNCTION approve_account_request(request_id uuid, admin_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_record account_requests;
  new_user_id uuid;
  result jsonb;
BEGIN
  -- Check if caller is admin
  IF NOT is_admin(admin_id) THEN
    RAISE EXCEPTION 'Only admins can approve account requests';
  END IF;

  -- Get the request
  SELECT * INTO request_record FROM account_requests WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account request not found or already processed';
  END IF;

  -- Create auth user (this would normally be done via Supabase Auth API)
  -- For now, we'll mark the request as approved and the application will handle user creation
  
  -- Update request status
  UPDATE account_requests 
  SET status = 'approved',
      approved_by = admin_id,
      approved_at = now(),
      updated_at = now()
  WHERE id = request_id;

  result := jsonb_build_object(
    'success', true,
    'message', 'Account request approved',
    'email', request_record.email,
    'full_name', request_record.full_name
  );

  RETURN result;
END;
$$;

-- Function to reject account request
CREATE OR REPLACE FUNCTION reject_account_request(request_id uuid, admin_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Check if caller is admin
  IF NOT is_admin(admin_id) THEN
    RAISE EXCEPTION 'Only admins can reject account requests';
  END IF;

  -- Update request status
  UPDATE account_requests 
  SET status = 'rejected',
      approved_by = admin_id,
      approved_at = now(),
      updated_at = now()
  WHERE id = request_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account request not found or already processed';
  END IF;

  result := jsonb_build_object(
    'success', true,
    'message', 'Account request rejected'
  );

  RETURN result;
END;
$$;

-- Function to check if user is approved
CREATE OR REPLACE FUNCTION is_user_approved(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND approval_status = 'approved'
  );
$$;

-- Update trigger for account_requests
CREATE TRIGGER update_account_requests_updated_at
  BEFORE UPDATE ON account_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_account_requests_status ON account_requests(status);
CREATE INDEX IF NOT EXISTS idx_account_requests_email ON account_requests(email);
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON profiles(approval_status);
