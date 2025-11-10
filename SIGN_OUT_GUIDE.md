# How to Sign Out / Logout

## Quick Guide

### Step 1: Find Your Profile Button
Look at the **top right corner** of the page. You'll see a button with:
- 👤 Your avatar (first letter of your name)
- Your username or email

**Example:** `[S] shreya` or `[U] user@email.com`

---

### Step 2: Click the Profile Button
Click on the profile button to open the dropdown menu.

---

### Step 3: Click "Sign Out"
At the **bottom** of the dropdown menu, you'll see a **red button** that says:
```
🚪 Sign Out
```

Click this button to log out.

---

## What Happens When You Sign Out?

1. ✅ Your session is ended
2. ✅ You're logged out of the application
3. ✅ You're redirected to the login page
4. ✅ Your data remains safe in the database

---

## Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│  ImageLens Pro          Dashboard  Upload  [👤 User ▼] │ ← Click here
└─────────────────────────────────────────────────────────┘
                                              │
                                              ▼
                                    ┌─────────────────────┐
                                    │  👤 User Name       │
                                    │  user@email.com     │
                                    │  [Admin Badge]      │
                                    ├─────────────────────┤
                                    │  🏠 Home            │
                                    │  📊 Dashboard       │
                                    │  📤 Upload Image    │
                                    │  🛡️ Admin Panel     │
                                    ├─────────────────────┤
                                    │  🚪 Sign Out        │ ← Click here
                                    └─────────────────────┘
```

---

## Features of the New Profile Menu

### 1. **More Visible Profile Button**
- Outlined border (not just an icon)
- Shows your name next to avatar
- Hover effect highlights the button
- Easy to spot in the header

### 2. **User Information Display**
- Your avatar at the top
- Your full name
- Your email address
- Admin badge (if you're an admin)

### 3. **Quick Navigation**
- Home
- Dashboard
- Upload Image
- Admin Panel (for admins only)

### 4. **Prominent Sign Out Button**
- **Red color** makes it stand out
- Located at the bottom of the menu
- Large and easy to click
- Clear "Sign Out" text with icon

---

## Troubleshooting

### Can't See the Profile Button?
**Check if you're logged in:**
- If you see "Sign In" button instead, you're not logged in
- Log in first to see your profile button

### Profile Button Not Clickable?
**Try these steps:**
1. Refresh the page (F5)
2. Clear browser cache
3. Check browser console for errors (F12)

### Sign Out Not Working?
**Check the browser console:**
1. Press F12 to open Developer Tools
2. Click on "Console" tab
3. Click "Sign Out"
4. Look for any error messages

**Expected behavior:**
- Should see "Session deleted" or similar message
- Should redirect to login page within 1-2 seconds

---

## Alternative: Direct URL

If the button doesn't work, you can also:
1. Clear your browser cookies
2. Close all browser tabs
3. Reopen the application

---

## Security Notes

### What Gets Cleared on Sign Out?
- ✅ Authentication session
- ✅ User session in database
- ✅ Local session storage
- ✅ Authentication tokens

### What Stays Safe?
- ✅ Your uploaded images
- ✅ Your error analysis results
- ✅ Your profile information
- ✅ Your account settings

---

## After Signing Out

### What You'll See:
1. Redirected to **Login Page**
2. Header shows "Sign In" button instead of profile
3. Can't access protected pages (Dashboard, Upload, etc.)

### To Sign Back In:
1. Click "Sign In" button
2. Enter your email
3. Click "Sign in with Google"
4. Authorize with your Google account
5. You're back in!

---

## Quick Reference

| Action | Location | Button Style |
|--------|----------|--------------|
| Open Menu | Top right corner | Outlined button with avatar + name |
| Sign Out | Bottom of dropdown | Red button with "Sign Out" text |
| Sign In | Top right corner (when logged out) | Blue "Sign In" button |

---

## Screenshots Description

### Header (Logged In)
```
Top right corner shows:
┌──────────────────────┐
│ [👤] Your Name    ▼  │  ← Profile button (outlined, with border)
└──────────────────────┘
```

### Dropdown Menu
```
┌────────────────────────┐
│ 👤 User Name           │  ← User info section (gray background)
│ user@email.com         │
│ [🛡️ Admin]            │
├────────────────────────┤
│ 🏠 Home                │  ← Navigation links
│ 📊 Dashboard           │
│ 📤 Upload Image        │
│ 🛡️ Admin Panel         │
├────────────────────────┤
│ [🚪 Sign Out]          │  ← Red button (stands out)
└────────────────────────┘
```

---

## Summary

**To sign out:**
1. Click profile button (top right)
2. Click red "Sign Out" button (bottom of menu)
3. Done! You're logged out.

**The sign out button is now:**
- ✅ More visible (red color)
- ✅ Easier to find (at the bottom)
- ✅ Clearly labeled ("Sign Out")
- ✅ Separated from other options

---

**Last Updated:** 2025-11-07  
**Version:** 1.2.0
