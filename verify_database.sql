-- ============================================
-- Database Verification Script
-- Run this in Supabase SQL Editor to verify everything
-- ============================================

-- 1. Check which database we're connected to
SELECT 
  current_database() as database_name,
  current_user as user_name,
  version() as postgres_version;

-- 2. List all tables in public schema
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Expected: 6 tables
-- - account_requests
-- - errors
-- - images
-- - password_reset_requests
-- - profiles
-- - user_sessions

-- 3. Check profiles table structure
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 4. Check account_requests table structure
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'account_requests' 
ORDER BY ordinal_position;

-- 5. Check images table structure
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'images' 
ORDER BY ordinal_position;

-- 6. Check errors table structure
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'errors' 
ORDER BY ordinal_position;

-- 7. Check storage buckets
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets;

-- Expected: 1 bucket
-- - app-7dzvb2e20qgx_images (public, 5MB limit)

-- 8. Check RLS policies
SELECT 
  schemaname,
  tablename, 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Expected: Multiple policies for each table

-- 9. Check RPC functions
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Expected: 12 functions including:
-- - is_admin
-- - handle_new_user
-- - update_session_activity
-- - approve_account_request
-- - etc.

-- 10. Count records in each table
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'account_requests', COUNT(*) FROM account_requests
UNION ALL
SELECT 'password_reset_requests', COUNT(*) FROM password_reset_requests
UNION ALL
SELECT 'images', COUNT(*) FROM images
UNION ALL
SELECT 'errors', COUNT(*) FROM errors
UNION ALL
SELECT 'user_sessions', COUNT(*) FROM user_sessions;

-- 11. Check if any admin users exist
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
WHERE role = 'admin';

-- 12. Check storage policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY policyname;

-- ============================================
-- VERIFICATION SUMMARY
-- ============================================
-- If all queries above return results:
-- ✅ Database is properly configured
-- ✅ All tables exist
-- ✅ Storage bucket exists
-- ✅ RLS policies are enabled
-- ✅ Functions are created
--
-- Next steps:
-- 1. Configure Google OAuth in Supabase
-- 2. Create admin user
-- 3. Test login
-- ============================================
