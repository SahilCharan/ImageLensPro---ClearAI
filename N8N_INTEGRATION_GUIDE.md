# n8n Integration Guide - ClearAI

## 🔑 Supabase Credentials

### Project Information
```
Project URL: https://zflgjgdtizwthvmbvitb.supabase.co
Project ID: zflgjgdtizwthvmbvitb
Status: ACTIVE_HEALTHY
```

### API Keys
```
Anon Key (Public):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmbGdqZ2R0aXp3dGh2bWJ2aXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTc0MDksImV4cCI6MjA3ODA3MzQwOX0.bLeoc2s0muRftDKqeWXnfiYuHvyW1bOspM1ijG49hzw

Service Role Key (Secret - Use in n8n):
You'll need to get this from Supabase Dashboard → Settings → API
```

### How to Get Service Role Key
1. Go to: https://supabase.com/dashboard/project/zflgjgdtizwthvmbvitb
2. Click "Settings" (gear icon)
3. Click "API"
4. Copy the "service_role" key (secret)
5. Use this key in n8n for database operations

---

## 📊 Database Schema

### Table 1: `account_requests`
**Purpose**: Store new account access requests

**Columns:**
```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
full_name         TEXT NOT NULL
email             TEXT NOT NULL UNIQUE
password_hash     TEXT (nullable - will be set by n8n)
message           TEXT (optional reason for access)
status            TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
approved_by       UUID REFERENCES profiles(id)
approved_at       TIMESTAMPTZ
created_at        TIMESTAMPTZ DEFAULT now()
```

**Important Notes:**
- `password_hash` is nullable - n8n will set it after approval
- `status` can be: 'pending', 'approved', 'rejected'
- `email` must be unique

---

### Table 2: `password_reset_requests`
**Purpose**: Store password reset requests from existing users

**Columns:**
```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id           UUID NOT NULL REFERENCES profiles(id)
email             TEXT NOT NULL
full_name         TEXT NOT NULL
status            TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
approved_by       UUID REFERENCES profiles(id)
approved_at       TIMESTAMPTZ
created_at        TIMESTAMPTZ DEFAULT now()
```

**Important Notes:**
- `user_id` links to existing user in `profiles` table
- Used when user forgets password

---

### Table 3: `profiles`
**Purpose**: Store user profiles and credentials

**Columns:**
```sql
id                UUID PRIMARY KEY REFERENCES auth.users(id)
phone             TEXT UNIQUE
email             TEXT UNIQUE
full_name         TEXT
nickname          TEXT
role              user_role DEFAULT 'user' (ENUM: 'user', 'admin')
avatar_url        TEXT
created_at        TIMESTAMPTZ DEFAULT now()
```

**Important Notes:**
- `id` is linked to Supabase Auth users
- `role` determines admin access
- This is where you'll create the actual user account

---

### Table 4: `auth.users` (Supabase Auth)
**Purpose**: Supabase authentication table

**Important Columns:**
```sql
id                UUID PRIMARY KEY
email             TEXT UNIQUE
encrypted_password TEXT
created_at        TIMESTAMPTZ
```

**Important Notes:**
- This is Supabase's built-in auth table
- You'll need to create users here using Supabase Admin API
- Password must be hashed

---

## 🔄 Workflow 1: New Account Request

### Step 1: User Submits Request (Frontend)
**Endpoint**: Frontend form at `/request-account`

**Data Sent to n8n Webhook:**
```json
{
  "type": "new_account_request",
  "data": {
    "full_name": "John Doe",
    "email": "john@example.com",
    "message": "I need access to process images"
  }
}
```

### Step 2: n8n Receives Request
**n8n Workflow Actions:**

1. **Save to Supabase** (`account_requests` table)
   ```javascript
   // Insert into account_requests
   POST https://zflgjgdtizwthvmbvitb.supabase.co/rest/v1/account_requests
   Headers:
     apikey: [SERVICE_ROLE_KEY]
     Authorization: Bearer [SERVICE_ROLE_KEY]
     Content-Type: application/json
   
   Body:
   {
     "full_name": "John Doe",
     "email": "john@example.com",
     "message": "I need access to process images",
     "status": "pending"
   }
   ```

2. **Send Email to Admin**
   - To: Dmanopla91@gmail.com, sahilcharandwary@gmail.com
   - Subject: "New ClearAI Account Request from John Doe"
   - Body: Include approve/reject links with request ID

### Step 3: Admin Approves (via Email Link)
**n8n Webhook Receives:**
```json
{
  "action": "approve",
  "request_id": "uuid-here",
  "email": "john@example.com"
}
```

**n8n Actions:**

1. **Generate Password** (JavaScript in n8n)
   ```javascript
   // Password generation function
   function generatePassword() {
     const adjectives = ['Happy', 'Sunny', 'Clever', 'Bright', 'Swift'];
     const nouns = ['Cloud', 'River', 'Mountain', 'Ocean', 'Forest'];
     const number = Math.floor(Math.random() * 100);
     
     const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
     const noun = nouns[Math.floor(Math.random() * nouns.length)];
     
     return `${adj}-${noun}-${number}`;
   }
   
   const password = generatePassword();
   // Example: "Happy-Cloud-42"
   ```

