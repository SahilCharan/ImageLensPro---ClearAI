# 🔐 Google OAuth Setup Guide

## ✅ Good News: Tables Exist!

I've verified that all database tables exist in your Supabase project. The issue is that **Google OAuth is not configured yet** in your NEW Supabase project.

---

## 🚨 Why You Can't Login

Your NEW Supabase project (`nqcddjtthriiisucfxoy`) doesn't have Google OAuth configured yet. You need to:
1. Enable Google OAuth in Supabase
2. Configure redirect URLs
3. Add Google OAuth credentials

---

## 📋 Step-by-Step Setup

### Step 1: Go to Supabase Authentication Settings

1. Open your Supabase dashboard:
   ```
   https://supabase.com/dashboard/project/nqcddjtthriiisucfxoy/auth/providers
   ```

2. You should see the **Authentication > Providers** page

---

### Step 2: Enable Google Provider

1. Scroll down to find **Google** in the providers list
2. Click on **Google** to expand it
3. Toggle **Enable Sign in with Google** to ON

---

### Step 3: Configure Google OAuth (Option A - Quick Setup)

**If you want to use Supabase's built-in Google OAuth (Recommended for testing):**

1. Keep **Use Supabase OAuth** enabled
2. Click **Save**
3. That's it! Skip to Step 5

This uses Supabase's Google OAuth credentials, which is perfect for development and testing.

---

### Step 3: Configure Google OAuth (Option B - Your Own Credentials)

**If you want to use your own Google OAuth credentials:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add these redirect URLs:
   ```
   https://nqcddjtthriiisucfxoy.supabase.co/auth/v1/callback
   ```
7. Copy the **Client ID** and **Client Secret**
8. Paste them in Supabase Google provider settings
9. Click **Save**

---

### Step 4: Configure Redirect URLs

1. In Supabase, go to **Authentication > URL Configuration**:
   ```
   https://supabase.com/dashboard/project/nqcddjtthriiisucfxoy/auth/url-configuration
   ```

2. Add your application URL to **Site URL**:
   ```
   https://your-app-url.com
   ```
   (Or use `http://localhost:5173` for local development)

3. Add to **Redirect URLs**:
   ```
   https://your-app-url.com/**
   http://localhost:5173/**
   ```

4. Click **Save**

---

### Step 5: Verify Tables in Supabase

1. Go to Table Editor:
   ```
   https://supabase.com/dashboard/project/nqcddjtthriiisucfxoy/editor
   ```

2. Click on **Table Editor** in the left sidebar

3. You should see these 6 tables:
   - ✅ account_requests
   - ✅ errors
   - ✅ images
   - ✅ password_reset_requests
   - ✅ profiles
   - ✅ user_sessions

**If you DON'T see the tables:**
- Make sure you're in the correct project (check URL has `nqcddjtthriiisucfxoy`)
- Click the refresh button in Table Editor
- Try using SQL Editor to run: `SELECT * FROM profiles LIMIT 1;`

---

### Step 6: Create First Admin User (Manual Method)

Since you can't login yet, let's create an admin user manually:

1. Go to **SQL Editor**:
   ```
   https://supabase.com/dashboard/project/nqcddjtthriiisucfxoy/sql/new
   ```

2. Run this SQL to create a test admin user:
   ```sql
   -- Create a test user in auth.users
   INSERT INTO auth.users (
     id,
     instance_id,
     email,
     encrypted_password,
     email_confirmed_at,
     raw_app_meta_data,
     raw_user_meta_data,
     created_at,
     updated_at,
     confirmation_token,
     recovery_token,
     email_change_token_new,
     email_change
   ) VALUES (
     gen_random_uuid(),
     '00000000-0000-0000-0000-000000000000',
     'sahilcharandwary@gmail.com',
     crypt('TempPassword123!', gen_salt('bf')),
     now(),
     '{"provider":"email","providers":["email"]}',
     '{"full_name":"Kumar Sahil"}',
     now(),
     now(),
     '',
     '',
     '',
     ''
   )
   RETURNING id;
   ```

3. Copy the returned `id`

4. Create the profile:
   ```sql
   -- Replace YOUR_USER_ID with the ID from above
   INSERT INTO profiles (id, email, full_name, role)
   VALUES (
     'YOUR_USER_ID',
     'sahilcharandwary@gmail.com',
     'Kumar Sahil',
     'admin'
   );
   ```

---

## 🎯 Alternative: Use Supabase Dashboard to Create User

1. Go to **Authentication > Users**:
   ```
   https://supabase.com/dashboard/project/nqcddjtthriiisucfxoy/auth/users
   ```

2. Click **Add User** button

