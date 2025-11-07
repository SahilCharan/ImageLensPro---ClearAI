# Post-Deployment Setup Guide

## After Deploying ImageLens Pro

Once you've deployed the application, follow these steps to complete the setup:

## Step 1: Register First Admin User (CRITICAL)

### Why This Matters
The **first user to register** will automatically become an administrator with full access to:
- Admin panel
- User management
- Role assignment
- System statistics

### How to Register
1. Visit your deployed application URL
2. Click "Sign In" button
3. Sign in with your Google account
4. You are now the administrator!

### Verify Admin Access
1. Click your avatar in the top-right corner
2. You should see "Admin Panel" option in the dropdown
3. Click "Admin Panel" to access user management

## Step 2: Configure N8N Webhook (Optional)

### For Testing/Demo (Skip This Step)
If you want to use mock data for testing:
- ✅ No configuration needed
- ✅ System automatically uses mock error detection
- ✅ Perfect for demonstrations and UI testing

### For Production (Real AI Analysis)

#### A. Set Up N8N Workflow

1. **Create N8N Workflow**
   - Log into your N8N instance
   - Create a new workflow
   - Add a Webhook node as the trigger

2. **Configure Webhook Node**
   - Method: POST
   - Path: `/webhook/image-analysis`
   - Response Mode: "When Last Node Finishes"

3. **Add Image Analysis Logic**
   - Add nodes to process the image
   - Use AI/ML service for error detection
   - Extract text and identify errors
   - Calculate error coordinates (as percentages)

4. **Format Response**
   Your workflow must return:
   ```json
   {
     "success": true,
     "errors": [
       {
         "error_type": "spelling",
         "x_coordinate": 25.5,
         "y_coordinate": 30.2,
         "original_text": "recieve",
         "suggested_correction": "receive",
         "description": "Common spelling mistake"
       }
     ]
   }
   ```

5. **Activate Workflow**
   - Save the workflow
   - Activate it
   - Copy the webhook URL

#### B. Update Application Configuration

1. **Update Environment Variable**
   
   In your hosting platform (Vercel/Netlify/etc.):
   - Go to environment variables settings
   - Update `VITE_N8N_WEBHOOK_URL`
   - Set it to your N8N webhook URL
   - Example: `https://your-n8n.com/webhook/image-analysis`

2. **Redeploy Application**
   - Trigger a new deployment
   - Or restart the application
   - Environment variables will be updated

3. **Test Integration**
   - Upload a test image
   - Click "Analyze" button
   - Check N8N execution logs
   - Verify errors appear on image

## Step 3: Test Core Functionality

### Authentication Test
- [ ] Sign in with Google works
- [ ] Profile loads correctly
- [ ] Avatar displays
- [ ] Sign out works
- [ ] Session persists after refresh

### Image Upload Test
- [ ] Drag and drop works
- [ ] File browser works
- [ ] File validation works (size, type)
- [ ] Upload progress shows
- [ ] Image appears in dashboard

### Error Detection Test
- [ ] Analyze button works
- [ ] Status changes to "processing"
- [ ] Status changes to "completed"
- [ ] Error markers appear on image
- [ ] Hover tooltips work
- [ ] Error summary panel shows data

### Admin Panel Test
- [ ] Admin panel accessible
- [ ] User list displays
- [ ] Can change user roles
- [ ] Statistics show correctly
- [ ] Non-admins cannot access

## Step 4: Invite Additional Users

### Add Team Members
1. Share the application URL with team members
2. They sign in with their Google accounts
3. They become regular users by default

### Promote Users to Admin
1. Go to Admin Panel
2. Find the user in the list
3. Change their role from "User" to "Admin"
4. They now have admin access

## Step 5: Monitor Initial Usage

### Check Supabase Dashboard

1. **Database**
   - Monitor table sizes
   - Check query performance
   - Review error logs

2. **Storage**
   - Monitor storage usage
   - Check upload success rate
   - Review file sizes

3. **Authentication**
   - Monitor active users
   - Check login success rate
   - Review session duration

### Application Monitoring

1. **Browser Console**
   - Check for JavaScript errors
   - Monitor network requests
   - Review API response times

