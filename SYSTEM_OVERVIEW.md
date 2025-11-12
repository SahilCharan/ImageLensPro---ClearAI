# ImageLens Pro - System Overview

## 🎯 Application Purpose

ImageLens Pro is an intelligent image error detection platform that:
- Analyzes uploaded images for errors
- Identifies spelling, grammatical, space, context errors
- Provides visual feedback with interactive markers
- Offers correction suggestions

---

## 🏗️ System Architecture

### Frontend
- **Framework:** React + TypeScript
- **UI Library:** shadcn/ui + Tailwind CSS
- **Routing:** React Router
- **State Management:** React Context + Hooks

### Backend
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth (Google OAuth)
- **Storage:** Supabase Storage
- **Automation:** N8N Workflows

### Integration
- **N8N Webhooks:** For account management and notifications
- **Google OAuth:** For user authentication
- **Image Processing:** Via external AI services (to be integrated)

---

## 📊 Database Schema

### Tables

#### 1. profiles
User profile information
```sql
- id (uuid, primary key)
- email (text, unique)
- full_name (text)
- avatar_url (text)
- role (enum: 'user', 'admin')
- created_at (timestamp)
```

#### 2. account_requests
New account access requests
```sql
- id (uuid, primary key)
- full_name (text)
- email (text, unique)
- password_hash (text) - Set by n8n
- message (text)
- status (text: 'pending', 'approved', 'rejected')
- approved_by (uuid)
- approved_at (timestamp)
- created_at (timestamp)
```

#### 3. password_reset_requests
Password reset requests
```sql
- id (uuid, primary key)
- user_id (uuid)
- email (text)
- full_name (text)
- status (text: 'pending', 'approved', 'rejected')
- approved_by (uuid)
- approved_at (timestamp)
- created_at (timestamp)
```

#### 4. images
Uploaded images for analysis
```sql
- id (uuid, primary key)
- user_id (uuid)
- original_url (text)
- filename (text)
- status (text: 'pending', 'processing', 'completed', 'failed')
- webhook_response (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 5. errors
Detected errors in images
```sql
- id (uuid, primary key)
- image_id (uuid)
- error_type (text: 'spelling', 'grammatical', 'space', 'context', 'suggestions')
- x_coordinate (numeric)
- y_coordinate (numeric)
- original_text (text)
- suggested_correction (text)
- description (text)
- created_at (timestamp)
```

#### 6. user_sessions
User session tracking
```sql
- id (uuid, primary key)
- user_id (uuid)
- session_token (text)
- last_activity (timestamp)
- created_at (timestamp)
```

---

## 🔐 Security & Permissions

### Row Level Security (RLS)
All tables have RLS enabled with policies:

**Admins:**
- Full access to all tables
- Can approve/reject requests
- Can manage all users

**Users:**
- Can view/update own profile
- Can manage own images
- Can view errors for own images
- Can create account/password reset requests

**Anonymous:**
- Can create account requests (public access)

### Storage Policies
**Bucket:** `app-7dzvb2e20qgx_images`
- Authenticated users can upload
- Public can view
- Users can update/delete own images
- Max size: 5 MB
- Allowed types: JPG, PNG, GIF

---

## 🔄 User Flows

### 1. New User Registration Flow

```
User → Request Account Page
  ↓
Fill form (name, email, message)
  ↓
Submit → Save to database
  ↓
Trigger N8N Webhook
  ↓
N8N sends email to admins
  ↓
Admin clicks approve link
  ↓
N8N generates password
  ↓
N8N creates user in Supabase Auth
  ↓
N8N creates profile
  ↓
N8N sends password email to user
  ↓
User receives email with password
  ↓
User logs in with Google
```

### 2. Password Reset Flow

```
User → Forgot Password Page
  ↓
Enter email
  ↓
Check if user exists
  ↓
Create reset request
  ↓
Trigger N8N Webhook
  ↓
N8N sends email to admins
  ↓
Admin clicks approve link
  ↓
N8N fetches password from database
  ↓
N8N sends password email to user
  ↓
User receives email with password
  ↓
User logs in
```

### 3. Image Upload & Analysis Flow

```
User → Upload Image Page
  ↓
Select image file (< 5MB)
  ↓
Upload to Supabase Storage
  ↓
Create image record in database
  ↓
Trigger image analysis (future: AI service)
  ↓
Receive error detection results
  ↓
Save errors to database
  ↓
Display image with error markers
  ↓
User hovers over markers
  ↓
Show error details and suggestions
```

---

## 🔧 Configuration

### Environment Variables (.env)
```
VITE_LOGIN_TYPE=gmail
VITE_APP_ID=app-7dzvb2e20qgx
VITE_SUPABASE_URL=https://nqcddjtthriiisucfxoy.supabase.co
VITE_SUPABASE_ANON_KEY=[anon key]
VITE_API_ENV=production
VITE_N8N_ACCOUNT_REQUEST_WEBHOOK=[webhook url]
VITE_N8N_PASSWORD_RESET_WEBHOOK=[webhook url]
```

### Supabase Project
```
Project ID: nqcddjtthriiisucfxoy
Region: [auto-selected]
Database: PostgreSQL
Storage: Enabled
Auth: Google OAuth enabled
```

---

## 📡 API Endpoints

### Supabase REST API
```
Base URL: https://nqcddjtthriiisucfxoy.supabase.co/rest/v1/

