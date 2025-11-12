# Email Workflow Documentation

## Overview
The ClearAI application uses Supabase Edge Functions with Resend for email notifications. This document explains the email workflow and configuration.

## Email Workflows

### 1. Account Request Workflow
**Trigger:** User submits a request for account access via `/request-account` page

**Flow:**
1. User fills out the Request Account form (name, email, reason)
2. System creates a record in `account_requests` table
3. System calls `notify-admins` Edge Function
4. Admin receives email notification about the new request
5. Admin logs into the system and views pending requests in Admin Dashboard
6. Admin clicks "Approve" button
7. System generates a secure password
8. System creates the user account with the generated password
9. System calls `send-password-email` Edge Function
10. User receives email with their login credentials

**Admin Email Content:**
- Subject: "New Account Request - ClearAI"
- Contains: User's name, email, and reason for access
- Action: Admin must log into the system to approve/reject

### 2. Password Reset Workflow
**Trigger:** User clicks "Forgot Password" on login page

**Flow:**
1. User enters their email on `/forgot-password` page
2. System verifies email exists in the database
3. System creates a record in `password_reset_requests` table
4. System calls `notify-password-reset` Edge Function
5. Admin receives email notification about the password reset request
6. Admin logs into the system and views pending requests in Admin Dashboard
7. Admin clicks "Approve" button
8. System generates a new secure password
9. System updates the user's password in the database
10. System calls `send-password-email` Edge Function
11. User receives email with their new password

**Admin Email Content:**
- Subject: "Password Reset Request - ClearAI"
- Contains: User's name and email
- Action: Admin must log into the system to approve/reject

## Edge Functions

### 1. notify-admins
**Path:** `/supabase/functions/notify-admins/index.ts`
**Purpose:** Sends email notifications to admins about new account requests
**Trigger:** Called from RequestAccount page after form submission

### 2. notify-password-reset
**Path:** `/supabase/functions/notify-password-reset/index.ts`
**Purpose:** Sends email notifications to admins about password reset requests
**Trigger:** Called from ForgotPassword page after email verification

### 3. send-password-email
**Path:** `/supabase/functions/send-password-email/index.ts`
**Purpose:** Sends password to users via email
**Trigger:** Called after admin approves account request or password reset
**Parameters:**
- `email`: User's email address
- `userName`: User's display name
- `password`: Generated password
- `isNewAccount`: Boolean indicating if this is a new account or password reset

## Email Service Configuration

### Resend API
The application uses Resend (https://resend.com) for sending emails.

**Required Environment Variable:**
- `RESEND_API_KEY`: Your Resend API key

**Setting up Resend:**
1. Create an account at https://resend.com
2. Verify your domain or use Resend's test domain
3. Generate an API key
4. Add the API key to Supabase Secrets (already configured)

### Current Configuration
- **From Email:** `onboarding@resend.dev` (Resend test domain)
- **Admin Email:** `dmanopla91@gmail.com` (configured in Edge Functions)

**For Production:**
You should:
1. Verify your own domain in Resend
2. Update the `from` email in Edge Functions to use your domain
3. Update the admin email list in Edge Functions

## Why No Accept/Reject Links in Emails?

The current implementation requires admins to log into the system to approve/reject requests. This is a **security best practice** for several reasons:

### Security Benefits:
1. **Authentication Required:** Admins must be logged in, preventing unauthorized access
2. **Audit Trail:** All actions are logged with admin ID and timestamp
3. **Context:** Admins can see full request details before deciding
4. **No Token Exposure:** No sensitive tokens in email that could be intercepted
5. **Centralized Management:** All requests managed in one secure location

### Alternative: Email Links with Tokens
If you want to add Accept/Reject links in emails, you would need to:

1. **Generate Secure Tokens:**
   - Create unique, time-limited tokens for each request
   - Store tokens in database with expiration time
   - Include token in email links

2. **Create Public Endpoints:**
   - Create Edge Functions for approve/reject actions
   - Validate tokens before processing
   - Handle expired tokens gracefully

3. **Security Considerations:**
   - Tokens should expire after 24-48 hours
   - Tokens should be single-use only
   - Still require admin authentication for sensitive actions
   - Log all actions for audit purposes

### Recommendation:
**Keep the current implementation** (login required) because:
- More secure
- Better audit trail
- Admins can review full context
- Prevents accidental approvals
- No risk of token interception

If you still want email links, you can implement them using n8n workflows, but you'll need to:
1. Create a token generation system
2. Create public API endpoints
3. Handle token validation and expiration
4. Ensure proper security measures

## Testing the Email Workflow

### Test Account Request:
1. Go to `/request-account`
2. Fill out the form
3. Check admin email for notification
4. Log in as admin
5. Go to Admin Dashboard
6. Approve the request
7. Check user email for password

### Test Password Reset:
1. Go to `/forgot-password`
2. Enter your email
3. Check admin email for notification
4. Log in as admin
5. Go to Admin Dashboard → Password Reset Requests
6. Approve the request
7. Check user email for new password

## Troubleshooting

### Emails Not Being Sent
1. Check Resend API key is configured correctly
2. Check Edge Function logs in Supabase Dashboard
3. Verify email addresses are valid
4. Check Resend dashboard for delivery status

### Admin Not Receiving Notifications
1. Verify admin email is correct in Edge Functions
2. Check spam/junk folder
3. Verify Resend domain is verified (for production)

### User Not Receiving Password
1. Check user email is correct
2. Check spam/junk folder
3. Verify Edge Function was called successfully
4. Check Resend dashboard for delivery status

## Future Enhancements

Possible improvements:
1. Add multiple admin email addresses
2. Add email templates with better styling
3. Add email preferences for admins
4. Add SMS notifications as alternative
5. Add in-app notifications
6. Add email verification for new accounts
7. Add rate limiting for password reset requests
