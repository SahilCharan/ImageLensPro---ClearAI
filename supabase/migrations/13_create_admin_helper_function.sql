/*
# Create Helper Function to Promote Users to Admin

## Purpose
Create a SQL function that can promote existing users to admin role
This will be used to make Dmano an admin after their account is created

## Usage
After Dmano's account is approved through the UI:
SELECT promote_user_to_admin('Dmanopla91@gmail.com');

## Security
- Function uses SECURITY DEFINER to bypass RLS
- Only callable by authenticated users
- Updates profile role to admin
*/

-- Create function to promote user to admin
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_email text)
RETURNS TABLE(email text, role user_role, updated_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the user's role to admin
  UPDATE profiles
  SET role = 'admin'::user_role
  WHERE profiles.email = user_email;
  
  -- Return the updated profile
  RETURN QUERY
  SELECT profiles.email, profiles.role, now() as updated_at
  FROM profiles
  WHERE profiles.email = user_email;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION promote_user_to_admin(text) TO authenticated;

-- Add comment
COMMENT ON FUNCTION promote_user_to_admin(text) IS 
  'Promotes a user to admin role. Usage: SELECT promote_user_to_admin(''user@example.com'');';
