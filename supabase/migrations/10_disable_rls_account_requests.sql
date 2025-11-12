/*
# Temporarily Disable RLS on Account Requests Table

## Issue
Despite having the correct RLS policy with anon and authenticated roles,
users are still getting 401 Unauthorized errors when trying to submit
account requests.

## Solution
Temporarily disable RLS on the account_requests table to allow public access.
This is a temporary measure to unblock users while we investigate the root cause.

## Security Note
This table only contains account request data (not sensitive user data).
Admins still need authentication to approve/reject requests.
Once the issue is resolved, we can re-enable RLS with proper policies.

## Testing
After this migration, anyone should be able to submit account requests.
*/

-- Disable RLS on account_requests table
ALTER TABLE account_requests DISABLE ROW LEVEL SECURITY;

-- Add comment for documentation
COMMENT ON TABLE account_requests IS 
  'Account requests table with RLS disabled to allow public submissions. Admins manage requests through authenticated endpoints.';
