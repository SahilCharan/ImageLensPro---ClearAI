# Session Tracking System Guide

## Overview

ImageLens Pro now includes a comprehensive session tracking system that allows administrators to monitor active users and their devices in real-time.

---

## Features

### 1. **Sign Out Functionality** ✅

Users can sign out from the application through the user menu in the header.

**Location:** Header → User Avatar → Sign Out

**What Happens:**
- Session is deleted from database
- Session ID removed from localStorage
- User is logged out from Supabase Auth
- Redirected to login page

---

### 2. **Admin Session Monitoring** ✅

Administrators can view real-time information about logged-in users and their devices.

**Location:** Admin Dashboard (`/admin`)

**Metrics Displayed:**
- **Active Users**: Number of users currently logged in
- **Active Sessions**: Total number of devices across all users
- **User Session Details**: Table showing each user's active devices

**Features:**
- Real-time status indicators (green pulsing dot)
- Device count per user
- Last activity timestamp
- Refresh button to update data
- Responsive grid layout

---

### 3. **Footer Update** ✅

The footer has been updated with developer information and contact details.

**Content:**
- Made by Kumar Sahil (Dwary Intech)
- LinkedIn: https://www.linkedin.com/in/sahil-dwary/
- Email: sahilcharandwary@gmail.com
- Copyright notice

**Design:**
- Compact, small size
- Centered layout
- Clickable links with hover effects
- Semantic color scheme

---

## Technical Implementation

### Database Schema

#### `user_sessions` Table

```sql
CREATE TABLE user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  device_info text,
  ip_address text,
  user_agent text,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);
```

**Indexes:**
- `idx_user_sessions_user_id`: Fast user lookups
- `idx_user_sessions_last_activity`: Active session queries
- `idx_user_sessions_expires_at`: Cleanup queries

---

### Session Lifecycle

#### 1. **Session Creation** (Login)

When a user logs in:
```javascript
const sessionId = await sessionApi.createSession(userId);
// Stores session ID in localStorage
// Records device info and user agent
```

**Stored Information:**
- User ID
- Device information (browser/OS)
- User agent string
- Creation timestamp
- Expiration time (7 days)

#### 2. **Activity Tracking**

Sessions are kept alive through activity updates:

**Automatic Updates:**
- Every 5 minutes (periodic interval)
- On user interaction (click, keypress, scroll)

```javascript
await sessionApi.updateSessionActivity(sessionId);
// Updates last_activity timestamp
```

#### 3. **Session Termination** (Logout)

When a user signs out:
```javascript
await sessionApi.deleteSession(sessionId);
// Removes session from database
// Clears localStorage
```

---

### Admin Functions

#### Get Active Sessions Count

```javascript
const count = await sessionApi.getActiveSessionsCount();
// Returns: { total_active_users: 5, total_active_sessions: 8 }
```

**Criteria for "Active":**
- Session not expired (< 7 days old)
- Recent activity (< 30 minutes ago)

#### Get User Session Details

```javascript
const sessions = await sessionApi.getUserSessionsAdmin();
// Returns array of user session details
```

**Response Format:**
```javascript
[
  {
    user_id: "uuid",
    user_email: "user@example.com",
    user_name: "John Doe",
    active_sessions: 2,
    last_activity: "2025-11-07T10:30:00Z"
  }
]
```

---

### Security

#### Row Level Security (RLS)

**Policies:**
1. **Admins can view all sessions**
   ```sql
   CREATE POLICY "Admins can view all sessions" ON user_sessions
     FOR SELECT TO authenticated
     USING (is_admin(auth.uid()));
   ```

2. **Users can view their own sessions**
   ```sql
   CREATE POLICY "Users can view own sessions" ON user_sessions
     FOR SELECT TO authenticated
     USING (auth.uid() = user_id);
   ```

3. **Users can create their own sessions**
   ```sql
   CREATE POLICY "Users can create own sessions" ON user_sessions
     FOR INSERT TO authenticated
     WITH CHECK (auth.uid() = user_id);
   ```

