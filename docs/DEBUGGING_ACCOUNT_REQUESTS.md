# Debugging Account Request Submission Issues

## Overview
This guide will help you diagnose and fix issues with the account request submission form.

## Step 1: Open Browser Console

### Chrome/Edge
1. Press `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
2. Click on the "Console" tab

### Firefox
1. Press `F12` or `Ctrl+Shift+K` (Windows/Linux) or `Cmd+Option+K` (Mac)
2. Click on the "Console" tab

### Safari
1. Enable Developer Menu: Safari → Preferences → Advanced → Show Develop menu
2. Press `Cmd+Option+C`

## Step 2: Clear Console and Submit Form

1. Click the "Clear console" button (🚫 icon) in the console
2. Go to the account request form at `/request-account`
3. Fill out the form with test data:
   - Full Name: Test User
   - Email: test@example.com
   - Password: password123
   - Confirm Password: password123
   - Message: Testing account request
4. Click "Submit Request"
5. Watch the console for log messages

## Step 3: Analyze Console Logs

### Expected Success Flow

You should see these logs in order:

```
Submitting account request... {full_name: "Test User", email: "test@example.com"}
Supabase URL: https://zflgjgdtizwthvmbvitb.supabase.co
Supabase Key exists: true
[API] Creating account request with data: {full_name: "Test User", email: "test@example.com", has_password: true, has_message: true}
[API] Inserting data into account_requests table...
[API] Supabase response: {data: {...}, error: null}
[API] Account request created successfully: {id: "...", full_name: "Test User", ...}
Account request created successfully: {id: "...", ...}
Sending email notification to admins...
Email notification sent successfully
```

### Common Error Patterns

#### Error 1: Missing Supabase Configuration

**Logs:**
```
Error: Missing Supabase environment variables
```

**Solution:**
1. Check `.env` file exists in project root
2. Verify it contains:
   ```
   VITE_SUPABASE_URL=https://zflgjgdtizwthvmbvitb.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Restart the development server

#### Error 2: Network Error

**Logs:**
```
[API] Supabase error: {message: "Failed to fetch", ...}
Account request error: TypeError: Failed to fetch
Error message: Failed to fetch
```

**Possible Causes:**
- No internet connection
- Firewall blocking Supabase
- VPN interfering with connection
- Supabase service down

**Solutions:**
1. Check internet connection
2. Try disabling VPN
3. Check firewall settings
4. Visit https://status.supabase.com to check service status

#### Error 3: Permission Denied

**Logs:**
```
[API] Supabase error: {code: "42501", message: "permission denied for table account_requests"}
```

**Solution:**
This means RLS policies are not configured correctly. Run this SQL in Supabase:

```sql
-- Check if policy exists
SELECT policyname, cmd, roles, with_check 
FROM pg_policies 
WHERE tablename = 'account_requests' AND cmd = 'INSERT';

-- If no INSERT policy exists, create it
CREATE POLICY "Anyone can create account requests" ON account_requests
  FOR INSERT 
  WITH CHECK (true);
```

#### Error 4: Duplicate Email

**Logs:**
```
[API] Supabase error: {code: "23505", message: "duplicate key value violates unique constraint"}
```

**Solution:**
An account request with this email already exists. Either:
1. Use a different email address
2. Delete the existing request from admin dashboard
3. Or run this SQL:
   ```sql
   DELETE FROM account_requests WHERE email = 'test@example.com';
   ```

#### Error 5: Invalid Data

**Logs:**
```
[API] Supabase error: {code: "23502", message: "null value in column ... violates not-null constraint"}
```

**Solution:**
Required field is missing. Check that all required fields are filled:
- full_name
- email
- password

#### Error 6: CORS Error

