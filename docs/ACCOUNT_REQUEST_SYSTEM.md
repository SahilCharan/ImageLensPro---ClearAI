# ClearAI Account Request System

## Overview

ClearAI uses an admin-approved account creation system where users request access and administrators manually approve each request. This ensures controlled access to the platform.

## System Architecture

### Components

1. **Request Form** (`/request-account`)
   - Public-facing form for users to request accounts
   - Validates email, password, and user information
   - Submits request to database
   - Triggers email notification to admins

2. **Database Tables**
   - `account_requests`: Stores pending, approved, and rejected requests
   - `profiles`: User profiles with approval status

3. **Edge Function** (`notify-admins`)
   - Sends email notifications to administrators
   - Uses Resend API for email delivery
   - Handles errors gracefully

4. **Admin Dashboard** (`/admin`)
   - View all account requests
   - Approve or reject requests
   - Create user accounts from approved requests
   - Manage existing users

## User Flow

### For Users Requesting Access

1. **Visit Request Page**
   - Navigate to `/request-account`
   - See ClearAI branding and form

2. **Fill Out Form**
   - Full Name (required)
   - Email Address (required, validated)
   - Password (required, min 8 characters)
   - Confirm Password (required, must match)
   - Message (optional, explain why you need access)

3. **Submit Request**
   - Click "Submit Request" button
   - See loading indicator
   - Receive confirmation message

4. **Wait for Approval**
   - Admins receive email notification
   - Admins review request in dashboard
   - User receives notification when approved

5. **Login After Approval**
   - Go to `/login` page
   - Enter approved email and password
   - Access ClearAI platform

### For Administrators

1. **Receive Email Notification**
   - Email sent to: Dmanopla91@gmail.com, sahilcharandwary@gmail.com
   - Contains: User details, message, link to dashboard
   - Arrives within 1-2 minutes

2. **Review Request**
   - Login to admin account
   - Navigate to `/admin` page
   - View "Account Requests" section
   - See pending requests with details

3. **Make Decision**
   - **Approve**: Creates user account, sends welcome email
   - **Reject**: Marks request as rejected, no account created
   - **Delete**: Removes request from system (for processed requests)

4. **Manage Users**
   - View all approved users
   - Monitor account activity
   - Manage user roles and permissions

## Technical Details

### Database Schema

#### account_requests Table
```sql
- id (uuid, primary key)
- full_name (text, not null)
- email (text, unique, not null)
- password_hash (text, not null)
- message (text, optional)
- status (text: pending/approved/rejected)
- approved_by (uuid, references profiles.id)
- approved_at (timestamptz)
- created_at (timestamptz)
- updated_at (timestamptz)
```

#### profiles Table (Approval Fields)
```sql
- approval_status (text: pending/approved/rejected)
- approved_by (uuid, references profiles.id)
- approved_at (timestamptz)
```

### Security

#### Row Level Security (RLS)
- Public can INSERT account requests
- Only admins can SELECT, UPDATE, DELETE requests
- Users can only view their own profile
- Admins have full access to all data

#### Password Security
- Passwords hashed before storage
- Minimum 8 characters required
- Validated on frontend and backend

#### Admin Verification
- Only pre-approved admin emails can approve requests
- Admin status checked via `is_admin()` function
- All admin actions logged

### Email Configuration

#### Resend API
- Service: [Resend](https://resend.com)
- API Key: Configured in Supabase secrets
- Sender: `ClearAI <onboarding@resend.dev>`
- Recipients: Both admin emails

#### Email Template
- ClearAI branded design
- Gradient header (dark blue to cyan)
- Request details clearly displayed
- Call-to-action button to admin dashboard
- Mobile-responsive layout

### Edge Function

#### notify-admins Function
- Deployed on Supabase Edge Runtime
- Triggered after successful account request
- Sends emails to all admin addresses
- Handles failures gracefully
- Logs all actions for debugging

## Configuration

### Environment Variables

Required in Supabase:
```
RESEND_API_KEY=re_fzZfLBmT_4mCWyDs9tDamvW949eBdHBpw
APP_URL=https://your-app-url.com (optional)
```

Required in `.env`:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Admin Emails

Configured in Edge Function:
```typescript
const ADMIN_EMAILS = [
  'Dmanopla91@gmail.com',
  'sahilcharandwary@gmail.com'
];
```

To add more admins:
1. Update `ADMIN_EMAILS` array in `notify-admins/index.ts`
2. Redeploy Edge Function
3. Create admin profile in database

## Monitoring

### Key Metrics
- Pending requests count
- Approval rate
- Average approval time
- Email delivery rate

### Logs to Monitor
- Browser console (frontend errors)
- Supabase Edge Function logs (email errors)
- Resend dashboard (email delivery)
- Database queries (request status)

### Alerts to Set Up
- Failed email deliveries
- Pending requests > 24 hours old
- High rejection rate
- Database errors

## Troubleshooting

### Common Issues

1. **Form Submission Fails**
   - Check RLS policies
   - Verify Supabase connection
   - Check browser console

2. **Email Not Received**
   - Verify Resend API key
   - Check spam folder
   - Review Edge Function logs
   - Check Resend dashboard

3. **Approval Fails**
   - Verify admin permissions
   - Check Supabase Auth enabled
   - Review database constraints

4. **Login Fails After Approval**
   - Verify user account created
   - Check approval_status = 'approved'
   - Verify password matches

### Debug Mode

Enable detailed logging:
1. Open browser console
2. Submit account request
3. Watch for console logs
4. Check for errors or warnings

## Best Practices

### For Users
- Use valid email address
- Choose strong password (8+ characters)
- Provide clear message explaining need for access
- Wait patiently for admin approval

### For Administrators
- Review requests promptly (within 24 hours)
- Verify email addresses before approving
- Reject suspicious or spam requests
- Delete processed requests to keep dashboard clean
- Monitor for unusual patterns

### For Developers
- Keep API keys secure
- Monitor email delivery rates
- Review Edge Function logs regularly
- Update dependencies periodically
- Test thoroughly before deploying changes

## Future Enhancements

### Planned Features
- Email notification to users when approved/rejected
- Bulk approval/rejection
- Request filtering and search
- Export requests to CSV
- Analytics dashboard
- Rate limiting for submissions
- CAPTCHA for spam prevention

### Scalability Considerations
- Database indexing for large request volumes
- Email queue for high traffic
- Caching for admin dashboard
- CDN for static assets

## Support

### Documentation
- [Email Setup Guide](./EMAIL_SETUP_GUIDE.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [AWS Architecture Proposal](./AWS_ARCHITECTURE_PROPOSAL.md)

### Contact
- Admin Email: Dmanopla91@gmail.com
- Admin Email: sahilcharandwary@gmail.com

### External Resources
- [Resend Documentation](https://resend.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)

## Changelog

### Version 1.0 (Current)
- ✅ Account request form
- ✅ Email notifications to admins
- ✅ Admin dashboard for approvals
- ✅ User account creation
- ✅ RLS security policies
- ✅ ClearAI branding
- ✅ Logo with fallback
- ✅ Comprehensive error handling

### Upcoming
- User email notifications
- Request analytics
- Bulk operations
- Enhanced filtering
