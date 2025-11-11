/*
# Fix Account Request RLS for Anonymous Users

## Issue
The RLS policy is set to `public` role, but Supabase uses the `anon` role for 
unauthenticated API requests. This causes 401 Unauthorized errors.

## Solution
1. Drop the existing policy
2. Create a new policy that explicitly grants access to both `anon` and `authenticated` roles
3. Use `TO anon, authenticated` to ensure both roles can insert

## Testing
After this migration, anonymous users should be able to submit account requests.
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Anyone can create account requests" ON account_requests;

-- Create new policy that explicitly allows anon and authenticated roles
CREATE POLICY "Anyone can create account requests" ON account_requests
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- Add comment for documentation
COMMENT ON POLICY "Anyone can create account requests" ON account_requests IS 
  'Allows both anonymous (anon) and authenticated users to submit account requests. The anon role is used for unauthenticated API requests from the frontend.';