3. Fill in:
   - **Email:** sahilcharandwary@gmail.com
   - **Password:** TempPassword123!
   - **Auto Confirm User:** Yes

4. Click **Create User**

5. Copy the user ID

6. Go to **SQL Editor** and run:
   ```sql
   INSERT INTO profiles (id, email, full_name, role)
   VALUES (
     'PASTE_USER_ID_HERE',
     'sahilcharandwary@gmail.com',
     'Kumar Sahil',
     'admin'
   );
   ```

---

## 🔍 Verify Everything Works

### Test 1: Check Tables
```sql
-- Run in SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected result: 6 tables

### Test 2: Check Profiles
```sql
-- Run in SQL Editor
SELECT id, email, full_name, role 
FROM profiles;
```

Expected result: At least one admin user

### Test 3: Check Storage Bucket
```sql
-- Run in SQL Editor
SELECT id, name, public 
FROM storage.buckets;
```

Expected result: `app-7dzvb2e20qgx_images` bucket

---

## 🚀 After Setup

Once Google OAuth is configured:

1. **Clear browser cache** (Ctrl+Shift+R)
2. **Go to your application**
3. **Click "Sign in with Google"**
4. **Select your Google account**
5. **Should redirect to dashboard**

---

## 📧 For N8N Integration

Once you can see the tables in Supabase:

### Account Request Webhook
Your n8n workflow should:
1. Receive POST request with: `{ full_name, email, message, request_id }`
2. Query Supabase to get the request details
3. Send email to admins
4. Wait for approval
5. Create user in Supabase Auth
6. Create profile in profiles table
7. Send password email to user

### Password Reset Webhook
Your n8n workflow should:
1. Receive POST request with: `{ email, full_name, user_id }`
2. Query Supabase to get user details
3. Send email to admins
4. Wait for approval
5. Fetch password from account_requests table
6. Send password email to user

### Supabase Connection in N8N

Use these credentials in your n8n Supabase nodes:

**Host:**
```
nqcddjtthriiisucfxoy.supabase.co
```

**Service Role Key (for n8n):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xY2RkanR0aHJpaWlzdWNmeG95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkzOTkwNiwiZXhwIjoyMDc4NTE1OTA2fQ.KUstYhxQEQSZRP2IrCOOHeuUd7ei5lgrXn9kz7KvFA0
```

**API URL:**
```
https://nqcddjtthriiisucfxoy.supabase.co/rest/v1/
```

---

## 🆘 Troubleshooting

### "I still don't see tables"

1. Make sure you're in the correct project:
   - URL should contain: `nqcddjtthriiisucfxoy`
   - NOT: `zflgjgdtizwthvmbvitb` (old project)

2. Try SQL Editor instead of Table Editor:
   - Go to SQL Editor
   - Run: `SELECT * FROM profiles;`
   - If this works, tables exist

3. Refresh the page:
   - Hard refresh: Ctrl+Shift+R
   - Clear browser cache
   - Try different browser

### "Login still doesn't work"

1. Check Google OAuth is enabled:
   - Go to Authentication > Providers
   - Google should be ON

2. Check redirect URLs:
   - Go to Authentication > URL Configuration
   - Your app URL should be listed

3. Check browser console:
   - Press F12
   - Look for error messages
   - Send me the errors

### "N8N can't connect to Supabase"

1. Use Service Role Key (not Anon Key)
2. Use correct host: `nqcddjtthriiisucfxoy.supabase.co`
3. Test with a simple query first:
   ```sql
   SELECT * FROM profiles LIMIT 1;
   ```

---

## ✅ Checklist

Before testing, verify:

- [ ] Google OAuth enabled in Supabase
- [ ] Redirect URLs configured
- [ ] Can see 6 tables in Table Editor
- [ ] At least one admin user exists
- [ ] Storage bucket exists
- [ ] Browser cache cleared
- [ ] Using correct Supabase project (nqcddjtthriiisucfxoy)

---

## 📞 Need Help?

If you're stuck, send me:
1. Screenshot of Supabase Table Editor
2. Screenshot of Authentication > Providers page
3. Any error messages from browser console
4. What step you're stuck on

---

## 🎯 Quick Summary

**Problem:** Google OAuth not configured in new Supabase project

**Solution:**
1. Go to: https://supabase.com/dashboard/project/nqcddjtthriiisucfxoy/auth/providers
2. Enable Google OAuth
3. Configure redirect URLs
4. Create admin user manually
5. Test login

**Tables:** ✅ Already exist (verified)
**Storage:** ✅ Already configured
**N8N:** ✅ Webhooks ready

**Just need:** Google OAuth configuration!
