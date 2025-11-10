/*
# Fix User Profile Creation

## Purpose
Update the handle_new_user trigger to create profiles for users even when email confirmation is disabled.

## Changes
- Modified trigger to handle both confirmed and unconfirmed users
- Creates profile immediately on user creation if email confirmation is disabled
- Maintains backward compatibility with email confirmation flow

## Security
- No changes to RLS policies
- Maintains existing security model
*/

-- Drop the existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the function to handle both confirmed and unconfirmed users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
BEGIN
  -- Handle email confirmation flow (when confirmed_at changes from NULL to a value)
  IF OLD IS DISTINCT FROM NULL AND OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL THEN
    -- Check if profile already exists
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
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
  END IF;
  
  -- Handle immediate profile creation (when email confirmation is disabled)
  -- This triggers on INSERT when confirmed_at is already set
  IF OLD IS NULL AND NEW.confirmed_at IS NOT NULL THEN
    -- Check if profile already exists
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
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
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger for both INSERT and UPDATE
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