2. **User Feedback**
   - Gather initial impressions
   - Note any issues
   - Collect feature requests

## Step 6: Configure Optional Features

### A. Custom Domain (Recommended)

**Vercel:**
```bash
vercel domains add your-domain.com
```

**Netlify:**
- Go to Domain settings
- Add custom domain
- Configure DNS

### B. SSL Certificate

Most hosting platforms provide free SSL:
- Vercel: Automatic
- Netlify: Automatic
- Custom hosting: Use Let's Encrypt

### C. Error Tracking (Recommended)

Add Sentry for error tracking:

1. Install Sentry:
```bash
pnpm add @sentry/react
```

2. Initialize in `main.tsx`:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production"
});
```

### D. Analytics (Optional)

Add Google Analytics or Plausible:

1. Get tracking ID
2. Add to `index.html`
3. Configure privacy settings

## Step 7: Backup and Security

### Database Backups

Supabase provides automatic backups:
- Daily backups (free tier)
- Point-in-time recovery (pro tier)
- Manual backup option available

### Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] API keys not exposed
- [ ] RLS policies active
- [ ] File upload limits enforced
- [ ] Authentication required
- [ ] Admin access restricted

## Step 8: Documentation for Users

### Share User Guide

Send users the `USER_GUIDE.md` or create a help section:

1. **Getting Started**
   - How to sign in
   - How to upload images
   - How to analyze images

2. **Understanding Results**
   - Error types explained
   - Color coding guide
   - How to use suggestions

3. **Tips and Best Practices**
   - Image quality recommendations
   - File size guidelines
   - When to use which features

## Troubleshooting Common Issues

### Issue: Users Can't Sign In

**Possible Causes:**
- Google OAuth not configured
- Redirect URLs not set
- Supabase auth disabled

**Solution:**
1. Check Supabase Auth settings
2. Verify Google OAuth credentials
3. Check redirect URLs

### Issue: Images Not Uploading

**Possible Causes:**
- Storage bucket not public
- File size too large
- Wrong file type

**Solution:**
1. Check storage bucket policies
2. Verify file size limit
3. Check file type validation

### Issue: Analysis Not Working

**Possible Causes:**
- Webhook URL not configured
- N8N workflow not active
- Network connectivity issues

**Solution:**
1. Check webhook URL in environment
2. Verify N8N workflow is active
3. Check N8N execution logs
4. Use mock mode for testing

### Issue: Admin Panel Not Accessible

**Possible Causes:**
- User is not admin
- First user not registered yet
- Role not assigned correctly

**Solution:**
1. Verify user role in database
2. Check if first user registered
3. Manually update role if needed

## Maintenance Schedule

### Daily
- Monitor error logs
- Check system status
- Review user feedback

### Weekly
- Review storage usage
- Check database performance
- Update documentation if needed

### Monthly
- Review security logs
- Update dependencies
- Backup important data
- Review user analytics

### Quarterly
- Security audit
- Performance optimization
- Feature planning
- User survey

## Getting Help

### Resources
- `USER_GUIDE.md` - For end users
- `DEPLOYMENT_GUIDE.md` - For deployment
- `WEBHOOK_INTEGRATION.md` - For N8N setup
- `QUICKSTART.md` - For quick reference

### Support Channels
1. Check documentation first
2. Review error logs
3. Check Supabase status
4. Contact development team

## Success Metrics

Track these metrics to measure success:

### User Engagement
- Daily active users
- Images uploaded per day
- Analysis requests per day
- Average session duration

### System Performance
- Page load time
- Upload success rate
- Analysis completion rate
- Error rate

### User Satisfaction
- Feature usage
- User feedback
- Support requests
- User retention

## Next Steps

After completing this setup:

1. ✅ First admin registered
2. ✅ Core functionality tested
3. ✅ Users invited
4. ✅ Monitoring configured
5. ✅ Documentation shared

**Your ImageLens Pro deployment is complete!** 🎉

Start using the application and gather feedback for future improvements.

---

**Need Help?** Refer to the documentation files or contact your development team.

**Version**: 1.0.0  
**Last Updated**: 2025-11-07
