# ImageLens Pro - ClearAI

**ImageLens Pro** is an intelligent, web-based platform designed for the automated detection and correction of errors within images. Leveraging powerful AI, it identifies various issues—from spelling and grammar to contextual mistakes—and presents them in a clear, interactive, and user-friendly interface.

This platform is ideal for quality assurance in content creation, ensuring that visual materials are polished and error-free before publication.

---

### Live Demo

**[https://app-7dzvb2e20qgx.appmedo.com](https://app-7dzvb2e20qgx.appmedo.com)**

---

## Key Features

-   **Secure Authentication**: Robust user management with options for email/password and Google OAuth sign-in.
-   **Admin-Managed Access**: A built-in workflow where administrators must approve new account requests before users can log in.
-   **Admin Dashboard**: A dedicated interface for administrators to manage user accounts and review account requests.
-   **Effortless Image Upload**: A modern drag-and-drop interface for easy image submission.
-   **AI-Powered Analysis**: Utilizes Google's Gemini Vision API to automatically detect a variety of errors in uploaded images.
-   **Interactive Bounding Boxes**: Errors are highlighted directly on the image with interactive boxes. Hover over any box to see detailed information about the error and suggested corrections.
-   **Color-Coded Error Types**: Errors are categorized and color-coded for quick identification (Spelling, Grammar, Spacing, Context, Suggestions).
-   **User Dashboard**: A personal space for users to view and manage all their analyzed images.

---

## Authentication and User Workflow

This section outlines the core user management and data handling processes for the platform.

### New User Registration

1.  **Request Access**: A prospective user submits a request to join the platform through the registration form.
2.  **Webhook Trigger**: This action calls an n8n webhook, initiating the automated onboarding process.
3.  **Password Generation**: The n8n workflow generates a secure password for the user and stores it in the `password` column of the `account_requests` table.
4.  **User Notification**: An email is automatically sent to the user containing their new password.
5.  **Account Creation**: Simultaneously, a new user record is created in the `users` table, granting them access to the platform.
6.  **Login**: The user can now log in using their email and the password they received.

### Password Recovery

1.  **Initiate Recovery**: A user who has forgotten their password uses the "Forgot Password" feature.
2.  **User Verification**: The system checks if a user with the provided email exists in the database.
3.  **Fetch Password**: If the user exists, an n8n webhook is triggered to fetch the user's current password from their account record.
4.  **Send Password**: The password is sent to the user's registered email address, allowing them to regain access.

### User Storage and Data Management

-   **Bucket Assignment**: Upon a user's first successful login, a dedicated and secure storage bucket is automatically assigned to them in Supabase Storage.
-   **Data Isolation**: All images uploaded by the user, along with the corresponding error analysis data, are stored exclusively in their assigned bucket, ensuring data privacy and organization.

---

## Tech Stack

-   **Frontend**: React, TypeScript, Vite
-   **UI Framework**: shadcn/ui
-   **Styling**: Tailwind CSS
-   **Backend & Database**: Supabase
-   **Authentication**: Supabase Auth
-   **Storage**: Supabase Storage
-   **Automation**: n8n (for user registration and password workflows)

---

## Database Schema

The database schema is managed via Supabase migrations. The primary schema, which includes tables for profiles, images, errors, and account management, is defined in the SQL file below.

<details>
<summary>Click to view the complete SQL schema</summary>

```sql
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


-- Promote Sahil to admin
UPDATE profiles
SET role = 'admin'::user_role
WHERE email = 'sahilcharandwary@gmail.com';

-- Create Dmano admin
INSERT INTO auth.users (id, email, encrypted_password, role, email_confirmed_at)
VALUES ('d1508358-6b8a-4f4e-b488-8e3e0d764be4', 'dmano@dmano.com', crypt('dmano123', gen_salt('bf')), 'authenticated', now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, email, full_name, role)
VALUES ('d1508358-6b8a-4f4e-b488-8e3e0d764be4', 'dmano@dmano.com', 'Dmano Admin', 'admin'::user_role)
ON CONFLICT (id) DO NOTHING;

-- Function to create user on account approval
CREATE OR REPLACE FUNCTION auto_create_user_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Create user in auth.users
    INSERT INTO auth.users (email, password, role, email_confirmed_at)
    VALUES (NEW.email, NEW.password_hash, 'authenticated', now())
    RETURNING id INTO new_user_id;

    -- Create profile
    INSERT INTO profiles (id, email, full_name, role, approval_status, approved_by, approved_at)
    VALUES (new_user_id, NEW.email, NEW.full_name, 'user'::user_role, 'approved', NEW.approved_by, now());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_account_request_approved ON account_requests;
CREATE TRIGGER on_account_request_approved
  AFTER UPDATE ON account_requests
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_user_on_approval();

-- Add original dimensions to images table
ALTER TABLE images ADD COLUMN IF NOT EXISTS original_width integer;
ALTER TABLE images ADD COLUMN IF NOT EXISTS original_height integer;

-- Add dimensions to errors table
ALTER TABLE errors ADD COLUMN IF NOT EXISTS width integer;
ALTER TABLE errors ADD COLUMN IF NOT EXISTS height integer;

-- Fix RLS for anon account requests
ALTER TABLE account_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE account_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read access" ON account_requests;
CREATE POLICY "Allow anon read access" ON account_requests
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon insert" ON account_requests;
CREATE POLICY "Allow anon insert" ON account_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Disable RLS on account_requests for simplicity
ALTER TABLE account_requests DISABLE ROW LEVEL SECURITY;

-- Make password hash nullable
ALTER TABLE account_requests ALTER COLUMN password_hash DROP NOT NULL;

-- Fix auto_create_user_on_approval trigger
CREATE OR REPLACE FUNCTION auto_create_user_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  storage_bucket_id uuid;
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Create user in auth.users
    INSERT INTO auth.users (email, password, role, email_confirmed_at)
    VALUES (NEW.email, NEW.password_hash, 'authenticated', now())
    RETURNING id INTO new_user_id;

    -- Create profile
    INSERT INTO profiles (id, email, full_name, role, approval_status, approved_by, approved_at)
    VALUES (new_user_id, NEW.email, NEW.full_name, 'user'::user_role, 'approved', NEW.approved_by, now());

    -- Create storage bucket for user
    SELECT id INTO storage_bucket_id FROM storage.buckets WHERE name = 'app-7dzvb2e20qgx_images';
    IF storage_bucket_id IS NOT NULL THEN
      INSERT INTO storage.objects (bucket_id, name, owner)
      VALUES (storage_bucket_id, new_user_id::text, new_user_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Re-enable RLS on account_requests
ALTER TABLE account_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read access" ON account_requests;
DROP POLICY IF EXISTS "Allow anon insert" ON account_requests;
CREATE POLICY "Allow anon insert" ON account_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can manage all" ON account_requests FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Users can view their own" ON account_requests FOR SELECT TO authenticated USING (email = (SELECT u.email FROM auth.users u WHERE u.id = auth.uid()));

```

</details>

---

## Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or newer)
-   [pnpm](https://pnpm.io/installation) package manager
-   A [Supabase](https://supabase.io/) account to set up the database and authentication.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/SahilCharan/ImageLensPro---ClearAI.git
    cd ImageLensPro---ClearAI
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up Supabase:**
    -   Create a new project on [Supabase](https://app.supabase.io/).
    -   Navigate to the **SQL Editor** in your Supabase project.
    -   Run the SQL code provided in the "Database Schema" section above to set up your database.

4.  **Configure Environment Variables:**
    -   Create a new file named `.env` in the root of the project.
    -   Go to your Supabase project's **Settings > API**.
    -   Copy the **Project URL** and **`anon` public key** into your `.env` file like this:

    ```env
    VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

5.  **Run the development server:**
    The original run script is `lint`. You may want to change the `dev` script in `package.json` to `vite` to run the development server.
    ```bash
    # Recommended: Change the "dev" script in package.json to "vite"
    pnpm run dev
    ```
    The application should now be running on `http://localhost:5173` (or another port if 5173 is in use).

---

## Usage

1.  **Request an Account**: New users must first request an account.
2.  **Admin Approval**: An administrator must approve the request from the Admin Dashboard.
3.  **Login**: Once approved, sign in with your credentials or Google.
4.  **Upload**: Navigate to the upload page and drop an image for analysis.
5.  **Review**: The system will process the image and redirect you to the analysis page, where you can review the highlighted errors.
6.  **Dashboard**: Visit your dashboard to see a history of all your uploaded images.

---

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.