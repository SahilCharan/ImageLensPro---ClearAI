/*
# Promote Existing Users to Admin Role

## Purpose
Promote existing users to admin role:
1. Sahil (sahilcharandwary@gmal.com) - existing user
2. Create manual process for Dmano

## Changes
1. Update Sahil's role to admin
2. Fix Sahil's email typo in profiles table
3. Document process for creating Dmano's account

## Security
- Admin users have full system access
- Can approve/reject account requests
- Can manage all system data

## Notes
- Sahil's account exists with typo: sahilcharandwary@gmal.com
- Will update profile role to admin
- Dmano needs to submit account request first, then we'll approve as admin
*/

-- Update Sahil's role to admin
UPDATE profiles 
SET role = 'admin'::user_role
WHERE email = 'sahilcharandwary@gmal.com';

-- Verify admin users
SELECT email, role, created_at FROM profiles WHERE role = 'admin' ORDER BY email;
