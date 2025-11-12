# ✅ Supabase Setup Complete - n8n Integration Guide

## 🎉 Setup Status: READY TO USE!

Your Supabase database is fully configured and ready for n8n integration!

---

## 🔑 Your Supabase Credentials

### Project Information
```
Project ID: nqcddjtthriiisucfxoy
Project URL: https://nqcddjtthriiisucfxoy.supabase.co
Dashboard: https://supabase.com/dashboard/project/nqcddjtthriiisucfxoy
```

### API Keys (For n8n)
```
Anon Key (Public - Safe for frontend):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xY2RkanR0aHJpaWlzdWNmeG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5Mzk5MDYsImV4cCI6MjA3ODUxNTkwNn0.uASTX8M-oIa0BKZDR07EHZ59KglXazyOxorP7C1yuuo

Service Role Key (Secret - Use ONLY in n8n):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xY2RkanR0aHJpaWlzdWNmeG95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkzOTkwNiwiZXhwIjoyMDc4NTE1OTA2fQ.KUstYhxQEQSZRP2IrCOOHeuUd7ei5lgrXn9kz7KvFA0
```

---

## 📊 Database Tables (Already Created!)

### ✅ Table 1: `account_requests`
**Purpose**: Store new account access requests

**Columns:**
- `id` - UUID (auto-generated)
- `full_name` - TEXT (required)
- `email` - TEXT (required, unique)
- `password_hash` - TEXT (nullable, **n8n will set this**)
- `message` - TEXT (optional reason)
- `status` - TEXT (default: 'pending', values: 'pending', 'approved', 'rejected')
- `approved_by` - UUID (references profiles.id)
- `approved_at` - TIMESTAMP
- `created_at` - TIMESTAMP (auto)
- `updated_at` - TIMESTAMP (auto)

---

### ✅ Table 2: `password_reset_requests`
**Purpose**: Store password reset requests

**Columns:**
- `id` - UUID (auto-generated)
- `user_id` - UUID (references profiles.id)
- `email` - TEXT (required)
- `full_name` - TEXT (required)
- `status` - TEXT (default: 'pending')
- `approved_by` - UUID
- `approved_at` - TIMESTAMP
- `created_at` - TIMESTAMP (auto)

---

### ✅ Table 3: `profiles`
**Purpose**: User profiles

**Columns:**
- `id` - UUID (must match auth.users.id)
- `email` - TEXT (unique)
- `full_name` - TEXT
- `avatar_url` - TEXT
- `role` - ENUM ('user', 'admin')
- `created_at` - TIMESTAMP

---

### ✅ Table 4: `auth.users` (Supabase Auth)
**Purpose**: Authentication (managed by Supabase)

---

## 🔗 API Endpoints for n8n

### Base URLs
```
REST API: https://nqcddjtthriiisucfxoy.supabase.co/rest/v1/
Auth API: https://nqcddjtthriiisucfxoy.supabase.co/auth/v1/
```

### Required Headers (All Requests)
```
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xY2RkanR0aHJpaWlzdWNmeG95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkzOTkwNiwiZXhwIjoyMDc4NTE1OTA2fQ.KUstYhxQEQSZRP2IrCOOHeuUd7ei5lgrXn9kz7KvFA0
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xY2RkanR0aHJpaWlzdWNmeG95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkzOTkwNiwiZXhwIjoyMDc4NTE1OTA2fQ.KUstYhxQEQSZRP2IrCOOHeuUd7ei5lgrXn9kz7KvFA0
Content-Type: application/json
```

---

## 🔄 Workflow 1: New Account Request

### Frontend → n8n Webhook
**User submits request, frontend sends:**
```json
POST https://your-n8n-webhook-url.com/new-account-request

{
  "full_name": "John Doe",
  "email": "john@example.com",
  "message": "I need access to process images"
}
```

