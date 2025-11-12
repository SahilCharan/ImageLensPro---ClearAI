# Admin Setup Guide

## Overview

This guide explains how to set up admin users for the ClearAI Image Text Error Detection system.

---

## Current Admin Status

### ✅ Completed

1. **Sahil** - `sahilcharandwary@gmal.com` (note: typo in email)
   - Status: **PROMOTED TO ADMIN** ✅
   - Can now access admin dashboard
   - Can approve/reject account requests
   - Can manage all system data

### ⏳ Pending

2. **Dmano** - `Dmanopla91@gmail.com`
   - Status: **ACCOUNT REQUEST CREATED** ⏳
   - Request ID: `b82f7bbb-a875-4e53-88c3-fc2f968d2453`
   - Temporary Password: `TempAdmin@123`
   - **Action Required**: Approve request and promote to admin

---

## How to Complete Dmano's Admin Setup

### Option 1: Through Admin Dashboard (Recommended)

#### Step 1: Login as Sahil (Current Admin)
1. Go to the login page
2. Email: `sahilcharandwary@gmal.com`
3. Password: (Sahil's current password)
4. Click "Login"

#### Step 2: Access Admin Dashboard
1. After login, click on "Admin Dashboard" in the navigation
2. Click on the "Account Requests" tab
3. You should see Dmano's pending request

#### Step 3: Approve Dmano's Request
1. Find the request for "Dmano" (Dmanopla91@gmail.com)
2. Click the "Approve" button
3. Wait for confirmation message
4. Dmano's account will be created with role "user"

#### Step 4: Promote Dmano to Admin
After approval, you need to promote Dmano to admin role.

**Method A: Using Supabase SQL Editor**
1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Run this query:
```sql
SELECT promote_user_to_admin('Dmanopla91@gmail.com');
```
4. Verify the result shows role = 'admin'

**Method B: Using Database Direct Update**
1. Go to Supabase Dashboard
2. Navigate to Table Editor
3. Open the `profiles` table
4. Find Dmano's profile (email: Dmanopla91@gmail.com)
5. Edit the `role` field
6. Change from `user` to `admin`
7. Save changes

#### Step 5: Verify Admin Access
1. Logout from Sahil's account
2. Login as Dmano:
   - Email: `Dmanopla91@gmail.com`
   - Password: `TempAdmin@123`
3. You should see "Admin Dashboard" in navigation
4. Access admin dashboard to verify permissions
5. **IMPORTANT**: Change password after first login!

---

### Option 2: Direct SQL Approach (Advanced)

If you have direct access to Supabase SQL Editor:

#### Step 1: Check Current Status
```sql
-- Check if Dmano's account request exists
SELECT id, full_name, email, status, created_at 
FROM account_requests 
WHERE email = 'Dmanopla91@gmail.com';
```

#### Step 2: Manually Create User (If Needed)
**Note**: This requires Supabase Admin API access, which is not available in SQL.
Instead, use the admin dashboard approval process.

#### Step 3: Promote to Admin
After the account is created through approval:
```sql
-- Promote Dmano to admin
SELECT promote_user_to_admin('Dmanopla91@gmail.com');

-- Verify
SELECT email, role FROM profiles WHERE email = 'Dmanopla91@gmail.com';
```

---

## Verify All Admin Users

### Check Current Admins

Run this query in Supabase SQL Editor:
```sql
SELECT 
  email, 
  role, 
  created_at,
  approval_status
FROM profiles 
WHERE role = 'admin' 
ORDER BY email;
```

### Expected Result

After completing all steps, you should see:

| email | role | created_at | approval_status |
|-------|------|------------|-----------------|
| Dmanopla91@gmail.com | admin | 2025-11-12... | approved |
| mock@example.com | admin | 2025-11-07... | NULL |
| sahilcharandwary@gmal.com | admin | 2025-11-10... | NULL |

---

## Testing Admin Functionality

### Test 1: Login as Each Admin

#### Sahil
- Email: `sahilcharandwary@gmal.com`
- Password: (existing password)
- Expected: Access to admin dashboard

#### Dmano
- Email: `Dmanopla91@gmail.com`
- Password: `TempAdmin@123` (change after first login!)
- Expected: Access to admin dashboard

### Test 2: Access Admin Dashboard

1. Login as admin user
2. Navigate to "Admin Dashboard"
3. Verify you can see:
   - Account Requests tab
   - List of pending requests
   - Approve/Reject buttons
   - User management features

### Test 3: Approve Account Request

1. Create a test account request:
   - Go to `/request-account`
   - Fill in test details
   - Submit request
2. Login as admin
3. Go to Admin Dashboard → Account Requests
4. Find the test request
5. Click "Approve"
6. Verify:
   - Request status changes to "approved"
   - New user account is created
   - User can login with provided credentials

### Test 4: Reject Account Request

1. Create another test account request
2. Login as admin
3. Go to Admin Dashboard → Account Requests
4. Find the test request
5. Click "Reject"
6. Verify:
   - Request status changes to "rejected"
   - No user account is created
   - Request is marked as rejected

---

## Admin Permissions

### What Admins Can Do

✅ **Account Management**
- View all account requests
- Approve account requests (creates user accounts)
- Reject account requests
- View all user profiles

✅ **Image Management**
- View all uploaded images
- View all error detection results
- Delete images
- Manage image data

✅ **System Access**
- Access admin dashboard
- View system statistics
- Manage user roles (through SQL)
- Access all features

### What Admins Cannot Do

❌ **Direct User Creation**
- Cannot create users without account request
- Must go through approval process

❌ **Password Reset**
- Not yet implemented
- Users must contact admin for help

❌ **Email Verification**
- Not yet implemented
- All accounts are auto-verified on approval

---

## Security Considerations

### Password Security

1. **Temporary Passwords**
   - Dmano's temporary password: `TempAdmin@123`
   - **MUST be changed after first login**
   - Use strong password (min 8 chars, mix of upper/lower/numbers/symbols)

2. **Password Requirements**
   - Minimum 6 characters (current)
   - Recommended: 8+ characters with complexity
   - No password expiration (yet)

### Account Security

1. **Admin Role Protection**
   - Admin role cannot be changed by users themselves
   - Only database admins can promote/demote users
   - Use `promote_user_to_admin()` function for promotions

2. **Email Verification**
   - Currently auto-verified on approval
   - Consider implementing email verification in future

3. **Session Management**
   - Sessions expire after inactivity
   - Users must re-login after session expires
   - No "remember me" feature (yet)

---

## Troubleshooting

### Issue: Can't Login as Sahil

**Possible Causes:**
1. Wrong password
2. Email typo (remember it's @gmal.com not @gmail.com)
3. Account not yet created

**Solution:**
1. Verify email: `sahilcharandwary@gmal.com` (note the typo)
2. Try password reset (if implemented)
3. Check if account exists:
```sql
SELECT email, role FROM profiles WHERE email LIKE '%sahil%';
```

### Issue: Dmano's Account Request Not Found

**Solution:**
1. Check if request exists:
```sql
SELECT * FROM account_requests WHERE email = 'Dmanopla91@gmail.com';
```
2. If not found, create manually:
```sql
INSERT INTO account_requests (full_name, email, password_hash, message, status)
VALUES (
  'Dmano',
  'Dmanopla91@gmail.com',
  crypt('TempAdmin@123', gen_salt('bf')),
  'Admin account creation',
  'pending'
);
```

### Issue: Approval Button Not Working

**Possible Causes:**
1. Not logged in as admin
2. Request already processed
3. Network error

**Solution:**
1. Verify admin status:
```sql
SELECT email, role FROM profiles WHERE email = 'sahilcharandwary@gmal.com';
```
2. Check request status:
```sql
SELECT status FROM account_requests WHERE email = 'Dmanopla91@gmail.com';
```
3. Check browser console for errors
4. Try refreshing the page

### Issue: Dmano Can't Access Admin Dashboard

**Possible Causes:**
1. Account not promoted to admin
2. Role still set to "user"
3. Cache issue

**Solution:**
1. Verify role:
```sql
SELECT email, role FROM profiles WHERE email = 'Dmanopla91@gmail.com';
```
2. If role is "user", promote to admin:
```sql
SELECT promote_user_to_admin('Dmanopla91@gmail.com');
```
3. Clear browser cache and re-login
4. Check console for errors

---

## Email Notifications

### Admin Email Addresses

When new account requests are submitted, emails are sent to:
- `Dmanopla91@gmail.com`
- `sahilcharandwary@gmail.com`

**Note**: Sahil's profile has typo (@gmal.com) but email notifications use correct address (@gmail.com)

### Email Configuration

- **Service**: Resend API
- **Sender**: `onboarding@resend.dev`
- **API Key**: Configured in Supabase Edge Function
- **Template**: HTML email with request details

### Troubleshooting Emails

If emails are not received:
1. Check spam/junk folder
2. Verify RESEND_API_KEY is set in Supabase
3. Check Edge Function logs:
   - Go to Supabase Dashboard
   - Navigate to Edge Functions
   - Select `notify-admins` function
   - Check logs for errors
4. Test email manually:
   - Submit a test account request
   - Check if email is sent
   - Verify email content

---

## Next Steps

### Immediate Actions

1. ✅ **Sahil**: Login and verify admin access
2. ⏳ **Sahil**: Approve Dmano's account request
3. ⏳ **Sahil**: Promote Dmano to admin (using SQL function)
4. ⏳ **Dmano**: Login with temporary password
5. ⏳ **Dmano**: Change password immediately
6. ⏳ **Both**: Test admin dashboard functionality

### Future Improvements

1. **Password Reset**
   - Implement forgot password feature
   - Email password reset links
   - Secure token generation

2. **Email Verification**
   - Send verification email on account creation
   - Require email verification before login
   - Resend verification email option

3. **User Management UI**
   - Admin page to manage users
   - Promote/demote users through UI
   - Delete user accounts
   - Reset user passwords

4. **Audit Logging**
   - Log all admin actions
   - Track who approved/rejected requests
   - Monitor system changes
   - Export audit logs

5. **Role-Based Permissions**
   - Define granular permissions
   - Create different admin levels
   - Implement permission checks
   - UI based on permissions

---

## SQL Helper Functions

### Promote User to Admin
```sql
SELECT promote_user_to_admin('user@example.com');
```

### Check Admin Users
```sql
SELECT email, role, created_at 
FROM profiles 
WHERE role = 'admin' 
ORDER BY email;
```

### Check Pending Requests
```sql
SELECT id, full_name, email, status, created_at 
FROM account_requests 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

### Manually Approve Request (Advanced)
```sql
-- Update request status
UPDATE account_requests 
SET status = 'approved', approved_at = now() 
WHERE email = 'user@example.com';

-- Then use admin dashboard to create the actual user account
```

### Demote Admin to User
```sql
UPDATE profiles 
SET role = 'user' 
WHERE email = 'user@example.com';
```

---

## Summary

### Current Status

✅ **Sahil**: Admin access configured  
⏳ **Dmano**: Account request created, needs approval and promotion  
✅ **System**: Ready for admin operations  
✅ **Email**: Notifications configured  

### Required Actions

1. Login as Sahil
2. Approve Dmano's request
3. Promote Dmano to admin
4. Test both admin accounts
5. Change Dmano's password

### Support

If you encounter any issues:
1. Check this guide's troubleshooting section
2. Review console logs for errors
3. Check Supabase logs
4. Verify database state with SQL queries
5. Contact system administrator

---

**Last Updated**: 2025-11-12  
**Status**: Sahil promoted, Dmano pending  
**Next Action**: Approve Dmano's request and promote to admin
