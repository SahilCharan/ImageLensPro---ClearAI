/*
# Create ImageLens Pro Database Schema

## 1. New Tables

### profiles
- `id` (uuid, primary key, references auth.users)
- `email` (text, unique)
- `full_name` (text)
- `avatar_url` (text)
- `role` (user_role enum: 'user', 'admin')
- `created_at` (timestamptz, default: now())

### images
- `id` (uuid, primary key, default: gen_random_uuid())
- `user_id` (uuid, references profiles.id)
- `original_url` (text, not null) - URL of uploaded image
- `filename` (text, not null)
- `status` (text, default: 'pending') - pending, processing, completed, failed
- `webhook_response` (jsonb) - Store full N8N webhook response
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### errors
- `id` (uuid, primary key, default: gen_random_uuid())
- `image_id` (uuid, references images.id, on delete cascade)
- `error_type` (text, not null) - spelling, grammatical, space, context, suggestions
- `x_coordinate` (numeric, not null)
- `y_coordinate` (numeric, not null)
- `original_text` (text)
- `suggested_correction` (text)
- `description` (text)
- `created_at` (timestamptz, default: now())

## 2. Security

- Enable RLS on all tables
- Create admin helper function to check user role
- Policies:
  - Admins have full access to all tables
  - Users can read/update their own profile
  - Users can manage their own images and view associated errors
  - First registered user becomes admin automatically

## 3. Storage Bucket

- Create 'app-7dzvb2e20qgx_images' bucket for image uploads
- Max file size: 5MB
- Allowed MIME types: image/jpeg, image/png, image/gif
- Public access for reading

## 4. Triggers

- Auto-sync new auth users to profiles table
- First user gets admin role
- Update timestamps on images table
*/

-- Create user role enum
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  full_name text,
  avatar_url text,
  role user_role DEFAULT 'user'::user_role NOT NULL,
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

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE errors ENABLE ROW LEVEL SECURITY;

-- Create admin check function
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'admin'::user_role
  );
$$;

-- Profiles policies
CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) 
  WITH CHECK (role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()));

-- Images policies
CREATE POLICY "Admins have full access to images" ON images
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Users can view own images" ON images
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images" ON images
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own images" ON images
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own images" ON images
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Errors policies
CREATE POLICY "Admins have full access to errors" ON errors
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Users can view errors for their images" ON errors
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM images 
      WHERE images.id = errors.image_id 
      AND images.user_id = auth.uid()
    )
  );

-- Trigger to sync auth.users to profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
BEGIN
  IF OLD IS DISTINCT FROM NULL AND OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL THEN
    SELECT COUNT(*) INTO user_count FROM profiles;
    
    INSERT INTO profiles (id, email, full_name, avatar_url, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
      COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
      CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'user'::user_role END
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_images_updated_at
  BEFORE UPDATE ON images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-7dzvb2e20qgx_images',
  'app-7dzvb2e20qgx_images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'app-7dzvb2e20qgx_images');

CREATE POLICY "Users can view all images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'app-7dzvb2e20qgx_images');

CREATE POLICY "Users can update own images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'app-7dzvb2e20qgx_images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'app-7dzvb2e20qgx_images' AND auth.uid()::text = (storage.foldername(name))[1]);