**Logs:**
```
Access to fetch at 'https://...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**
This is a Supabase configuration issue. Check:
1. Supabase URL is correct in `.env`
2. Anon key is correct in `.env`
3. Project is not paused in Supabase dashboard

## Step 4: Check Supabase Dashboard

### Verify Database Connection

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Table Editor
4. Find `account_requests` table
5. Check if any records exist

### Check RLS Policies

1. In Supabase Dashboard, go to Authentication → Policies
2. Find `account_requests` table
3. Verify these policies exist:
   - "Anyone can create account requests" (INSERT, public role)
   - "Admins can view all account requests" (SELECT, authenticated role)
   - "Admins can update account requests" (UPDATE, authenticated role)
   - "Admins can delete account requests" (DELETE, authenticated role)

### Check Edge Function

1. Go to Edge Functions in Supabase Dashboard
2. Find `notify-admins` function
3. Check status is "Active"
4. Check logs for any errors

## Step 5: Test Direct Database Insert

If the form still doesn't work, test the database directly:

1. Go to Supabase Dashboard → SQL Editor
2. Run this query:

```sql
INSERT INTO account_requests (full_name, email, password_hash, message, status)
VALUES ('Direct Test', 'directtest@example.com', 'password123', 'Direct insert test', 'pending')
RETURNING *;
```

3. If this works, the issue is in the frontend code
4. If this fails, the issue is in the database configuration

## Step 6: Check Network Tab

1. Open browser DevTools (F12)
2. Go to "Network" tab
3. Filter by "Fetch/XHR"
4. Submit the form
5. Look for requests to Supabase
6. Click on the request to see:
   - Request headers
   - Request payload
   - Response status
   - Response body

### Expected Request

**URL:** `https://zflgjgdtizwthvmbvitb.supabase.co/rest/v1/account_requests`
**Method:** POST
**Status:** 201 Created

**Request Headers:**
```
Content-Type: application/json
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Payload:**
```json
{
  "full_name": "Test User",
  "email": "test@example.com",
  "password_hash": "password123",
  "message": "Testing",
  "status": "pending"
}
```

**Response:**
```json
[
  {
    "id": "uuid-here",
    "full_name": "Test User",
    "email": "test@example.com",
    "status": "pending",
    "created_at": "2025-11-12T..."
  }
]
```

## Step 7: Common Solutions

### Solution 1: Restart Development Server

Sometimes environment variables don't load properly:

```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

### Solution 2: Clear Browser Cache

1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Solution 3: Check .env File

Make sure `.env` file is in the project root (not in `src/`):

```
/workspace/app-7dzvb2e20qgx/.env  ✅ Correct
/workspace/app-7dzvb2e20qgx/src/.env  ❌ Wrong
```

### Solution 4: Verify Supabase Project

1. Go to Supabase Dashboard
2. Check project is not paused
3. Check project URL matches `.env` file
4. Regenerate anon key if needed

### Solution 5: Check for JavaScript Errors

Look for any red errors in the console that appear before submission:
- Module not found errors
- Import errors
- Syntax errors

## Step 8: Get Help

If none of the above solutions work, gather this information:

1. **Console Logs:** Copy all console logs from submission attempt
2. **Network Tab:** Screenshot of the failed request
3. **Error Message:** Exact error message shown to user
4. **Browser:** Which browser and version
5. **Environment:** Development or production

Then contact support with this information.

## Quick Checklist

- [ ] `.env` file exists with correct values
- [ ] Development server is running
- [ ] Browser console is open
- [ ] No JavaScript errors before submission
- [ ] Internet connection is working
- [ ] Supabase project is active
- [ ] RLS policies are configured
- [ ] Edge Function is deployed
- [ ] Form validation passes
- [ ] All required fields are filled

## Testing Checklist

After fixing the issue, test these scenarios:

1. **Valid Submission**
   - Fill all fields correctly
   - Should succeed

2. **Duplicate Email**
   - Submit same email twice
   - Should show error

3. **Invalid Email**
   - Enter "notanemail"
   - Should show validation error

4. **Short Password**
   - Enter "pass"
   - Should show validation error

5. **Password Mismatch**
   - Enter different passwords
   - Should show validation error

6. **Empty Fields**
   - Leave fields empty
   - Should show validation errors

## Success Indicators

You'll know it's working when:

1. ✅ Form submits without errors
2. ✅ Success message appears
3. ✅ Confirmation screen shows
4. ✅ Console shows success logs
5. ✅ Email sent to admins
6. ✅ Request appears in admin dashboard
7. ✅ Record exists in database

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Status Page](https://status.supabase.com)
- [Browser DevTools Guide](https://developer.chrome.com/docs/devtools/)
- [Testing Guide](./TESTING_GUIDE.md)
- [Email Setup Guide](./EMAIL_SETUP_GUIDE.md)