4. **Users can update their own sessions**
   ```sql
   CREATE POLICY "Users can update own sessions" ON user_sessions
     FOR UPDATE TO authenticated
     USING (auth.uid() = user_id);
   ```

5. **Users can delete their own sessions**
   ```sql
   CREATE POLICY "Users can delete own sessions" ON user_sessions
     FOR DELETE TO authenticated
     USING (auth.uid() = user_id);
   ```

---

### Database Functions

#### 1. `get_active_sessions_count()`

Returns count of active users and sessions.

**Definition:**
```sql
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
```

#### 2. `get_user_sessions_admin()`

Returns detailed session information for all users (admin only).

**Definition:**
```sql
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
```

#### 3. `cleanup_expired_sessions()`

Removes expired and old sessions.

**Definition:**
```sql
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  DELETE FROM user_sessions
  WHERE expires_at < now() OR last_activity < (now() - interval '30 days');
$$;
```

#### 4. `update_session_activity(session_id uuid)`

Updates the last activity timestamp for a session.

**Definition:**
```sql
CREATE OR REPLACE FUNCTION update_session_activity(session_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE user_sessions
  SET last_activity = now()
  WHERE id = session_id AND user_id = auth.uid();
$$;
```

---

## Usage Examples

### For Users

#### Sign Out

1. Click on your avatar in the header
2. Click "Sign Out" in the dropdown menu
3. You will be logged out and redirected to the login page

### For Administrators

#### View Active Sessions

1. Navigate to Admin Dashboard (`/admin`)
2. View the metrics cards at the top:
   - **Active Users**: Currently logged-in users
   - **Active Sessions**: Total devices
3. Scroll to "Active User Sessions" table
4. See detailed information for each user:
   - User name and email
   - Number of active devices
   - Last activity time

#### Refresh Session Data

1. In the "Active User Sessions" card
2. Click the "Refresh" button in the top-right
3. Data will be updated with latest information

---

## Configuration

### Session Expiration

**Default:** 7 days

To change, modify the migration file:
```sql
expires_at timestamptz DEFAULT (now() + interval '7 days')
```

### Activity Timeout

**Default:** 30 minutes

Sessions are considered inactive after 30 minutes of no activity.

To change, modify the RPC functions:
```sql
AND last_activity > (now() - interval '30 minutes')
```

### Activity Update Interval

**Default:** 5 minutes

To change, modify `useAuth.tsx`:
```javascript
const interval = setInterval(() => {
  updateActivity();
}, 5 * 60 * 1000); // 5 minutes in milliseconds
```

---

## Monitoring & Maintenance

### Cleanup Old Sessions

Run the cleanup function periodically:
```javascript
await sessionApi.cleanupExpiredSessions();
```

**Recommended:** Set up a cron job to run this daily.

### Monitor Session Growth

Check the `user_sessions` table size:
```sql
SELECT COUNT(*) FROM user_sessions;
```

### View All Sessions (Admin)

```sql
SELECT 
  s.id,
  p.email,
  s.device_info,
  s.last_activity,
  s.created_at,
  s.expires_at
FROM user_sessions s
JOIN profiles p ON s.user_id = p.id
ORDER BY s.last_activity DESC;
```

---

## Troubleshooting

### Sessions Not Appearing in Admin Dashboard

**Check:**
1. User is logged in (session created)
2. Session not expired (< 7 days old)
3. Recent activity (< 30 minutes ago)
4. Admin has proper permissions

**Solution:**
- Refresh the page
- Click "Refresh" button in admin dashboard
- Check browser console for errors

### Session Not Created on Login

**Check:**
1. Browser console for errors
2. Database connection
3. RLS policies are correct

**Solution:**
- Check `localStorage` for `session_id`
- Verify user has permission to insert sessions
- Check Supabase logs

### Activity Not Updating

**Check:**
1. Session ID exists in localStorage
2. User is interacting with the page
3. Network requests are successful