Endpoints:
- GET/POST /profiles
- GET/POST /account_requests
- GET/POST /password_reset_requests
- GET/POST /images
- GET/POST /errors
- GET/POST /user_sessions
```

### Supabase Auth API
```
Base URL: https://nqcddjtthriiisucfxoy.supabase.co/auth/v1/

Endpoints:
- POST /signup
- POST /token (login)
- POST /logout
- GET /user
- POST /admin/users (admin only)
```

### Supabase Storage API
```
Base URL: https://nqcddjtthriiisucfxoy.supabase.co/storage/v1/

Endpoints:
- POST /object/app-7dzvb2e20qgx_images
- GET /object/public/app-7dzvb2e20qgx_images/{path}
- DELETE /object/app-7dzvb2e20qgx_images/{path}
```

### N8N Webhooks
```
Account Request:
POST https://shreyahubcredo.app.n8n.cloud/webhook/9ce6e766-1159-489f-b634-a0b93dbbdac1

Password Reset:
POST https://shreyahubcredo.app.n8n.cloud/webhook/3450ee29-9d06-4d8a-9e79-b6ae0183c2e2
```

---

## 🎨 UI Components

### Pages
- `/` - Home page
- `/login` - Login page (Google OAuth)
- `/request-account` - Account request form
- `/forgot-password` - Password reset request
- `/dashboard` - User dashboard (protected)
- `/upload` - Image upload page (protected)
- `/image/:id` - Image detail with error markers (protected)

### Key Components
- `Header` - Navigation with user profile dropdown
- `RequireAuth` - Protected route wrapper
- `AuthProvider` - Authentication context
- `Logo` - Application logo
- `PageMeta` - SEO and meta tags

---

## 🔍 Error Detection System

### Error Types
1. **Spelling Errors** (Red markers)
   - Misspelled words
   - Typos

2. **Grammatical Errors** (Orange markers)
   - Grammar mistakes
   - Syntax errors

3. **Space Issues** (Yellow markers)
   - Missing spaces
   - Extra spaces

4. **Context Errors** (Blue markers)
   - Wrong word usage
   - Context mismatches

5. **Suggestions** (Green markers)
   - Improvement suggestions
   - Alternative phrasings

### Visual Feedback
- Color-coded dot markers on image
- Hover to see error details
- Coordinate-based positioning
- Original image preservation
- Zoom and pan functionality

---

## 👥 User Roles

### Admin
- Full database access
- Can approve/reject account requests
- Can approve/reject password resets
- Can view all users and images
- Can promote users to admin

**Current Admins:**
- sahilcharandwary@gmail.com
- Dmanopla91@gmail.com

### User
- Can upload images
- Can view own images
- Can view errors for own images
- Can update own profile
- Can request password reset

---

## 🚀 Deployment

### Frontend
- Built with Vite
- Deployed to [your hosting platform]
- Environment variables configured

### Backend
- Supabase hosted
- PostgreSQL database
- Automatic backups
- CDN for storage

### Automation
- N8N workflows hosted
- Webhook endpoints configured
- Email notifications enabled

---

## 📈 Future Enhancements

### Planned Features
1. **AI Integration**
   - Connect to image analysis AI service
   - Automatic error detection
   - Real-time processing

2. **Batch Processing**
   - Upload multiple images
   - Bulk error detection
   - Export results

3. **Collaboration**
   - Share images with team
   - Comment on errors
   - Approval workflows

4. **Analytics**
   - Error statistics
   - User activity tracking
   - Performance metrics

5. **Export Options**
   - PDF reports
   - CSV exports
   - Annotated images

---

## 🛠️ Maintenance

### Regular Tasks
- Monitor Supabase usage
- Review error logs
- Update dependencies
- Backup database
- Check storage usage

### Monitoring
- User activity
- Error rates
- API response times
- Storage capacity
- Authentication success rate

---

## 📞 Support

### Admin Contacts
- Dmanopla91@gmail.com
- sahilcharandwary@gmail.com

### Documentation
- `READ_ME_FIRST.md` - Quick start
- `SETUP_COMPLETE.md` - Setup details
- `TROUBLESHOOTING_SUPABASE.md` - Troubleshooting
- `N8N_SETUP_COMPLETE.md` - N8N integration

---

## ✅ System Status

- ✅ Database: Configured and ready
- ✅ Authentication: Google OAuth enabled
- ✅ Storage: Bucket created (5MB limit)
- ✅ N8N: Webhooks configured
- ✅ Frontend: Updated with new credentials
- ✅ Security: RLS policies enabled
- ✅ Admin Users: Created and active

**Status:** 🟢 All Systems Operational

---

**Last Updated:** 2025-11-07  
**Version:** 1.0.0  
**Project ID:** nqcddjtthriiisucfxoy
