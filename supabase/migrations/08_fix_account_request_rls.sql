/*
# Fix Account Request RLS Policy

## Issue
The INSERT policy for account_requests was set to `TO anon` only, which prevents
both anonymous and authenticated users from creating requests.

## Solution
Drop the old policy and create a new one that allows both anonymous and authenticated users.
*/

-- Drop the old policy
DROP POLICY IF EXISTS "Anyone can create account requests" ON account_requests;

-- Create new policy that allows both anonymous and authenticated users
CREATE POLICY "Anyone can create account requests" ON account_requests
  FOR INSERT 
  WITH CHECK (true);

-- Ensure the policy works for both anon and authenticated
COMMENT ON POLICY "Anyone can create account requests" ON account_requests IS 
  'Allows both anonymous and authenticated users to submit account requests';