### n8n Step 1: Save to Database
```javascript
// HTTP Request Node
POST https://nqcddjtthriiisucfxoy.supabase.co/rest/v1/account_requests

Headers:
  apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xY2RkanR0aHJpaWlzdWNmeG95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkzOTkwNiwiZXhwIjoyMDc4NTE1OTA2fQ.KUstYhxQEQSZRP2IrCOOHeuUd7ei5lgrXn9kz7KvFA0
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xY2RkanR0aHJpaWlzdWNmeG95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkzOTkwNiwiZXhwIjoyMDc4NTE1OTA2fQ.KUstYhxQEQSZRP2IrCOOHeuUd7ei5lgrXn9kz7KvFA0
  Content-Type: application/json

Body:
{
  "full_name": "{{ $json.full_name }}",
  "email": "{{ $json.email }}",
  "message": "{{ $json.message }}",
  "status": "pending"
}
```

### n8n Step 2: Send Email to Admin
```
To: Dmanopla91@gmail.com, sahilcharandwary@gmail.com
Subject: 🔔 New Account Request from {{ $json.full_name }}

Body:
Hi Admin,

A new user has requested access to ClearAI:

Name: {{ $json.full_name }}
Email: {{ $json.email }}
Message: {{ $json.message }}
Requested: {{ $now }}

Click to approve:
https://your-n8n-webhook-url.com/approve-account?id={{ $json.id }}

Click to reject:
https://your-n8n-webhook-url.com/reject-account?id={{ $json.id }}

Thank you!
```

### n8n Step 3: Wait for Admin Approval
**When admin clicks approve link, n8n receives:**
```
GET https://your-n8n-webhook-url.com/approve-account?id=uuid-here
```

### n8n Step 4: Generate Password
```javascript
// Code Node (JavaScript)
function generatePassword() {
  const adjectives = [
    'Happy', 'Sunny', 'Clever', 'Bright', 'Swift',
    'Gentle', 'Brave', 'Calm', 'Bold', 'Wise',
    'Quick', 'Smart', 'Kind', 'Noble', 'Proud'
  ];

  const nouns = [
    'Cloud', 'River', 'Mountain', 'Ocean', 'Forest',
    'Eagle', 'Tiger', 'Dragon', 'Phoenix', 'Lion',
    'Star', 'Moon', 'Sun', 'Sky', 'Storm'
  ];

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 90) + 10;
  
  return `${adjective}-${noun}-${number}`;
}

const password = generatePassword();

return [
  {
    json: {
      password: password,
      request_id: $input.item.json.id
    }
  }
];
```

### n8n Step 5: Create User in Supabase Auth
```javascript
// HTTP Request Node
POST https://nqcddjtthriiisucfxoy.supabase.co/auth/v1/admin/users

Headers:
  apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xY2RkanR0aHJpaWlzdWNmeG95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkzOTkwNiwiZXhwIjoyMDc4NTE1OTA2fQ.KUstYhxQEQSZRP2IrCOOHeuUd7ei5lgrXn9kz7KvFA0
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xY2RkanR0aHJpaWlzdWNmeG95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkzOTkwNiwiZXhwIjoyMDc4NTE1OTA2fQ.KUstYhxQEQSZRP2IrCOOHeuUd7ei5lgrXn9kz7KvFA0
  Content-Type: application/json

Body:
{
  "email": "{{ $json.email }}",
  "password": "{{ $json.password }}",
  "email_confirm": true,
  "user_metadata": {
    "full_name": "{{ $json.full_name }}"
  }
}

// Response will include: { "user": { "id": "uuid-here", ... } }
```

### n8n Step 6: Create Profile
```javascript
// HTTP Request Node
POST https://nqcddjtthriiisucfxoy.supabase.co/rest/v1/profiles

Headers:
  apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xY2RkanR0aHJpaWlzdWNmeG95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkzOTkwNiwiZXhwIjoyMDc4NTE1OTA2fQ.KUstYhxQEQSZRP2IrCOOHeuUd7ei5lgrXn9kz7KvFA0
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xY2RkanR0aHJpaWlzdWNmeG95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkzOTkwNiwiZXhwIjoyMDc4NTE1OTA2fQ.KUstYhxQEQSZRP2IrCOOHeuUd7ei5lgrXn9kz7KvFA0
  Content-Type: application/json

Body:
{
  "id": "{{ $json.user.id }}",
  "email": "{{ $json.email }}",
  "full_name": "{{ $json.full_name }}",
  "role": "user"
}
```

