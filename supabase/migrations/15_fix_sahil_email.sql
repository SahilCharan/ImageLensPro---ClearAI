/*
# Fix Sahil's Email Address

## Purpose
Update Sahil's email from sahilcharandwary@gmal.com to sahilcharandwary@gmail.com

## Changes
1. Update email in profiles table
2. Update email in auth.users table

## Security
- Maintains admin role
- Preserves all other user data
*/

-- Update Sahil's email in profiles table
UPDATE profiles 
SET email = 'sahilcharandwary@gmail.com'
WHERE email = 'sahilcharandwary@gmal.com';

-- Update Sahil's email in auth.users table
UPDATE auth.users 
SET email = 'sahilcharandwary@gmail.com',
    raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{email}',
      '"sahilcharandwary@gmail.com"'::jsonb
    )
WHERE email = 'sahilcharandwary@gmal.com';

-- Verify the update
SELECT email, role FROM profiles WHERE email = 'sahilcharandwary@gmail.com';
