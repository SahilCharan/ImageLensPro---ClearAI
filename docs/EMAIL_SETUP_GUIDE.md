# Email Notification Setup Guide

## Overview
ClearAI uses email notifications to alert administrators when new account requests are submitted. This guide will help you set up the email service.

## Email Service: Resend

We use [Resend](https://resend.com) for sending emails because it's:
- Simple to set up
- Reliable and fast
- Developer-friendly
- Affordable (free tier available)

## Setup Steps

### 1. Create a Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. Log in to your Resend dashboard
2. Navigate to **API Keys** section
3. Click **Create API Key**
4. Give it a name (e.g., "ClearAI Production")
5. Copy the API key (it starts with `re_`)

### 3. Configure Domain (Optional but Recommended)

For production use, you should verify your domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `clearai.app`)
4. Follow the DNS verification steps
5. Wait for verification (usually takes a few minutes)

**Note:** Without a verified domain, emails will be sent from `onboarding@resend.dev` which may be flagged as spam.

### 4. Add API Key to Supabase

You need to add the Resend API key as a secret in your Supabase project:

#### Option A: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** → **Secrets**
3. Add a new secret:
   - Name: `RESEND_API_KEY`
   - Value: Your Resend API key (starts with `re_`)
4. Save the secret

#### Option B: Using Supabase CLI

```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

### 5. Configure Application URL (Optional)

To include proper links to your admin dashboard in emails:

1. Add another secret in Supabase:
   - Name: `APP_URL`
   - Value: Your application URL (e.g., `https://clearai.app`)

## Email Configuration

### Admin Email Recipients

Emails are sent to these admin addresses:
- `Dmanopla91@gmail.com`
- `sahilcharandwary@gmail.com`

To change these, edit the `ADMIN_EMAILS` array in:
```
supabase/functions/notify-admins/index.ts
```

### Email Sender

By default, emails are sent from:
```
ClearAI <noreply@clearai.app>
```

To change this:
1. Verify your domain in Resend
2. Update the `from` field in `notify-admins/index.ts`

## Testing

### Test the Email Function

1. Submit a test account request through the request form
2. Check the browser console for logs:
   - "Submitting account request..."
   - "Account request created"
   - "Sending email notification to admins..."
   - "Email notification sent successfully"
3. Check admin inboxes for the notification email
4. If email doesn't arrive, check spam folder

### Troubleshooting

#### Email Not Received

1. **Check Resend Dashboard**
   - Go to **Logs** section
   - Look for recent email sends
   - Check for any errors

2. **Check Supabase Logs**
   - Go to Supabase dashboard
   - Navigate to **Edge Functions** → **notify-admins**
   - Check the logs for errors

3. **Verify API Key**
   - Make sure `RESEND_API_KEY` is set correctly
   - Try regenerating the API key in Resend

4. **Check Spam Folder**
   - Emails from unverified domains may go to spam
   - Add sender to contacts to whitelist

#### Common Errors

**"Email service not configured"**
- The `RESEND_API_KEY` is not set
- Add the secret in Supabase

**"Failed to send email"**
- Invalid API key
- Rate limit exceeded (free tier: 100 emails/day)
- Domain not verified (for custom domains)

**"Permission denied"**
- RLS policy issue
- Check database policies

## Email Template Customization

To customize the email template, edit:
```
supabase/functions/notify-admins/index.ts
```

Look for the `htmlContent` variable and modify the HTML/CSS.

## Rate Limits

### Resend Free Tier
- 100 emails per day
- 3,000 emails per month

### Resend Paid Plans
- Starting at $20/month
- 50,000 emails per month
- Additional emails: $1 per 1,000

## Security Best Practices

1. **Never commit API keys to git**
   - Always use environment variables
   - Use Supabase secrets

2. **Rotate API keys regularly**
   - Generate new keys every 3-6 months
   - Revoke old keys after rotation

3. **Monitor email logs**
   - Check Resend dashboard regularly
   - Watch for suspicious activity

4. **Use verified domains**
   - Improves deliverability
   - Reduces spam flags
   - Builds trust

## Support

### Resend Support
- Documentation: [https://resend.com/docs](https://resend.com/docs)
- Email: support@resend.com

### ClearAI Support
- Check application logs in browser console
- Check Supabase Edge Function logs
- Review this guide for common issues

## Alternative Email Services

If you prefer a different email service, you can modify the Edge Function to use:

- **SendGrid**: Popular, reliable, good free tier
- **AWS SES**: Cost-effective for high volume
- **Mailgun**: Developer-friendly, good deliverability
- **Postmark**: Excellent for transactional emails

To switch services, update the API call in `notify-admins/index.ts`.
