# Troubleshooting Guide - ClearAI Application

## Issue 1: Profile Dropdown with Logout Not Working

### Problem
User cannot see or access the logout option in the profile dropdown.

### Solution
The logout functionality is already implemented. Here's how to access it:

**Steps to Sign Out:**
1. Look at the **top-right corner** of the screen after logging in
2. You should see a button with your avatar/profile picture and name
3. **Click on this button** (it has a border and shows your name)
4. A dropdown menu will appear with several options:
   - Your profile information (name and email)
   - Home
   - Dashboard
   - Process Image
   - Admin Panel (if you're an admin)
   - **Sign Out** button (red button at the bottom)
5. Click the **"Sign Out"** button to log out

### Visual Guide
```
┌─────────────────────────────────────────┐
│  ClearAI Logo    Dashboard  Process  [👤 Your Name ▼] │
└─────────────────────────────────────────┘
                                          │
                    Click here ───────────┘
                                          │
                                          ▼
                    ┌──────────────────────────┐
                    │  👤 Your Name            │
                    │  your@email.com          │
                    ├──────────────────────────┤
                    │  🏠 Home                 │
                    │  📊 Dashboard            │
                    │  📤 Process Image        │
                    │  🛡️ Admin Panel          │
                    ├──────────────────────────┤
                    │  [🚪 Sign Out]  ← Click  │
                    └──────────────────────────┘
```

### If You Still Can't See It
1. **Refresh the page** (Ctrl+R or Cmd+R)
2. **Clear browser cache** and reload
3. **Check if you're logged in** - the button only appears when logged in
4. **Try a different browser** to rule out browser-specific issues
5. **Check browser console** for errors (F12 → Console tab)

---

## Issue 2: Not Receiving Approve/Reject Options for Account Requests

### Problem
When someone submits an account request, the admin doesn't receive approve/reject options.

### Understanding the Workflow

The system works in **two steps**:

#### Step 1: Email Notification (Informational Only)
When a user submits an account request:
1. ✅ Request is saved to database
2. ✅ Admin receives an **email notification**
3. ⚠️ **The email does NOT have approve/reject buttons** (this is by design for security)
4. ✅ Email contains a link to the Admin Dashboard

#### Step 2: Admin Dashboard (Where You Approve/Reject)
To approve or reject requests:
1. **Log in to ClearAI** as an admin
2. **Go to Admin Dashboard** (click "Admin Panel" in your profile dropdown)
3. **Look for "Account Requests" section**
4. **You'll see all pending requests** with:
   - User's name
   - User's email
   - Request date
   - **Approve button** (green)
   - **Reject button** (red)

### Why No Buttons in Email?

**Security Reasons:**
- ✅ Requires admin to be logged in
- ✅ Creates audit trail with admin ID
- ✅ Prevents token interception
- ✅ Allows admin to see full context
- ✅ Prevents accidental approvals

### How to Approve/Reject Requests

**Step-by-Step Process:**

1. **Check Your Email**
   - You should receive: "🔔 New ClearAI Account Request from [Name]"
   - Email contains: Name, Email, Message
   - Email has a link: "Go to Admin Dashboard →"

2. **Log In to ClearAI**
   - Go to the ClearAI website
   - Log in with your admin account

3. **Navigate to Admin Dashboard**
   - Click on your profile picture (top-right)
   - Click "Admin Panel" or "Admin Dashboard"
   - OR click the link in the email

4. **Find Account Requests**
   - You'll see a section called "Account Requests"
   - It shows:
     - **Pending Requests**: Yellow number
     - **Approved**: Green number
     - **Rejected**: Red number

5. **Review the Request**
   - Click "Details" to see the full message
   - Review the user's information

6. **Approve the Request**
   - Click the green "Approve" button
   - A dialog will appear with a generated password
   - You can regenerate the password if needed
   - Click "Approve & Send"
   - The user will receive an email with their password

7. **Or Reject the Request**
   - Click the red "Reject" button
   - Confirm the rejection
   - The request will be marked as rejected

### Checking If Emails Are Being Sent

**Test the Email System:**

1. **Submit a Test Request**
   - Go to `/request-account` page
   - Fill out the form with test data
   - Submit the request

2. **Check Browser Console**
   - Press F12 to open Developer Tools
   - Go to "Console" tab
   - Look for these messages:
     ```
     ✅ Email notification sent successfully to admins
     ```
   - If you see errors, note them down

3. **Check Admin Email**
   - Check inbox for: "🔔 New ClearAI Account Request"
   - Check spam/junk folder
   - Wait a few minutes (email can be delayed)

4. **Check Admin Dashboard**
   - Log in as admin
   - Go to Admin Panel
   - Check if the request appears in "Account Requests"
   - If it appears, the database is working correctly

### Common Issues and Solutions

#### Issue: Email Not Received

**Possible Causes:**
1. **Email in Spam Folder**
   - Check your spam/junk folder
   - Mark as "Not Spam" if found

2. **Wrong Admin Email**
   - Current admin emails: `Dmanopla91@gmail.com`, `sahilcharandwary@gmail.com`
   - If your email is different, it needs to be added to the system

3. **Resend API Key Not Configured**
   - Check if RESEND_API_KEY is set in Supabase
   - Contact system administrator

4. **Email Service Issue**
   - Check Resend dashboard for delivery status
   - Check Edge Function logs in Supabase

**How to Fix:**
```
1. Verify your email is in the admin list
2. Check Supabase Edge Function logs
3. Check Resend dashboard
4. Contact support if issue persists
```

#### Issue: Request Not Showing in Admin Dashboard

**Possible Causes:**
1. **Not Logged In as Admin**
   - Only admin users can see the Admin Panel
   - Check if you have admin role

2. **Database Connection Issue**
   - Check browser console for errors
   - Try refreshing the page

3. **Request Failed to Submit**
   - Check if user saw success message
   - Check database directly

**How to Fix:**
```
1. Verify you're logged in as admin
2. Check your role in profile
3. Refresh the Admin Dashboard
4. Check browser console for errors
```

#### Issue: Approve Button Not Working

**Possible Causes:**
1. **JavaScript Error**
   - Check browser console for errors

2. **Network Issue**
   - Check internet connection
   - Check if Supabase is accessible

3. **Permission Issue**
   - Verify you have admin permissions

**How to Fix:**
```
1. Open browser console (F12)
2. Click Approve button
3. Check for error messages
4. Try refreshing the page
5. Try different browser
```

### Testing Checklist

Use this checklist to verify everything is working:

- [ ] **User can submit account request**
  - [ ] Form submits successfully
  - [ ] Success message appears
  - [ ] No errors in console

- [ ] **Admin receives email notification**
  - [ ] Email arrives in inbox (check spam)
  - [ ] Email contains correct information
  - [ ] Link to admin dashboard works

- [ ] **Request appears in Admin Dashboard**
  - [ ] Can log in as admin
  - [ ] Can access Admin Panel
  - [ ] Request shows in "Account Requests"
  - [ ] Status shows as "Pending"

- [ ] **Can approve request**
  - [ ] Approve button is visible
  - [ ] Approve button is clickable
  - [ ] Password generation dialog appears
  - [ ] Can regenerate password
  - [ ] Approval succeeds

- [ ] **User receives password email**
  - [ ] Email arrives (check spam)
  - [ ] Email contains password
  - [ ] Password works for login

### Getting Help

If you're still having issues:

1. **Check Browser Console**
   - Press F12
   - Go to Console tab
   - Copy any error messages

2. **Check Network Tab**
   - Press F12
   - Go to Network tab
   - Try the action again
   - Look for failed requests (red)
   - Click on failed request to see details

3. **Check Supabase Logs**
   - Go to Supabase Dashboard
   - Navigate to Edge Functions
   - Check logs for `notify-admins` function
   - Look for errors or warnings

4. **Provide This Information**
   - What you were trying to do
   - What happened instead
   - Any error messages from console
   - Screenshots if possible
   - Browser and version

### Quick Reference

**Admin Email Addresses:**
- `Dmanopla91@gmail.com`
- `sahilcharandwary@gmail.com`

**Admin Dashboard URL:**
- `/admin` (must be logged in as admin)

**Request Account URL:**
- `/request-account` (public access)

**Edge Functions:**
- `notify-admins` - Sends email to admins
- `send-password-email` - Sends password to users

**Database Tables:**
- `account_requests` - Stores account requests
- `profiles` - Stores user profiles
- `password_reset_requests` - Stores password reset requests

---

## Additional Resources

- **Email Workflow Documentation**: See `EMAIL_WORKFLOW.md`
- **Fixes Summary**: See `FIXES_SUMMARY.md`
- **Supabase Dashboard**: Check Edge Function logs
- **Resend Dashboard**: Check email delivery status

---

## Still Need Help?

If none of the above solutions work:

1. **Verify System Status**
   - Check if Supabase is online
   - Check if Resend is online
   - Check if application is deployed

2. **Contact Support**
   - Provide error messages
   - Provide steps to reproduce
   - Provide browser console logs
   - Provide screenshots

3. **Check Documentation**
   - Read `EMAIL_WORKFLOW.md` for email details
   - Read `FIXES_SUMMARY.md` for recent changes
   - Check migration files for database schema
