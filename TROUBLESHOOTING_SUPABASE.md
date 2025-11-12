# Troubleshooting Guide - Supabase Issues

## 🔍 Issue 1: Can't See Tables in Supabase Dashboard

### ✅ Tables ARE Created!
I've verified that all tables exist in your database:
- ✅ `profiles`
- ✅ `account_requests`
- ✅ `password_reset_requests`
- ✅ `images`
- ✅ `errors`
- ✅ `user_sessions`

### 🎯 Solution: Make Sure You're Looking at the RIGHT Project

**Your NEW Project ID:** `nqcddjtthriiisucfxoy`

**Steps to View Tables:**

1. **Go to Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/nqcddjtthriiisucfxoy
   ```

2. **Click "Table Editor" in the left sidebar**
   - You should see all 6 tables listed

3. **If you don't see tables:**
   - Make sure you're in the correct project (check URL)
   - The project ID should be: `nqcddjtthriiisucfxoy`
   - Click the refresh button in the Table Editor

4. **Alternative: Use SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Run this query:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```
   - You should see all 6 tables

---

## 🔍 Issue 2: Image Upload Failing - "Signature Verification Failed"

### Root Cause
This error means the JWT token is invalid or from a different Supabase project.

### ✅ Solution: Clear Browser Cache and Reload

**The frontend has been updated with your NEW credentials, but your browser might be caching the old ones.**

#### Method 1: Hard Refresh (Recommended)
1. **Windows/Linux:** Press `Ctrl + Shift + R`
2. **Mac:** Press `Cmd + Shift + R`
3. This will force reload without cache

#### Method 2: Clear Browser Cache
1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

#### Method 3: Clear All Site Data
1. Open Developer Tools (F12)
2. Go to "Application" tab
3. Click "Clear site data"
4. Refresh the page

#### Method 4: Incognito/Private Window
1. Open a new incognito/private window
2. Go to your application
3. Try uploading an image
4. If it works, the issue was browser cache

---

## 🔍 Issue 3: Still Getting Errors After Cache Clear

### Check 1: Verify Credentials in Browser

1. **Open Developer Tools** (F12)
2. **Go to Console tab**
3. **Type this and press Enter:**
   ```javascript
   console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
   console.log('Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
   ```

4. **Expected Output:**
   ```
   Supabase URL: https://nqcddjtthriiisucfxoy.supabase.co
   Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xY2RkanR0aHJpaWlzdWNmeG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5Mzk5MDYsImV4cCI6MjA3ODUxNTkwNn0.uASTX8M-oIa0BKZDR07EHZ59KglXazyOxorP7C1yuuo
   ```

5. **If you see different values:**
   - The build is using old credentials
   - Need to rebuild the application

### Check 2: Verify Storage Bucket

1. **Go to Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/nqcddjtthriiisucfxoy/storage/buckets
   ```

2. **You should see:**
   - Bucket name: `app-7dzvb2e20qgx_images`
   - Public: Yes
   - File size limit: 5 MB

3. **Click on the bucket** to see if it's accessible

### Check 3: Test Upload Manually

1. **Go to Storage in Supabase Dashboard**
2. **Click on `app-7dzvb2e20qgx_images` bucket**
3. **Try uploading a test image manually**
4. **If manual upload works:**
   - The bucket is fine
   - Issue is in the frontend code

---

## 🔧 Quick Fixes

### Fix 1: Restart Development Server

If you're running locally:
```bash
# Stop the server (Ctrl+C)
# Clear node_modules cache
rm -rf node_modules/.vite

# Restart
npm run dev
```

### Fix 2: Check Authentication

The "signature verification failed" error often means:
- User is not authenticated
- Token is expired
- Token is from wrong project

**Solution:**
1. Log out of the application
2. Clear browser cache
3. Log in again
4. Try uploading

### Fix 3: Check Network Tab

1. **Open Developer Tools** (F12)
2. **Go to Network tab**
3. **Try uploading an image**
4. **Look for failed requests** (red)
5. **Click on the failed request**
6. **Check the Response tab** for error details

**Common Errors:**

- **401 Unauthorized:** User not logged in or token expired
- **403 Forbidden:** User doesn't have permission
- **422 Unprocessable Entity:** Invalid file or data
- **Signature verification failed:** Wrong credentials or expired token

---

## 🎯 Correct Credentials (For Reference)

### Your NEW Supabase Project

```
Project ID: nqcddjtthriiisucfxoy
Project URL: https://nqcddjtthriiisucfxoy.supabase.co
Dashboard: https://supabase.com/dashboard/project/nqcddjtthriiisucfxoy

