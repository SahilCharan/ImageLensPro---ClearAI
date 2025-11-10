/*
# Fix Errors Table Insert Policy

## Issue
The errors table has RLS enabled but no INSERT policy for users.
Users can view errors for their images but cannot insert new errors.

## Solution
Add INSERT policy allowing users to insert errors for their own images.

## Changes
1. Add INSERT policy for errors table
   - Users can insert errors for images they own
   - Checks that the image belongs to the user before allowing insert

## Security
- Maintains RLS protection
- Users can only insert errors for their own images
- Admins still have full access via existing policy
*/

-- Add INSERT policy for errors table
CREATE POLICY "Users can insert errors for their images" ON errors
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM images 
      WHERE images.id = errors.image_id 
      AND images.user_id = auth.uid()
    )
  );
