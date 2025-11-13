# Supabase Configuration - Verified ✅

## Current Configuration

**Project Name:** OCR Image database  
**Project ID:** `nqcddjtthriiisucfxoy`  
**Project URL:** `https://nqcddjtthriiisucfxoy.supabase.co`  
**Status:** ✅ **CONNECTED AND WORKING**

## Environment Variables

Located in `.env` file:

```env
VITE_SUPABASE_URL=https://nqcddjtthriiisucfxoy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc... (configured)
```

## Database Tables

The following tables are created in your Supabase project:

1. **profiles** - User profiles and roles
2. **images** - Uploaded images for OCR analysis
3. **errors** - Detected errors in images
4. **user_sessions** - Active user sessions
5. **account_requests** - New account requests
6. **password_reset_requests** - Password reset requests

## Storage Buckets

- **nqcddjtthriiisucfxoy_images** - Image file storage (5MB limit)

## Access URLs

### Supabase Dashboard
```
https://supabase.com/dashboard/project/nqcddjtthriiisucfxoy
```

### Direct Links
- **SQL Editor:** https://supabase.com/dashboard/project/nqcddjtthriiisucfxoy/sql/new
- **Table Editor:** https://supabase.com/dashboard/project/nqcddjtthriiisucfxoy/editor
- **Storage:** https://supabase.com/dashboard/project/nqcddjtthriiisucfxoy/storage/buckets
- **Authentication:** https://supabase.com/dashboard/project/nqcddjtthriiisucfxoy/auth/users
- **Logs:** https://supabase.com/dashboard/project/nqcddjtthriiisucfxoy/logs

## Verification

To verify the connection is working:

```bash
# Run the application
pnpm run dev

# The app should connect to Supabase successfully
# Check browser console for any connection errors
```

## Authentication Setup

**Login Type:** Google OAuth (Gmail)

**Configured in:** `.env`
```env
VITE_LOGIN_TYPE=gmail
```

## API Integration

**N8N Webhooks configured:**
- Account requests: `https://shreyahubcredo.app.n8n.cloud/webhook/9ce6e766-1159-489f-b634-a0b93dbbdac1`
- Password reset: `https://shreyahubcredo.app.n8n.cloud/webhook/3450ee29-9d06-4d8a-9e79-b6ae0183c2e2`

## Security

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only access their own data
- ✅ Admin role has full access
- ✅ Secure file uploads with size limits
- ✅ HTTPS only

## Status

🟢 **All systems operational**

The application is correctly configured and connected to your Supabase database.
