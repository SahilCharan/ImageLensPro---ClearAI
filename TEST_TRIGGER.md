# Test Trigger Function - Verification Guide

## Quick Test

Run this in Supabase SQL Editor to test the fixed trigger:

### Step 1: Create Test Account Request

```sql
-- Insert a test account request
INSERT INTO account_requests (full_name, email, password, status)
VALUES ('Test User', 'testuser@example.com', 'SecurePassword123!', 'pending')
RETURNING *;
```

### Step 2: Approve the Request

```sql
-- Get an admin user ID first
SELECT id, email FROM profiles WHERE role = 'admin' LIMIT 1;

-- Approve the account request (replace ADMIN_ID with actual admin ID)
UPDATE account_requests 
SET 
  status = 'approved',
  approved_by = 'ADMIN_ID_HERE',
  approved_at = NOW()
WHERE email = 'testuser@example.com'
RETURNING *;
```

### Step 3: Verify User Creation

```sql
-- Check if user was created in auth.users
SELECT 
  id, 
  email, 
  email_confirmed_at,
  confirmed_at,
  is_sso_user,
  is_anonymous,
  created_at
FROM auth.users 
WHERE email = 'testuser@example.com';
```

### Step 4: Verify Profile Creation

```sql
-- Check if profile was created
SELECT 
  id,
  email,
  full_name,
  role,
  approval_status,
  approved_by,
  approved_at,
  created_at
FROM profiles 
WHERE email = 'testuser@example.com';
```

### Step 5: Test Login

Try logging in with:
- Email: `testuser@example.com`
- Password: `SecurePassword123!`

## Expected Results

### ✅ Success Indicators:

1. **Account Request:**
   - Status changed to 'approved'
   - approved_by and approved_at are set

2. **Auth User:**
   - User exists in auth.users
   - email_confirmed_at is set
   - confirmed_at is set
   - is_sso_user = false
   - is_anonymous = false
   - encrypted_password is set (bcrypt hash)

3. **Profile:**
   - Profile exists with same ID as auth.users
   - email matches
   - full_name matches
   - role = 'user'
   - approval_status = 'approved'

4. **Login:**
   - User can successfully login
   - Session is created
   - Redirected to dashboard

## Check Logs

View trigger execution logs in Supabase:

```
https://supabase.com/dashboard/project/nqcddjtthriiisucfxoy/logs
```

Look for these log messages:
- ✅ `Processing approval for email: testuser@example.com`
- ✅ `Creating new user with email: testuser@example.com`
- ✅ `User created in auth.users with ID: [uuid]`
- ✅ `Profile created successfully for user: testuser@example.com`

## Cleanup Test Data

After testing, clean up:

```sql
-- Delete test user (cascade will handle profile)
DELETE FROM auth.users WHERE email = 'testuser@example.com';

-- Delete test account request
DELETE FROM account_requests WHERE email = 'testuser@example.com';
```

## Troubleshooting

### If User Creation Fails:

1. **Check Logs:**
   ```sql
   -- Enable detailed logging
   SET client_min_messages TO NOTICE;
   
   -- Then run the approval UPDATE again
   ```

2. **Check Password:**
   ```sql
   -- Verify password exists in account_requests
   SELECT id, email, 
          CASE WHEN password IS NULL THEN 'NULL' 
               WHEN password = '' THEN 'EMPTY' 
               ELSE 'EXISTS' 
          END as password_status
   FROM account_requests 
   WHERE email = 'testuser@example.com';
   ```

3. **Check Constraints:**
   ```sql
   -- Verify no duplicate email
   SELECT COUNT(*) FROM auth.users WHERE email = 'testuser@example.com';
   SELECT COUNT(*) FROM profiles WHERE email = 'testuser@example.com';
   ```

### Common Errors:

| Error | Cause | Solution |
|-------|-------|----------|
| "password is missing" | password field is NULL or empty | Ensure password is set before approval |
| "duplicate key value" | User already exists | Check auth.users and profiles for existing user |
| "null value in column" | Missing required field | Check trigger function has all required fields |

## Integration with N8N

When N8N creates account requests, ensure:

1. ✅ `full_name` is provided
2. ✅ `email` is valid and unique
3. ✅ `password` is plain text (trigger will hash it)
4. ✅ `status` starts as 'pending'

N8N should NOT:
- ❌ Hash the password (trigger does this)
- ❌ Create auth.users directly
- ❌ Create profiles directly

The trigger handles all user creation automatically when status changes to 'approved'.