2. **Create User in Supabase Auth**
   ```javascript
   // Create auth user
   POST https://zflgjgdtizwthvmbvitb.supabase.co/auth/v1/admin/users
   Headers:
     apikey: [SERVICE_ROLE_KEY]
     Authorization: Bearer [SERVICE_ROLE_KEY]
     Content-Type: application/json
   
   Body:
   {
     "email": "john@example.com",
     "password": "Happy-Cloud-42",
     "email_confirm": true,
     "user_metadata": {
       "full_name": "John Doe"
     }
   }
   
   // Response will include user.id
   ```

3. **Create Profile**
   ```javascript
   // Insert into profiles
   POST https://zflgjgdtizwthvmbvitb.supabase.co/rest/v1/profiles
   Headers:
     apikey: [SERVICE_ROLE_KEY]
     Authorization: Bearer [SERVICE_ROLE_KEY]
     Content-Type: application/json
   
   Body:
   {
     "id": "[user_id_from_auth]",
     "email": "john@example.com",
     "full_name": "John Doe",
     "role": "user"
   }
   ```

4. **Update Account Request**
   ```javascript
   // Update account_requests status
   PATCH https://zflgjgdtizwthvmbvitb.supabase.co/rest/v1/account_requests?id=eq.[request_id]
   Headers:
     apikey: [SERVICE_ROLE_KEY]
     Authorization: Bearer [SERVICE_ROLE_KEY]
     Content-Type: application/json
   
   Body:
   {
     "status": "approved",
     "password_hash": "Happy-Cloud-42",
     "approved_at": "2025-11-12T10:00:00Z"
   }
   ```

5. **Send Password Email to User**
   - To: john@example.com
   - Subject: "Your ClearAI Account is Ready"
   - Body: Include email and password

---

## 🔄 Workflow 2: Password Reset Request

### Step 1: User Requests Reset (Frontend)
**Endpoint**: Frontend form at `/forgot-password`

**Data Sent to n8n Webhook:**
```json
{
  "type": "password_reset_request",
  "data": {
    "email": "john@example.com"
  }
}
```

### Step 2: n8n Receives Request
**n8n Workflow Actions:**

1. **Check if User Exists**
   ```javascript
   // Query profiles table
   GET https://zflgjgdtizwthvmbvitb.supabase.co/rest/v1/profiles?email=eq.john@example.com
   Headers:
     apikey: [SERVICE_ROLE_KEY]
     Authorization: Bearer [SERVICE_ROLE_KEY]
   
   // If user doesn't exist, return error
   // If exists, continue
   ```

2. **Save to Supabase** (`password_reset_requests` table)
   ```javascript
   POST https://zflgjgdtizwthvmbvitb.supabase.co/rest/v1/password_reset_requests
   Headers:
     apikey: [SERVICE_ROLE_KEY]
     Authorization: Bearer [SERVICE_ROLE_KEY]
     Content-Type: application/json
   
   Body:
   {
     "user_id": "[user_id_from_profiles]",
     "email": "john@example.com",
     "full_name": "John Doe",
     "status": "pending"
   }
   ```

3. **Send Email to Admin**
   - To: Dmanopla91@gmail.com, sahilcharandwary@gmail.com
   - Subject: "Password Reset Request from John Doe"
   - Body: Include approve/reject links with request ID

### Step 3: Admin Approves (via Email Link)
**n8n Webhook Receives:**
```json
{
  "action": "approve_reset",
  "request_id": "uuid-here",
  "user_id": "uuid-here",
  "email": "john@example.com"
}
```

**n8n Actions:**

1. **Fetch Current Password from Account Request**
   ```javascript
   // Query account_requests to get password
   GET https://zflgjgdtizwthvmbvitb.supabase.co/rest/v1/account_requests?email=eq.john@example.com&status=eq.approved&order=created_at.desc&limit=1
   Headers:
     apikey: [SERVICE_ROLE_KEY]
     Authorization: Bearer [SERVICE_ROLE_KEY]
   
   // Get password_hash from response
   ```

2. **Update Password Reset Request**
   ```javascript
   PATCH https://zflgjgdtizwthvmbvitb.supabase.co/rest/v1/password_reset_requests?id=eq.[request_id]
   Headers:
     apikey: [SERVICE_ROLE_KEY]
     Authorization: Bearer [SERVICE_ROLE_KEY]
     Content-Type: application/json
   
   Body:
   {
     "status": "approved",
     "approved_at": "2025-11-12T10:00:00Z"
   }
   ```

3. **Send Password Email to User**
   - To: john@example.com
   - Subject: "Your ClearAI Password"
   - Body: Include the password from database

---

## 🔗 API Endpoints Summary

### Supabase REST API Base URL
```
https://zflgjgdtizwthvmbvitb.supabase.co/rest/v1/
```

