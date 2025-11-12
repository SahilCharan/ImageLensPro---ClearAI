# Supabase Credentials - Quick Reference

## 🔑 Essential Information

### Supabase Project
```
URL: https://zflgjgdtizwthvmbvitb.supabase.co
Project ID: zflgjgdtizwthvmbvitb
```

### API Keys
```
Anon Key (Public):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmbGdqZ2R0aXp3dGh2bWJ2aXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTc0MDksImV4cCI6MjA3ODA3MzQwOX0.bLeoc2s0muRftDKqeWXnfiYuHvyW1bOspM1ijG49hzw
```

### Get Service Role Key
1. Go to: https://supabase.com/dashboard/project/zflgjgdtizwthvmbvitb/settings/api
2. Copy the "service_role" key (keep it secret!)
3. Use this in n8n for all database operations

---

## 📊 Database Tables

### 1. account_requests
**Purpose**: New account requests

**Key Columns:**
- `id` - UUID (auto-generated)
- `full_name` - TEXT
- `email` - TEXT (unique)
- `password_hash` - TEXT (nullable, set by n8n)
- `message` - TEXT (optional)
- `status` - TEXT ('pending', 'approved', 'rejected')
- `created_at` - TIMESTAMP

**n8n Operations:**
- INSERT: Save new request
- UPDATE: Set status to 'approved' and save password_hash

---

### 2. password_reset_requests
**Purpose**: Password reset requests

**Key Columns:**
- `id` - UUID (auto-generated)
- `user_id` - UUID (references profiles.id)
- `email` - TEXT
- `full_name` - TEXT
- `status` - TEXT ('pending', 'approved', 'rejected')
- `created_at` - TIMESTAMP

**n8n Operations:**
- INSERT: Save reset request
- UPDATE: Set status to 'approved'

---

### 3. profiles
**Purpose**: User profiles

**Key Columns:**
- `id` - UUID (must match auth.users.id)
- `email` - TEXT (unique)
- `full_name` - TEXT
- `role` - TEXT ('user' or 'admin')
- `created_at` - TIMESTAMP

**n8n Operations:**
- INSERT: Create profile after creating auth user
- SELECT: Check if user exists

---

### 4. auth.users (Supabase Auth)
**Purpose**: Authentication

**n8n Operations:**
- CREATE: Use Supabase Admin API to create user with password

---

## 🔗 API Endpoints

### REST API
```
Base URL: https://zflgjgdtizwthvmbvitb.supabase.co/rest/v1/

Insert:
POST /rest/v1/account_requests
Body: { "full_name": "...", "email": "...", "status": "pending" }

Query:
GET /rest/v1/profiles?email=eq.john@example.com

Update:
PATCH /rest/v1/account_requests?id=eq.[uuid]
Body: { "status": "approved", "password_hash": "..." }
```

### Auth API
```
Base URL: https://zflgjgdtizwthvmbvitb.supabase.co/auth/v1/

Create User:
POST /auth/v1/admin/users
Body: {
  "email": "user@example.com",
  "password": "password123",
  "email_confirm": true,
  "user_metadata": { "full_name": "..." }
}
```

### Required Headers
```
apikey: [SERVICE_ROLE_KEY]
Authorization: Bearer [SERVICE_ROLE_KEY]
Content-Type: application/json
```

---

## 🔄 Workflow Summary

### New Account Request
1. Frontend → n8n webhook (full_name, email, message)
2. n8n → Insert into `account_requests` (status: pending)
3. n8n → Send email to admin with approve link
4. Admin clicks approve → n8n webhook
5. n8n → Generate password
6. n8n → Create user in `auth.users`
7. n8n → Create profile in `profiles`
8. n8n → Update `account_requests` (status: approved, password_hash)
9. n8n → Send password email to user

### Password Reset
1. Frontend → n8n webhook (email)
2. n8n → Check if user exists in `profiles`
3. n8n → Insert into `password_reset_requests` (status: pending)
4. n8n → Send email to admin with approve link
5. Admin clicks approve → n8n webhook
6. n8n → Fetch password from `account_requests`
7. n8n → Update `password_reset_requests` (status: approved)
8. n8n → Send password email to user

---

## 📧 Admin Emails
```
Dmanopla91@gmail.com
sahilcharandwary@gmail.com
```

---

## 📝 Files for n8n

1. **N8N_INTEGRATION_GUIDE.md** - Complete integration guide
2. **n8n-password-generator.js** - Password generator code for n8n
3. **SUPABASE_CREDENTIALS.md** - This file (quick reference)

---

## ✅ Next Steps

1. Get Service Role Key from Supabase Dashboard
2. Create n8n workflows
3. Test password generator
4. Test database operations
5. Send webhook URLs to update frontend

---

**Dashboard Link:**
https://supabase.com/dashboard/project/zflgjgdtizwthvmbvitb