Anon Key:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xY2RkanR0aHJpaWlzdWNmeG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5Mzk5MDYsImV4cCI6MjA3ODUxNTkwNn0.uASTX8M-oIa0BKZDR07EHZ59KglXazyOxorP7C1yuuo

Service Role Key:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xY2RkanR0aHJpaWlzdWNmeG95Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkzOTkwNiwiZXhwIjoyMDc4NTE1OTA2fQ.KUstYhxQEQSZRP2IrCOOHeuUd7ei5lgrXn9kz7KvFA0
```

### Storage Bucket

```
Bucket ID: app-7dzvb2e20qgx_images
Public: Yes
Max File Size: 5 MB
Allowed Types: image/jpeg, image/png, image/gif
```

---

## 📋 Verification Checklist

Use this checklist to verify everything is working:

### Database
- [ ] Can access Supabase dashboard
- [ ] Can see project: `nqcddjtthriiisucfxoy`
- [ ] Can see all 6 tables in Table Editor
- [ ] Tables have correct columns

### Storage
- [ ] Can see storage buckets
- [ ] Bucket `app-7dzvb2e20qgx_images` exists
- [ ] Bucket is public
- [ ] Can manually upload test image

### Frontend
- [ ] Cleared browser cache
- [ ] Hard refreshed the page
- [ ] Can log in successfully
- [ ] Console shows correct Supabase URL
- [ ] Console shows correct Anon Key

### Upload Test
- [ ] Can select an image file
- [ ] Upload button is clickable
- [ ] No errors in console
- [ ] Image uploads successfully
- [ ] Can see uploaded image

---

## 🆘 Still Having Issues?

### Get Detailed Error Information

1. **Open Browser Console** (F12)
2. **Go to Console tab**
3. **Try uploading an image**
4. **Copy ALL error messages**
5. **Send me:**
   - The complete error message
   - Screenshot of Network tab (failed requests)
   - Screenshot of Console tab (errors)

### Check These Common Issues

1. **Wrong Project**
   - Make sure you're looking at project `nqcddjtthriiisucfxoy`
   - Not the old project `zflgjgdtizwthvmbvitb`

2. **Browser Cache**
   - Try incognito/private window
   - Try different browser

3. **Authentication**
   - Make sure you're logged in
   - Try logging out and back in

4. **File Size**
   - Make sure image is under 5 MB
   - Try with a smaller test image

5. **File Type**
   - Only JPG, PNG, GIF are allowed
   - Try with a different image format

---

## 🔍 Debug Commands

### Check if tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Check storage bucket:
```sql
SELECT id, name, public, file_size_limit 
FROM storage.buckets;
```

### Check storage policies:
```sql
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

### Check profiles:
```sql
SELECT id, email, full_name, role 
FROM profiles;
```

---

## ✅ Expected Behavior

### When Everything Works:

1. **Login**
   - User can log in with Google
   - Redirected to dashboard
   - Profile loaded successfully

2. **Upload**
   - Click "Process Image" or "Upload"
   - Select an image file (JPG, PNG, or GIF under 5MB)
   - Click upload button
   - See progress indicator
   - Image uploads successfully
   - Redirected to results page

3. **View**
   - Can see uploaded images in dashboard
   - Can view image details
   - Can see error markers on image

---

## 📞 Contact

If none of these solutions work, provide:
1. Complete error message from console
2. Screenshot of Network tab
3. Screenshot of Supabase Table Editor
4. Browser and version you're using

---

**Most Common Solution: Clear browser cache and hard refresh (Ctrl+Shift+R)** 🔄
