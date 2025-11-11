# ClearAI Testing Guide

## Account Request System Testing

### Prerequisites
- ✅ Resend API key configured in Supabase
- ✅ Edge Function deployed (notify-admins v3)
- ✅ Database RLS policies configured
- ✅ Admin accounts set up

### Test 1: Submit Account Request

1. **Navigate to Request Page**
   - Go to `/request-account` route
   - Verify ClearAI logo displays correctly
   - Check page layout and styling

2. **Fill Out Form**
   - Full Name: Enter any name (e.g., "John Doe")
   - Email: Enter valid email (e.g., "john@example.com")
   - Password: Enter password (min 8 characters)
   - Confirm Password: Enter same password
   - Message: Optional message

3. **Submit Form**
   - Click "Submit Request" button
   - Button should show loading state
   - Watch browser console for logs:
     ```
     Submitting account request...
     Account request created: {id: "...", ...}
     Sending email notification to admins...
     Email notification sent successfully
     ```

4. **Verify Success**
   - Success message should appear
   - Page should show confirmation screen
   - Green checkmark icon displayed
   - Message: "Your account request has been submitted successfully"

### Test 2: Verify Email Notifications

1. **Check Admin Inboxes**
   - Check: Dmanopla91@gmail.com
   - Check: sahilcharandwary@gmail.com
   - Look in inbox and spam folder

2. **Email Content Verification**
   - Subject: "🔔 New ClearAI Account Request from [Name]"
   - From: "ClearAI <onboarding@resend.dev>"
   - Contains: Full name, email, message
   - Has: "Go to Admin Dashboard" button
   - Styling: ClearAI gradient header (dark blue to cyan)

3. **Email Delivery Time**
   - Should arrive within 1-2 minutes
   - If delayed, check Resend dashboard logs

### Test 3: Admin Dashboard Review

1. **Login as Admin**
   - Use admin account (Dmanopla91@gmail.com or sahilcharandwary@gmail.com)
   - Navigate to `/admin` route

2. **View Account Requests**
   - Should see "Account Requests" section
   - Statistics cards show counts:
     - Pending requests
     - Approved requests
     - Rejected requests

3. **Request Details**
   - Each request shows:
     - Full name
     - Email address
     - Message (if provided)
     - Status badge (Pending/Approved/Rejected)
     - Created date
     - Action buttons

### Test 4: Approve Account Request

1. **Click Approve Button**
   - Find pending request
   - Click green "Approve" button
   - Confirm action if prompted

2. **Verify Account Creation**
   - New user account created in Supabase Auth
   - Profile created in profiles table
   - Request status updated to "approved"
   - Success toast notification shown

3. **Test New Account Login**
   - Logout from admin account
   - Go to `/login` page
   - Login with approved email and password
   - Should successfully access application

### Test 5: Reject Account Request

1. **Click Reject Button**
   - Find pending request
   - Click red "Reject" button
   - Confirm action if prompted

2. **Verify Rejection**
   - Request status updated to "rejected"
   - No user account created
   - Success toast notification shown
   - Request remains in list with "Rejected" badge

### Test 6: Error Handling

#### Test Invalid Email
1. Enter invalid email formats:
   - "notanemail"
   - "test@"
   - "@example.com"
   - "test@.com"
2. Should show error: "Please enter a valid email address"

#### Test Password Mismatch
1. Enter different passwords in password fields
2. Should show error: "Passwords do not match"

#### Test Short Password
1. Enter password less than 8 characters
2. Should show error: "Password must be at least 8 characters long"

#### Test Duplicate Email
1. Submit request with email that already exists
2. Should show error: "An account request with this email already exists"

### Test 7: Console Logging

Open browser console and verify logs during submission:

```javascript
// Expected console output:
Submitting account request... {full_name: "John Doe", email: "john@example.com"}
Account request created: {id: "uuid-here", full_name: "John Doe", ...}
Sending email notification to admins...
Email notification sent successfully
```

If errors occur, they will be logged with details.

### Test 8: Database Verification

Check database directly (for developers):

```sql
-- View all account requests
SELECT id, full_name, email, status, created_at 
FROM account_requests 
ORDER BY created_at DESC;

-- View pending requests only
SELECT * FROM account_requests WHERE status = 'pending';

-- View approved users
SELECT id, email, full_name, role, approval_status 
FROM profiles 
WHERE approval_status = 'approved';
```

### Test 9: Edge Function Logs

Check Supabase Edge Function logs:

1. Go to Supabase Dashboard
2. Navigate to Edge Functions → notify-admins
3. Check logs for:
   - Successful email sends
   - Any errors or warnings
   - Email notification results

### Test 10: Resend Dashboard

Verify emails in Resend dashboard:

1. Login to [resend.com](https://resend.com)
2. Go to Logs section
3. Check recent emails:
   - Status: Delivered
   - Recipients: Both admin emails
   - No bounce or spam reports

## Common Issues and Solutions

### Issue: Form Submission Fails

**Symptoms:**
- Error message appears
- Console shows error
- Request not saved to database

**Solutions:**
1. Check browser console for specific error
2. Verify Supabase connection (check .env file)
3. Check RLS policies allow public insert
4. Verify network connection

### Issue: Email Not Received

**Symptoms:**
- Form submits successfully
- No email in admin inboxes
- Not in spam folder

**Solutions:**
1. Check Resend API key is configured
2. Verify Edge Function deployed (version 3)
3. Check Resend dashboard for delivery status
4. Check Edge Function logs for errors
5. Verify admin email addresses are correct

### Issue: Approval Fails

**Symptoms:**
- Click approve button
- Error message appears
- User account not created

**Solutions:**
1. Check admin has proper permissions
2. Verify Supabase Auth is enabled
3. Check profiles table exists
4. Review Edge Function logs
5. Ensure request is in "pending" status

### Issue: Logo Not Showing

**Symptoms:**
- Broken image icon
- Fallback text logo appears

**Solutions:**
1. Check `/clearai-logo.png` exists in public folder
2. Clear browser cache
3. Verify image file is valid PNG
4. Check browser console for 404 errors

## Performance Benchmarks

### Expected Response Times
- Form submission: < 1 second
- Email delivery: 1-2 minutes
- Account approval: < 2 seconds
- Page load: < 1 second

### Scalability
- Database: Handles 1000s of requests
- Email: 100 emails/day (free tier)
- Edge Function: Auto-scales

## Security Checklist

- ✅ Passwords hashed before storage
- ✅ RLS policies prevent unauthorized access
- ✅ Admin-only approval process
- ✅ Email validation prevents invalid addresses
- ✅ CORS configured properly
- ✅ API keys stored as secrets
- ✅ No sensitive data in logs

## Next Steps After Testing

1. **Production Deployment**
   - Deploy to production environment
   - Update APP_URL in Supabase secrets
   - Test with real admin emails

2. **Domain Verification** (Optional)
   - Verify custom domain in Resend
   - Update sender email in Edge Function
   - Improves email deliverability

3. **Monitoring Setup**
   - Set up error tracking
   - Monitor email delivery rates
   - Track account request metrics

4. **User Documentation**
   - Create user guide for requesting accounts
   - Document approval process for admins
   - FAQ for common questions

## Support

If you encounter issues not covered in this guide:

1. Check browser console for errors
2. Review Supabase Edge Function logs
3. Check Resend dashboard for email status
4. Verify all environment variables are set
5. Review database RLS policies

For additional help, contact the development team.
