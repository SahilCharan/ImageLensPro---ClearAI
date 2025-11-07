# ImageLens Pro - Deployment Guide

## Prerequisites

Before deploying ImageLens Pro, ensure you have:

- Node.js 18+ installed
- pnpm package manager
- Supabase account
- N8N instance (optional, for production error detection)
- Google Cloud Console project (for SSO authentication)

## Environment Setup

### 1. Clone and Install

```bash
cd /workspace/app-7dzvb2e20qgx
pnpm install
```

### 2. Configure Environment Variables

The `.env` file contains the following variables:

```env
VITE_LOGIN_TYPE=gmail
VITE_APP_ID=app-7dzvb2e20qgx
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_ENV=production
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/image-analysis
```

**Important**: 
- Supabase credentials are already configured
- Update `VITE_N8N_WEBHOOK_URL` with your N8N webhook endpoint
- Leave webhook URL as default to use mock data for testing

## Database Setup

### Supabase Configuration

The database is already initialized with:

✅ User authentication tables
✅ Image storage tables
✅ Error detection tables
✅ Storage bucket for images
✅ Row Level Security policies
✅ Admin role management

### First User Setup

**Important**: The first user to register will automatically become an administrator.

1. Deploy the application
2. Register with your Google account
3. You will have admin privileges
4. You can then promote other users to admin via the Admin Panel

## Google SSO Configuration

### Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-domain.com`
   - `http://localhost:5173` (for development)

### Configure Supabase Auth

The application uses Supabase SSO with domain `miaoda-gg.com`. This is pre-configured and requires no additional setup.

## N8N Webhook Integration

### Option 1: Production Setup (Real Analysis)

1. Set up N8N workflow for image analysis
2. Configure webhook endpoint
3. Update `VITE_N8N_WEBHOOK_URL` in `.env`
4. See `WEBHOOK_INTEGRATION.md` for detailed setup

### Option 2: Mock Mode (Testing/Demo)

Leave `VITE_N8N_WEBHOOK_URL` as default:
```env
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/image-analysis
```

The system will automatically use mock data for demonstrations.

## Build and Deploy

### Development Mode

```bash
pnpm run dev
```

Access at: `http://localhost:5173`

### Production Build

```bash
pnpm run build
```

This creates optimized files in the `dist` directory.

### Linting

```bash
pnpm run lint
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Configure environment variables in Vercel dashboard

4. Set up custom domain (optional)

### Option 2: Netlify

1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Build the project:
```bash
pnpm run build
```

3. Deploy:
```bash
netlify deploy --prod --dir=dist
```

4. Configure environment variables in Netlify dashboard

### Option 3: Traditional Hosting

1. Build the project:
```bash
pnpm run build
```

2. Upload `dist` folder contents to your web server

3. Configure web server (nginx/apache) to:
   - Serve `index.html` for all routes (SPA routing)
   - Enable HTTPS
   - Set proper CORS headers

#### Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/imagelens-pro/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

## Post-Deployment Checklist

### 1. Verify Authentication

- [ ] Google SSO login works
- [ ] User profile loads correctly
- [ ] First user has admin role
- [ ] Session persists after refresh

### 2. Test Image Upload

- [ ] Drag and drop works
- [ ] File validation works (size, type)
- [ ] Images upload to Supabase Storage
- [ ] Image records created in database

### 3. Test Error Detection

- [ ] Analysis button triggers processing
- [ ] Status updates correctly
- [ ] Errors display on image
- [ ] Hover tooltips work
- [ ] Error summary panel shows data

### 4. Test Admin Features

- [ ] Admin panel accessible to admin users
- [ ] User list displays correctly
- [ ] Role changes work
- [ ] Statistics display correctly

### 5. Performance Checks

- [ ] Page load time < 3 seconds
- [ ] Images load efficiently
- [ ] No console errors
- [ ] Mobile responsive design works

## Monitoring and Maintenance

### Database Monitoring

Monitor Supabase dashboard for:
- Storage usage
- Database queries
- API requests
- Error rates

### Application Monitoring

Consider adding:
- Error tracking (Sentry)
- Analytics (Google Analytics, Plausible)
- Performance monitoring (Lighthouse CI)
- Uptime monitoring (UptimeRobot)

### Regular Maintenance

- **Weekly**: Check error logs
- **Monthly**: Review storage usage
- **Quarterly**: Update dependencies
- **Annually**: Review security policies

## Scaling Considerations

### Storage

- Supabase free tier: 1GB storage
- Upgrade to Pro for more storage
- Consider CDN for image delivery
- Implement image compression

### Database

- Monitor query performance
- Add indexes if needed
- Archive old data
- Implement pagination

### API Limits

- Supabase free tier: 50,000 monthly active users
- Monitor API usage
- Implement rate limiting
- Cache frequently accessed data

## Security Best Practices

### Environment Variables

- Never commit `.env` to version control
- Use different keys for dev/staging/prod
- Rotate keys regularly
- Use secret management tools

### Authentication

- Enforce strong password policies
- Enable MFA for admin accounts
- Regular security audits
- Monitor suspicious activity

### Data Protection

- Enable RLS on all tables
- Regular backups
- Encrypt sensitive data
- GDPR compliance

## Troubleshooting

### Build Errors

**Problem**: TypeScript errors during build
```bash
pnpm run lint
```
Fix any reported issues.

**Problem**: Missing dependencies
```bash
pnpm install
```

### Runtime Errors

**Problem**: Supabase connection fails
- Verify environment variables
- Check Supabase project status
- Verify API keys are correct

**Problem**: Images not uploading
- Check storage bucket policies
- Verify file size limits
- Check CORS configuration

### Performance Issues

**Problem**: Slow page loads
- Enable compression
- Optimize images
- Use CDN
- Implement lazy loading

**Problem**: High database usage
- Add database indexes
- Optimize queries
- Implement caching
- Archive old data

## Support and Resources

### Documentation

- User Guide: `USER_GUIDE.md`
- Webhook Integration: `WEBHOOK_INTEGRATION.md`
- This Deployment Guide: `DEPLOYMENT_GUIDE.md`

### External Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [N8N Documentation](https://docs.n8n.io)

### Getting Help

1. Check documentation
2. Review error logs
3. Search GitHub issues
4. Contact support team

## Version History

- **v1.0.0** (2025-11-07): Initial release
  - User authentication with Google SSO
  - Image upload and storage
  - Error detection and visualization
  - Admin panel
  - Mock mode for testing

---

**Deployment Status**: Ready for Production  
**Last Updated**: 2025-11-07
