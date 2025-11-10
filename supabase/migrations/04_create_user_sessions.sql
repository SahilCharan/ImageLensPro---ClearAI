/*
# Create User Sessions Tracking

## Purpose
Track user login sessions across multiple devices to provide admin insights into:
- How many users are currently logged in
- How many devices each user is logged in on
- Session history and device information

## Tables

### user_sessions
Tracks active user sessions with device information:
- `id` (uuid, primary key): Unique session identifier
- `user_id` (uuid, references profiles.id): User who owns this session
- `device_info` (text): Browser/device information
- `ip_address` (text): IP address of the session
- `user_agent` (text): Full user agent string
- `last_activity` (timestamptz): Last activity timestamp
- `created_at` (timestamptz): Session creation time
- `expires_at` (timestamptz): Session expiration time

## Security
- Enable RLS on user_sessions table
- Only admins can view all sessions
- Users can only view their own sessions

## Indexes
- Index on user_id for fast lookups
- Index on last_activity for active session queries
- Index on expires_at for cleanup queries
*/

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  device_info text,
  ip_address text,
  user_agent text,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

-- Create indexes for performance
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_last_activity ON user_sessions(last_activity);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all sessions
CREATE POLICY "Admins can view all sessions" ON user_sessions
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

-- Policy: Users can view their own sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Authenticated users can insert their own sessions
CREATE POLICY "Users can create own sessions" ON user_sessions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own sessions
CREATE POLICY "Users can update own sessions" ON user_sessions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own sessions (logout)
CREATE POLICY "Users can delete own sessions" ON user_sessions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Function to get active sessions count
CREATE OR REPLACE FUNCTION get_active_sessions_count()
RETURNS TABLE (
  total_active_users bigint,
  total_active_sessions bigint
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT 
    COUNT(DISTINCT user_id) as total_active_users,
    COUNT(*) as total_active_sessions
  FROM user_sessions
  WHERE expires_at > now() 
    AND last_activity > (now() - interval '30 minutes');
$$;

-- Function to get user session details (admin only)
CREATE OR REPLACE FUNCTION get_user_sessions_admin()
RETURNS TABLE (
  user_id uuid,
  user_email text,
  user_name text,
  active_sessions bigint,
  last_activity timestamptz
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT 
    p.id as user_id,
    p.email as user_email,
    p.full_name as user_name,
    COUNT(s.id) as active_sessions,
    MAX(s.last_activity) as last_activity
  FROM profiles p
  LEFT JOIN user_sessions s ON p.id = s.user_id 
    AND s.expires_at > now() 
    AND s.last_activity > (now() - interval '30 minutes')
  WHERE is_admin(auth.uid())
  GROUP BY p.id, p.email, p.full_name
  HAVING COUNT(s.id) > 0
  ORDER BY last_activity DESC;
$$;

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  DELETE FROM user_sessions
  WHERE expires_at < now() OR last_activity < (now() - interval '30 days');
$$;

-- Function to update session activity
CREATE OR REPLACE FUNCTION update_session_activity(session_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE user_sessions
  SET last_activity = now()
  WHERE id = session_id AND user_id = auth.uid();
$$;
