/*
# Create Complete ImageLens Pro Database Schema

## Tables Created:
1. profiles - User profiles
2. account_requests - New account requests
3. password_reset_requests - Password reset requests
4. images - Uploaded images
5. errors - Image error detection results
6. user_sessions - User session tracking

## Security:
- RLS enabled on all tables
- Admin and user policies configured
- Storage bucket with policies

## Functions:
- User management functions
- Session management functions
- Admin helper functions
*/

-- Create user role enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  full_name text,
  avatar_url text,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  approval_status text DEFAULT 'approved',
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create account_requests table
CREATE TABLE IF NOT EXISTS account_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text,
  message text,
  status text DEFAULT 'pending',
  approved_by uuid REFERENCES profiles(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create password_reset_requests table
CREATE TABLE IF NOT EXISTS password_reset_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  status text DEFAULT 'pending',
  approved_by uuid REFERENCES profiles(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create images table
CREATE TABLE IF NOT EXISTS images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  original_url text NOT NULL,
  filename text NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  webhook_response jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create errors table
CREATE TABLE IF NOT EXISTS errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id uuid REFERENCES images(id) ON DELETE CASCADE NOT NULL,
  error_type text NOT NULL,
  x_coordinate numeric NOT NULL,
  y_coordinate numeric NOT NULL,
  original_text text,
  suggested_correction text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_token text UNIQUE NOT NULL,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create admin check function
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'admin'::user_role
  );
$$;

-- Profiles policies
DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;
CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Account requests policies
DROP POLICY IF EXISTS "Anyone can create account requests" ON account_requests;
CREATE POLICY "Anyone can create account requests" ON account_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all account requests" ON account_requests;
CREATE POLICY "Admins can view all account requests" ON account_requests
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update account requests" ON account_requests;
CREATE POLICY "Admins can update account requests" ON account_requests
  FOR UPDATE TO authenticated USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete account requests" ON account_requests;
CREATE POLICY "Admins can delete account requests" ON account_requests
  FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- Password reset policies
DROP POLICY IF EXISTS "Authenticated users can create reset requests" ON password_reset_requests;
CREATE POLICY "Authenticated users can create reset requests" ON password_reset_requests
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all reset requests" ON password_reset_requests;
CREATE POLICY "Admins can view all reset requests" ON password_reset_requests
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update reset requests" ON password_reset_requests;
CREATE POLICY "Admins can update reset requests" ON password_reset_requests
  FOR UPDATE TO authenticated USING (is_admin(auth.uid()));

-- Images policies
DROP POLICY IF EXISTS "Admins have full access to images" ON images;
CREATE POLICY "Admins have full access to images" ON images
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can view own images" ON images;
CREATE POLICY "Users can view own images" ON images
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own images" ON images;
CREATE POLICY "Users can insert own images" ON images
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own images" ON images;
CREATE POLICY "Users can update own images" ON images
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own images" ON images;
CREATE POLICY "Users can delete own images" ON images
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Errors policies
DROP POLICY IF EXISTS "Admins have full access to errors" ON errors;
CREATE POLICY "Admins have full access to errors" ON errors
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can view errors for their images" ON errors;
CREATE POLICY "Users can view errors for their images" ON errors
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM images 
      WHERE images.id = errors.image_id 
      AND images.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert errors for their images" ON errors;
CREATE POLICY "Users can insert errors for their images" ON errors
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM images 
      WHERE images.id = errors.image_id 
      AND images.user_id = auth.uid()
    )
  );

-- User sessions policies
DROP POLICY IF EXISTS "Admins can view all sessions" ON user_sessions;
CREATE POLICY "Admins can view all sessions" ON user_sessions
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can view own sessions" ON user_sessions;
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own sessions" ON user_sessions;
CREATE POLICY "Users can create own sessions" ON user_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON user_sessions;
CREATE POLICY "Users can update own sessions" ON user_sessions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sessions" ON user_sessions;
CREATE POLICY "Users can delete own sessions" ON user_sessions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create trigger function for new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL THEN
    SELECT COUNT(*) INTO user_count FROM profiles;
    
    INSERT INTO profiles (id, email, full_name, avatar_url, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
      COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
      CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'user'::user_role END
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_images_updated_at ON images;
CREATE TRIGGER update_images_updated_at
  BEFORE UPDATE ON images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_account_requests_updated_at ON account_requests;
CREATE TRIGGER update_account_requests_updated_at
  BEFORE UPDATE ON account_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create session activity update function
CREATE OR REPLACE FUNCTION update_session_activity(session_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_sessions
  SET last_activity = now()
  WHERE id = session_id;
END;
$$;

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-7dzvb2e20qgx_images',
  'app-7dzvb2e20qgx_images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'app-7dzvb2e20qgx_images');

DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
CREATE POLICY "Public can view images" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'app-7dzvb2e20qgx_images');

DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
CREATE POLICY "Users can update own images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'app-7dzvb2e20qgx_images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'app-7dzvb2e20qgx_images' AND auth.uid()::text = (storage.foldername(name))[1]);
