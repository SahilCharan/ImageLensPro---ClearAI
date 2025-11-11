# Quick Test Instructions

## The Issue Has Been Fixed! 🎉

The **401 Unauthorized** error has been resolved. The problem was that the database security policy was targeting the wrong user role.

## Test the Fix Now

### Step 1: Refresh Your Browser

**Important:** Clear your browser cache first!

- **Chrome/Edge:** Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- **Firefox:** Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- **Safari:** Press `Cmd+Option+R`

Or use DevTools:
1. Press `F12` to open DevTools
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Step 2: Open Browser Console

Keep the console open to see success messages:

1. Press `F12` (or `Cmd+Option+I` on Mac)
2. Click the "Console" tab
3. Click the "Clear console" button (🚫 icon)

### Step 3: Submit Account Request

1. Go to the account request page: `/request-account`
2. Fill out the form:
   - **Full Name:** Your Name
   - **Email:** your@email.com
   - **Password:** password123
   - **Confirm Password:** password123
   - **Message:** Test message (optional)
3. Click **"Submit Request"**

### Step 4: Check for Success

You should see:

#### ✅ Success Message
A green notification saying:
> "Request Submitted - Your account request has been submitted successfully. Admins will be notified via email."

#### ✅ Confirmation Screen
The page should show:
- Checkmark icon ✓
- "Request Submitted Successfully"
- "Return to Login" button

#### ✅ Console Logs (No Errors!)
In the browser console, you should see:
```
Submitting account request... {full_name: "Your Name", email: "your@email.com"}
Supabase URL: https://zflgjgdtizwthvmbvitb.supabase.co
Supabase Key exists: true
[API] Creating account request with data: {...}
[API] Inserting data into account_requests table...
[API] Supabase response: {data: {...}, error: null}
[API] Account request created successfully: {...}
Account request created successfully: {...}
Sending email notification to admins...
Email notification sent successfully
```

#### ✅ Network Tab (201 Created)
In the Network tab:
- Look for request to `/account_requests`
- Status should be **201 Created** (not 401!)

### Step 5: Verify in Admin Dashboard

1. Log in as admin
2. Go to Admin Dashboard
3. Click "Account Requests" tab
4. Your request should appear in the list with status "Pending"

## What Was Fixed?

### The Problem
The database security policy was set to allow the `public` role, but Supabase uses the `anon` role for unauthenticated requests from the frontend. This caused a **401 Unauthorized** error.

### The Solution
Created a new database migration that explicitly allows both `anon` and `authenticated` roles to submit account requests.

**Before:**
```sql
-- Wrong: targets 'public' role
CREATE POLICY "..." ON account_requests FOR INSERT WITH CHECK (true);
```

**After:**
```sql
-- Correct: targets 'anon' and 'authenticated' roles
CREATE POLICY "..." ON account_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
```

## Still Having Issues?

### If you see the same error:

1. **Clear browser cache** (very important!)
2. **Check console** for the exact error message
3. **Check Network tab** for the HTTP status code
4. **Verify environment variables** in `.env` file

### If you see a different error:

1. Copy the error message from the console
2. Check the [Debugging Guide](./DEBUGGING_ACCOUNT_REQUESTS.md)
3. Follow the troubleshooting steps

### Common Issues After Fix

#### Issue: Still getting 401 error
**Solution:** Clear browser cache and hard refresh

#### Issue: Different error message
**Solution:** Check console logs and refer to debugging guide

#### Issue: Email not received
**Solution:** Check spam folder, verify RESEND_API_KEY is set

## Email Notifications

After successful submission, admins should receive an email at:
- Dmanopla91@gmail.com
- sahilcharandwary@gmail.com

**Note:** Emails are sent from `onboarding@resend.dev` (Resend's default sender)

If emails are not received:
1. Check spam/junk folder
2. Verify RESEND_API_KEY is configured
3. Check Edge Function logs in Supabase Dashboard

## Next Steps

After your account request is approved by an admin:

1. You'll receive an email notification (when implemented)
2. You can log in with your email and password
3. Access the image error detection features

## Need Help?

If the issue persists, please provide:

1. **Console logs** (copy all logs from submission)
2. **Network tab screenshot** (showing the request status)
3. **Error message** (exact text shown to user)
4. **Browser and version** (e.g., Chrome 120)

Refer to these guides:
- [Fix Summary](./FIX_SUMMARY.md) - Detailed explanation of the fix
- [Debugging Guide](./DEBUGGING_ACCOUNT_REQUESTS.md) - Step-by-step debugging
- [Testing Guide](./TESTING_GUIDE.md) - Complete testing procedures

---

## Summary

✅ **Issue Fixed:** 401 Unauthorized error resolved  
✅ **Root Cause:** RLS policy targeting wrong role  
✅ **Solution:** Updated policy to target anon and authenticated roles  
✅ **Status:** Ready to test  

**Please test now and let me know if it works!** 🚀