### n8n Step 7: Update Account Request
```javascript
// HTTP Request Node
PATCH https://nqcddjtthriiisucfxoy.supabase.co/rest/v1/account_requests?id=eq.{{ $json.request_id }}

Headers:
  apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xY2RkanR0aHJpaWlzdWNmeG95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkzOTkwNiwiZXhwIjoyMDc4NTE1OTA2fQ.KUstYhxQEQSZRP2IrCOOHeuUd7ei5lgrXn9kz7KvFA0
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xY2RkanR0aHJpaWlzdWNmeG95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkzOTkwNiwiZXhwIjoyMDc4NTE1OTA2fQ.KUstYhxQEQSZRP2IrCOOHeuUd7ei5lgrXn9kz7KvFA0
  Content-Type: application/json

Body:
{
  "status": "approved",
  "password_hash": "{{ $json.password }}",
  "approved_at": "{{ $now }}"
}
```

### n8n Step 8: Send Password Email to User
```
To: {{ $json.email }}
Subject: ✅ Your ClearAI Account is Ready!

Body:
Hi {{ $json.full_name }},

Great news! Your ClearAI account has been approved.

Login Credentials:
Email: {{ $json.email }}
Password: {{ $json.password }}

Login here: https://your-app-url.com/login

You can change your password after logging in.

Welcome to ClearAI!
```

---

## 🔄 Workflow 2: Password Reset Request

### Frontend → n8n Webhook
```json
POST https://your-n8n-webhook-url.com/password-reset-request

{
  "email": "john@example.com"
}
```

### n8n Step 1: Check if User Exists
```javascript
// HTTP Request Node
GET https://nqcddjtthriiisucfxoy.supabase.co/rest/v1/profiles?email=eq.{{ $json.email }}

Headers:
  apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xY2RkanR0aHJpaWlzdWNmeG95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkzOTkwNiwiZXhwIjoyMDc4NTE1OTA2fQ.KUstYhxQEQSZRP2IrCOOHeuUd7ei5lgrXn9kz7KvFA0
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xY2RkanR0aHJpaWlzdWNmeG95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkzOTkwNiwiZXhwIjoyMDc4NTE1OTA2fQ.KUstYhxQEQSZRP2IrCOOHeuUd7ei5lgrXn9kz7KvFA0

// If response is empty array [], user doesn't exist - return error
// If response has data, continue
```

### n8n Step 2: Save Reset Request
```javascript
// HTTP Request Node
POST https://nqcddjtthriiisucfxoy.supabase.co/rest/v1/password_reset_requests

Headers:
  apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xY2RkanR0aHJpaWlzdWNmeG95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkzOTkwNiwiZXhwIjoyMDc4NTE1OTA2fQ.KUstYhxQEQSZRP2IrCOOHeuUd7ei5lgrXn9kz7KvFA0
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xY2RkanR0aHJpaWlzdWNmeG95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkzOTkwNiwiZXhwIjoyMDc4NTE1OTA2fQ.KUstYhxQEQSZRP2IrCOOHeuUd7ei5lgrXn9kz7KvFA0
  Content-Type: application/json

Body:
{
  "user_id": "{{ $json[0].id }}",
  "email": "{{ $json[0].email }}",
  "full_name": "{{ $json[0].full_name }}",
  "status": "pending"
}
```

### n8n Step 3: Send Email to Admin
```
To: Dmanopla91@gmail.com, sahilcharandwary@gmail.com
Subject: 🔑 Password Reset Request from {{ $json.full_name }}

Body:
Hi Admin,

A user has requested a password reset:

Name: {{ $json.full_name }}
Email: {{ $json.email }}
Requested: {{ $now }}

Click to approve:
https://your-n8n-webhook-url.com/approve-reset?id={{ $json.id }}

Click to reject:
https://your-n8n-webhook-url.com/reject-reset?id={{ $json.id }}

Thank you!
```

### n8n Step 4: Wait for Admin Approval
**When admin clicks approve:**
```
GET https://your-n8n-webhook-url.com/approve-reset?id=uuid-here
```

