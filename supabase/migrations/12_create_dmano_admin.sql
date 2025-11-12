/*
# Create Dmano Admin Account

## Purpose
Create admin account for Dmano (Dmanopla91@gmail.com)

## Approach
Since we can't directly insert into auth.users, we'll:
1. Create an account request for Dmano
2. Provide instructions to approve it manually
3. Then update the role to admin

## Security
- Account will be created through normal flow
- Then promoted to admin role
- Password will be set by user

## Alternative
If Dmano already has an account or submits a request,
we can approve it and then run:
UPDATE profiles SET role = 'admin' WHERE email = 'Dmanopla91@gmail.com';
*/

-- Create a pending account request for Dmano
INSERT INTO account_requests (full_name, email, password_hash, message, status)
VALUES (
  'Dmano',
  'Dmanopla91@gmail.com',
  crypt('TempAdmin@123', gen_salt('bf')),
  'Admin account creation',
  'pending'
) ON CONFLICT (email) DO NOTHING;

-- Show the request
SELECT id, full_name, email, status, created_at 
FROM account_requests 
WHERE email = 'Dmanopla91@gmail.com';
