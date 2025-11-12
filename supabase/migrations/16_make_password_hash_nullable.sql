/*
# Make password_hash nullable in account_requests

## Changes
- Alter account_requests table to make password_hash nullable
- This allows account requests without passwords (admin will generate them)

## Reason
- System-generated passwords are now created by admins upon approval
- Users no longer provide passwords during account request
*/

ALTER TABLE account_requests 
ALTER COLUMN password_hash DROP NOT NULL;
