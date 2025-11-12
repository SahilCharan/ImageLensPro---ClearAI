# Setup New Supabase Project - Step by Step

## 🎯 What I Need From You

Please provide the following information from your NEW Supabase project:

### 1. Project URL
- Go to your Supabase Dashboard
- Click on your project
- Go to **Settings** → **API**
- Copy the **Project URL**
- Example: `https://xxxxxxxxxxxxx.supabase.co`

### 2. Anon Key (Public Key)
- Same page (Settings → API)
- Copy the **anon** key (public)
- This is safe to use in frontend

### 3. Service Role Key (Secret Key)
- Same page (Settings → API)
- Copy the **service_role** key
- ⚠️ Keep this SECRET - only use in backend/n8n

### 4. Project ID
- Usually visible in the URL or project settings
- Example: `xxxxxxxxxxxxx`

---

## 📋 Format to Provide

Please send me this information in this format:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Project ID: xxxxxxxxxxxxx
```

---

## 🔧 What I'll Do After You Provide This

### Step 1: Update Configuration
- Update `.env` file with your new credentials
- Update Supabase client configuration

### Step 2: Create Database Schema
I'll run migrations to create these tables:
- ✅ `profiles` - User profiles and roles
- ✅ `account_requests` - New account requests
- ✅ `password_reset_requests` - Password reset requests
- ✅ `images` - Uploaded images
- ✅ `errors` - Detected errors in images
- ✅ `user_sessions` - Active user sessions

### Step 3: Create Admin Users
I'll create admin accounts for:
- Dmanopla91@gmail.com
- sahilcharandwary@gmail.com

### Step 4: Set Up Security
- Configure Row Level Security (RLS) policies
- Set up proper permissions
- Create helper functions

### Step 5: Test Connection
- Verify database connection
- Test all tables
- Confirm admin access

### Step 6: Provide Webhook Info
- Give you the exact API endpoints for n8n
- Provide sample requests/responses
- Give you the password generator code

---

## 📸 Where to Find This Information

### Visual Guide:

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard

2. **Select Your Project**
   - Click on your newly created project

3. **Navigate to Settings**
   - Click the ⚙️ **Settings** icon in the left sidebar

4. **Go to API Section**
   - Click **API** in the settings menu

5. **Copy the Information**
   ```
   Project URL: [Copy this]
   
   Project API keys:
   - anon public: [Copy this]
   - service_role secret: [Copy this - keep it safe!]
   ```

---

## ⚠️ Important Notes

### Security
- ✅ **Anon Key**: Safe to use in frontend code
- ❌ **Service Role Key**: NEVER expose in frontend
- ✅ **Service Role Key**: Only use in n8n workflows
- ✅ Keep Service Role Key in secure environment variables

### Project Settings
- Make sure your project is **active** and **running**
- Check that you have **sufficient credits/quota**
- Ensure **email authentication** is enabled (we'll use it)

---

## 🚀 Quick Checklist

Before providing the credentials, make sure:

- [ ] Supabase project is created and active
- [ ] You can access the Supabase Dashboard
- [ ] You're on the Settings → API page
- [ ] You can see the Project URL
- [ ] You can see both anon and service_role keys
- [ ] You've copied all three pieces of information
- [ ] You're ready to paste them here

---

## 📝 Example Format (Don't use these - they're fake!)

```
Project URL: https://abcdefghijklmnop.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMzQ1Njc4OSwiZXhwIjoxOTM5MDMyNzg5fQ.fake_signature_here
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjIzNDU2Nzg5LCJleHAiOjE5MzkwMzI3ODl9.fake_signature_here
Project ID: abcdefghijklmnop
```

---

## ❓ Questions?

If you have any questions about:
- Where to find these credentials
- What each key is used for
- Security concerns
- Next steps

Just ask! I'm here to help.

---

## ✅ Ready?

Once you provide the credentials, I'll:
1. ⚡ Update the configuration (30 seconds)
2. 🗄️ Set up the database schema (1-2 minutes)
3. 👤 Create admin users (30 seconds)
4. 🧪 Test everything (1 minute)
5. 📋 Give you the n8n integration details (ready to use)

**Total setup time: ~5 minutes**

---

**I'm ready when you are! Please paste your Supabase credentials above.** 🚀