**Solution:**
- Clear localStorage and log in again
- Check browser console for errors
- Verify RPC function permissions

---

## API Reference

### `sessionApi.createSession(userId: string): Promise<string>`

Creates a new session for the user.

**Parameters:**
- `userId`: User's UUID

**Returns:** Session ID

**Example:**
```javascript
const sessionId = await sessionApi.createSession(user.id);
```

### `sessionApi.updateSessionActivity(sessionId: string): Promise<void>`

Updates the last activity timestamp.

**Parameters:**
- `sessionId`: Session UUID

**Example:**
```javascript
await sessionApi.updateSessionActivity(sessionId);
```

### `sessionApi.deleteSession(sessionId: string): Promise<void>`

Deletes a session.

**Parameters:**
- `sessionId`: Session UUID

**Example:**
```javascript
await sessionApi.deleteSession(sessionId);
```

### `sessionApi.deleteAllUserSessions(userId: string): Promise<void>`

Deletes all sessions for a user.

**Parameters:**
- `userId`: User's UUID

**Example:**
```javascript
await sessionApi.deleteAllUserSessions(user.id);
```

### `sessionApi.getActiveSessionsCount(): Promise<ActiveSessionsCount>`

Gets count of active users and sessions.

**Returns:**
```typescript
{
  total_active_users: number;
  total_active_sessions: number;
}
```

**Example:**
```javascript
const count = await sessionApi.getActiveSessionsCount();
console.log(`${count.total_active_users} users online`);
```

### `sessionApi.getUserSessionsAdmin(): Promise<UserSessionDetail[]>`

Gets detailed session information (admin only).

**Returns:**
```typescript
Array<{
  user_id: string;
  user_email: string;
  user_name: string | null;
  active_sessions: number;
  last_activity: string;
}>
```

**Example:**
```javascript
const sessions = await sessionApi.getUserSessionsAdmin();
sessions.forEach(s => {
  console.log(`${s.user_email}: ${s.active_sessions} devices`);
});
```

### `sessionApi.cleanupExpiredSessions(): Promise<void>`

Removes expired sessions.

**Example:**
```javascript
await sessionApi.cleanupExpiredSessions();
```

---

## Performance Considerations

### Database Indexes

Three indexes ensure fast queries:
1. `idx_user_sessions_user_id`: User lookups
2. `idx_user_sessions_last_activity`: Active session queries
3. `idx_user_sessions_expires_at`: Cleanup queries

### Activity Update Throttling

Activity updates are throttled to prevent excessive database writes:
- Periodic updates: Every 5 minutes
- User interaction: Debounced (not on every click)

### Session Cleanup

Regular cleanup prevents table bloat:
- Expired sessions (> 7 days)
- Inactive sessions (> 30 days)

---

## Security Best Practices

1. **Never expose session IDs** in URLs or logs
2. **Use HTTPS** to protect session data in transit
3. **Implement rate limiting** on session creation
4. **Monitor for suspicious activity** (many sessions from one user)
5. **Regularly cleanup old sessions** to prevent data accumulation
6. **Use RLS policies** to restrict access to session data

---

## Future Enhancements

Potential improvements:
- [ ] IP-based geolocation for session tracking
- [ ] Device type detection (mobile, desktop, tablet)
- [ ] Session revocation by admin
- [ ] Email notifications for new device logins
- [ ] Session history and audit log
- [ ] Concurrent session limits per user
- [ ] Suspicious activity detection

---

## Summary

✅ **Sign Out**: Fully functional through user menu  
✅ **Session Tracking**: Automatic on login/logout  
✅ **Admin Monitoring**: Real-time dashboard with metrics  
✅ **Multi-Device Support**: Track multiple devices per user  
✅ **Activity Updates**: Automatic and user-triggered  
✅ **Security**: RLS policies and admin-only access  
✅ **Footer**: Updated with developer contact info  

**Status: Production Ready** 🚀

---

**Last Updated:** 2025-11-07  
**Version:** 1.0.0