### Supabase Auth API Base URL
```
https://zflgjgdtizwthvmbvitb.supabase.co/auth/v1/
```

### Required Headers for All Requests
```
apikey: [SERVICE_ROLE_KEY]
Authorization: Bearer [SERVICE_ROLE_KEY]
Content-Type: application/json
```

### Common Operations

#### Insert Record
```
POST /rest/v1/[table_name]
Body: { "column": "value" }
```

#### Query Records
```
GET /rest/v1/[table_name]?column=eq.value
```

#### Update Record
```
PATCH /rest/v1/[table_name]?id=eq.[uuid]
Body: { "column": "new_value" }
```

#### Create Auth User
```
POST /auth/v1/admin/users
Body: {
  "email": "user@example.com",
  "password": "password123",
  "email_confirm": true
}
```

---

## 📧 Email Templates

### Admin Notification - New Account Request
```
Subject: 🔔 New ClearAI Account Request from [Full Name]

Hi Admin,

A new user has requested access to ClearAI:

Name: [Full Name]
Email: [Email]
Message: [Message]
Requested: [Date/Time]

Please review and approve or reject this request:

[Approve Button] → https://your-n8n-webhook.com/approve?id=[request_id]
[Reject Button] → https://your-n8n-webhook.com/reject?id=[request_id]

Thank you!
ClearAI System
```

### User Notification - Account Approved
```
Subject: ✅ Your ClearAI Account is Ready!

Hi [Full Name],

Great news! Your ClearAI account has been approved.

Login Credentials:
Email: [Email]
Password: [Generated Password]

Login here: https://your-app-url.com/login

You can change your password after logging in using the "Forgot Password" feature.

Welcome to ClearAI!
```

### Admin Notification - Password Reset
```
Subject: 🔑 Password Reset Request from [Full Name]

Hi Admin,

A user has requested a password reset:

Name: [Full Name]
Email: [Email]
Requested: [Date/Time]

Please approve or reject this request:

[Approve Button] → https://your-n8n-webhook.com/approve-reset?id=[request_id]
[Reject Button] → https://your-n8n-webhook.com/reject-reset?id=[request_id]

Thank you!
ClearAI System
```

### User Notification - Password Reset
```
Subject: 🔑 Your ClearAI Password

Hi [Full Name],

Your password reset request has been approved.

Login Credentials:
Email: [Email]
Password: [Password]

Login here: https://your-app-url.com/login

If you didn't request this, please contact support immediately.

Best regards,
ClearAI Team
```

---

## 🛠️ n8n Workflow Setup

### Workflow 1: New Account Request

**Nodes:**
1. **Webhook Trigger** - Receives request from frontend
2. **Supabase Insert** - Save to account_requests table
3. **Send Email** - Notify admins
4. **Wait for Webhook** - Wait for admin approval
5. **Generate Password** - JavaScript function
6. **Create Auth User** - Supabase Auth API
7. **Create Profile** - Insert into profiles table
8. **Update Request** - Mark as approved
9. **Send Email** - Send password to user

### Workflow 2: Password Reset

**Nodes:**
1. **Webhook Trigger** - Receives reset request
2. **Supabase Query** - Check if user exists
3. **Supabase Insert** - Save to password_reset_requests
4. **Send Email** - Notify admins
5. **Wait for Webhook** - Wait for admin approval
6. **Supabase Query** - Fetch password from account_requests
7. **Update Request** - Mark as approved
8. **Send Email** - Send password to user

---

## 🔐 Security Notes

1. **Never expose Service Role Key** in frontend
2. **Always use HTTPS** for webhooks
3. **Validate webhook signatures** if possible
4. **Rate limit** webhook endpoints
5. **Log all operations** for audit trail
6. **Use secure email service** (SendGrid, Mailgun, etc.)

---

## 📝 Next Steps

1. **Get Service Role Key** from Supabase Dashboard
2. **Create n8n workflows** for both processes
3. **Set up webhook URLs** in n8n
4. **Provide webhook URLs** to update frontend
5. **Test the complete flow** end-to-end
6. **Update email templates** with your branding

---

## 🆘 Support

**Admin Emails:**
- Dmanopla91@gmail.com
- sahilcharandwary@gmail.com

**Supabase Dashboard:**
https://supabase.com/dashboard/project/zflgjgdtizwthvmbvitb

**Current n8n Webhook (if any):**
https://shreyahubcredo.app.n8n.cloud/webhook/b17c4454-a32e-4dc9-8ee9-4da7162c4703

---

## ✅ Checklist

- [ ] Get Supabase Service Role Key
- [ ] Create n8n workflow for account requests
- [ ] Create n8n workflow for password resets
- [ ] Set up email service in n8n
- [ ] Test password generation function
- [ ] Test Supabase Auth user creation
- [ ] Test complete account request flow
- [ ] Test complete password reset flow
- [ ] Update frontend with new webhook URLs
- [ ] Deploy and monitor

---

**Ready to integrate! Send me the webhook URLs when you have them set up in n8n.**