### n8n Step 5: Fetch Password from Database
```javascript
// HTTP Request Node
GET https://nqcddjtthriiisucfxoy.supabase.co/rest/v1/account_requests?email=eq.{{ $json.email }}&status=eq.approved&order=created_at.desc&limit=1

Headers:
  apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xY2RkanR0aHJpaWlzdWNmeG95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkzOTkwNiwiZXhwIjoyMDc4NTE1OTA2fQ.KUstYhxQEQSZRP2IrCOOHeuUd7ei5lgrXn9kz7KvFA0
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xY2RkanR0aHJpaWlzdWNmeG95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkzOTkwNiwiZXhwIjoyMDc4NTE1OTA2fQ.KUstYhxQEQSZRP2IrCOOHeuUd7ei5lgrXn9kz7KvFA0

// Response: [{ "password_hash": "Happy-Cloud-42", ... }]
```

### n8n Step 6: Update Reset Request
```javascript
// HTTP Request Node
PATCH https://nqcddjtthriiisucfxoy.supabase.co/rest/v1/password_reset_requests?id=eq.{{ $json.request_id }}

Headers:
  apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xY2RkanR0aHJpaWlzdWNmeG95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkzOTkwNiwiZXhwIjoyMDc4NTE1OTA2fQ.KUstYhxQEQSZRP2IrCOOHeuUd7ei5lgrXn9kz7KvFA0
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xY2RkanR0aHJpaWlzdWNmeG95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkzOTkwNiwiZXhwIjoyMDc4NTE1OTA2fQ.KUstYhxQEQSZRP2IrCOOHeuUd7ei5lgrXn9kz7KvFA0
  Content-Type: application/json

Body:
{
  "status": "approved",
  "approved_at": "{{ $now }}"
}
```

### n8n Step 7: Send Password Email to User
```
To: {{ $json.email }}
Subject: 🔑 Your ClearAI Password

Hi {{ $json.full_name }},

Your password reset request has been approved.

Login Credentials:
Email: {{ $json.email }}
Password: {{ $json.password_hash }}

Login here: https://your-app-url.com/login

If you didn't request this, please contact support immediately.

Best regards,
ClearAI Team
```

---

## 📧 Admin Email Addresses
```
Dmanopla91@gmail.com
sahilcharandwary@gmail.com
```

---

## 🔐 Current Admin Users in Database
```
✅ sahilcharandwary@gmail.com (Kumar Sahil) - Admin
✅ mock@example.com - Admin (test account)
```

---

## 📝 Password Generator Code (Copy to n8n)

See file: `n8n-password-generator.js`

---

## ✅ What's Already Done

- ✅ Database schema created
- ✅ All tables set up (profiles, account_requests, password_reset_requests, images, errors)
- ✅ Row Level Security configured
- ✅ Admin users created
- ✅ Storage bucket created
- ✅ Triggers and functions set up
- ✅ Frontend configured with new credentials

---

## 🚀 Next Steps

### 1. Create n8n Workflows
- Create "New Account Request" workflow
- Create "Password Reset Request" workflow

### 2. Get Webhook URLs
Once you create the workflows in n8n, you'll get webhook URLs like:
```
https://your-n8n-instance.com/webhook/new-account-request
https://your-n8n-instance.com/password-reset-request
https://your-n8n-instance.com/approve-account
https://your-n8n-instance.com/reject-account
https://your-n8n-instance.com/approve-reset
https://your-n8n-instance.com/reject-reset
```

### 3. Update Frontend
Send me the webhook URLs and I'll update the frontend to use them.

---

## 📚 Additional Files

- `n8n-password-generator.js` - Password generator code
- `N8N_INTEGRATION_GUIDE.md` - Detailed integration guide
- `SUPABASE_CREDENTIALS.md` - Quick reference

---

## 🆘 Support

**Supabase Dashboard:**
https://supabase.com/dashboard/project/nqcddjtthriiisucfxoy

**Admin Emails:**
- Dmanopla91@gmail.com
- sahilcharandwary@gmail.com

---

## ✅ Ready to Go!

Your Supabase is fully configured and ready for n8n integration. 

**Next:** Create your n8n workflows and send me the webhook URLs!

🎉 **Setup Complete!** 🎉
