# ImageLens Pro - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)

### Step 1: Install Dependencies
```bash
cd /workspace/app-7dzvb2e20qgx
pnpm install
```

### Step 2: Environment Setup
The `.env` file is already configured with:
- ✅ Supabase credentials
- ✅ Google SSO configuration
- ✅ Storage bucket settings

**Optional**: Update N8N webhook URL for production error detection:
```env
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/image-analysis
```

### Step 3: Run Development Server
```bash
pnpm run dev
```

Access the application at: **http://localhost:5173**

### Step 4: First Login
1. Click "Sign In" button
2. Sign in with your Google account
3. **You will automatically become an administrator** (first user)

### Step 5: Test the Application

#### Upload an Image
1. Click "Upload" in the navigation
2. Drag and drop an image (JPG, PNG, or GIF)
3. Click "Upload & Analyze"

#### Analyze the Image
1. Click "Analyze" button on the image page
2. Wait for processing (uses mock data by default)
3. Hover over colored dots to see error details

#### Access Admin Panel
1. Click your avatar in the top-right
2. Select "Admin Panel"
3. View and manage users

## 🎯 Key Features to Try

### Error Detection
- **5 Error Types**: Spelling, Grammar, Spacing, Context, Suggestions
- **Color-Coded**: Each type has a unique color
- **Interactive**: Hover over markers for details

### Image Management
- **Upload**: Drag-and-drop or click to browse
- **View**: See all your uploaded images
- **Delete**: Remove images you don't need

### Admin Features
- **User Management**: View all users
- **Role Assignment**: Promote users to admin
- **Statistics**: See user counts and roles

## 📝 Mock Mode vs Production

### Mock Mode (Default)
- Automatically generates sample errors
- No external dependencies required
- Perfect for testing and demos
- Activates when webhook URL is not configured

### Production Mode
- Requires N8N webhook configuration
- Real AI-powered error detection
- See `WEBHOOK_INTEGRATION.md` for setup

## 🔧 Development Commands

```bash
# Start development server
pnpm run dev

# Build for production
pnpm run build

# Run linter
pnpm run lint

# Type check
pnpm run type-check
```

## 📚 Documentation

- **User Guide**: `USER_GUIDE.md` - For end users
- **Deployment Guide**: `DEPLOYMENT_GUIDE.md` - For deployment
- **Webhook Integration**: `WEBHOOK_INTEGRATION.md` - For N8N setup
- **Project Summary**: `PROJECT_SUMMARY.md` - Technical overview

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules
pnpm install
```

### Build Errors
```bash
# Check for errors
pnpm run lint
```

## 🎨 Customization

### Change Colors
Edit `src/index.css` to customize the color scheme:
```css
:root {
  --error-spelling: 0 84% 60%;    /* Red */
  --error-grammatical: 25 95% 53%; /* Orange */
  --error-space: 45 93% 47%;       /* Yellow */
  --error-context: 217 91% 60%;    /* Blue */
  --error-suggestions: 142 71% 45%; /* Green */
}
```

### Add New Error Types
1. Update database schema in `supabase/migrations/`
2. Add color in `src/index.css`
3. Update `ERROR_COLORS` in `ImageAnalysis.tsx`
4. Update webhook service types

## 🚢 Deploy to Production

### Quick Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Quick Deploy to Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
pnpm run build
netlify deploy --prod --dir=dist
```

## 📊 Database Access

### Supabase Dashboard
- URL: https://supabase.com/dashboard
- Project: zflgjgdtizwthvmbvitb
- Tables: profiles, images, errors
- Storage: app-7dzvb2e20qgx_images

### Direct SQL Access
Use Supabase SQL Editor for direct database queries.

## 🔐 Security Notes

- First user becomes admin automatically
- All routes except `/login` require authentication
- Images are stored in public bucket (read-only)
- Users can only access their own data
- Admins have full access to all data

## 💡 Tips

1. **Test with Mock Data**: Leave webhook URL as default for testing
2. **Admin Access**: First registered user is admin
3. **Image Size**: Keep images under 5MB
4. **File Types**: Only JPG, PNG, GIF supported
5. **Hover Effects**: Hover over error markers for details

## 🆘 Need Help?

1. Check the documentation files
2. Review error logs in browser console
3. Check Supabase dashboard for database issues
4. Verify environment variables are correct

## ✅ Verification Checklist

After setup, verify:
- [ ] Application loads at localhost:5173
- [ ] Google SSO login works
- [ ] Can upload images
- [ ] Can analyze images (mock mode)
- [ ] Error markers appear on images
- [ ] Hover tooltips work
- [ ] Admin panel accessible
- [ ] No console errors

---

**Ready to go!** 🎉

Start developing with `pnpm run dev` and explore the application.

For detailed information, see the full documentation files.
