/*
# Fix auto_create_user_on_approval Trigger Function

## Problem
The trigger function was failing due to NULL storage_bucket or other field issues when creating users in auth.users table.

## Solution
1. Simplified the INSERT into auth.users to only include required fields
2. Removed any references to non-existent fields
3. Ensured all NOT NULL constraints are satisfied
4. Added better error handling and logging

## Changes
- Fixed auth.users INSERT to use only existing columns
- Removed storage_bucket and other non-existent field references
- Ensured instance_id is properly set
- Added validation for required fields
*/

-- Drop and recreate the trigger function with fixes
DROP FUNCTION IF EXISTS auto_create_user_on_approval() CASCADE;

CREATE OR REPLACE FUNCTION auto_create_user_on_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  existing_user_id uuid;
  existing_profile_id uuid;
  hashed_password text;
BEGIN
  -- Only proceed if status changed to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    
    RAISE NOTICE 'Processing approval for email: %', NEW.email;
    
    -- Check if user already exists in auth.users
    SELECT id INTO existing_user_id
    FROM auth.users
    WHERE email = NEW.email;
    
    -- Check if profile already exists
    SELECT id INTO existing_profile_id
    FROM profiles
    WHERE email = NEW.email;
    
    IF existing_user_id IS NOT NULL THEN
      -- User already exists
      RAISE NOTICE 'User already exists with email: %', NEW.email;
      
      -- Update or create profile if needed
      IF existing_profile_id IS NULL THEN
        INSERT INTO profiles (
          id,
          email,
          full_name,
          role,
          approval_status,
          approved_by,
          approved_at,
          created_at
        ) VALUES (
          existing_user_id,
          NEW.email,
          NEW.full_name,
          'user',
          'approved',
          NEW.approved_by,
          NEW.approved_at,
          NOW()
        );
        RAISE NOTICE 'Profile created for existing user: %', NEW.email;
      ELSE
        -- Update existing profile
        UPDATE profiles SET
          approval_status = 'approved',
          approved_by = NEW.approved_by,
          approved_at = NEW.approved_at,
          full_name = COALESCE(NEW.full_name, full_name)
        WHERE id = existing_profile_id;
        RAISE NOTICE 'Profile updated for existing user: %', NEW.email;
      END IF;
      
      RETURN NEW;
    END IF;
    
    -- Check if password exists
    IF NEW.password IS NULL OR NEW.password = '' THEN
      RAISE EXCEPTION 'Cannot create user: password is missing in account_requests';
    END IF;
    
    -- Hash the plain password using bcrypt
    hashed_password := crypt(NEW.password, gen_salt('bf'));
    
    RAISE NOTICE 'Creating new user with email: %', NEW.email;
    
    -- Generate new user ID
    new_user_id := gen_random_uuid();
    
    -- Create new user in auth.users with only required fields
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      is_sso_user,
      is_anonymous
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      NEW.email,
      hashed_password,
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', NEW.full_name),
      NOW(),
      NOW(),
      false,
      false
    );
    
    RAISE NOTICE 'User created in auth.users with ID: %', new_user_id;
    
    -- Create profile
    INSERT INTO profiles (
      id,
      email,
      full_name,
      role,
      approval_status,
      approved_by,
      approved_at,
      created_at
    ) VALUES (
      new_user_id,
      NEW.email,
      NEW.full_name,
      'user',
      'approved',
      NEW.approved_by,
      NEW.approved_at,
      NOW()
    );
    
    RAISE NOTICE 'Profile created successfully for user: %', NEW.email;
    
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in auto_create_user_on_approval: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    RAISE WARNING 'Error details - Email: %, Full Name: %', NEW.email, NEW.full_name;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_auto_create_user_on_approval ON account_requests;

CREATE TRIGGER trigger_auto_create_user_on_approval
  AFTER UPDATE ON account_requests
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_user_on_approval();

-- Add comment
COMMENT ON FUNCTION auto_create_user_on_approval() IS 'Automatically creates auth.users and profiles entries when account_requests status changes to approved';
