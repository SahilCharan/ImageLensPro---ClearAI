# Webhook 403 Error Troubleshooting Guide

## Error Description
When uploading an image, you see this error in the browser console:
```
Webhook error: Error: Webhook access forbidden (403)
```

This means the N8N webhook is rejecting the request with a 403 Forbidden status.

---

## Root Causes

### 1. N8N Workflow Not Active ⚠️ **MOST COMMON**
**Symptom:** Webhook returns 403 immediately  
**Cause:** The N8N workflow is paused or not activated

**Solution:**
1. Log in to your N8N instance: https://shreyahubcredo.app.n8n.cloud
2. Find your workflow
3. Click the **"Active"** toggle in the top right
4. Ensure it shows as "Active" (green)
5. Test the webhook again

---

### 2. Webhook URL Incorrect
**Symptom:** 403 error with "Not Found" message  
**Cause:** The webhook URL doesn't match the actual webhook path

**Solution:**
1. Open your N8N workflow
2. Click on the Webhook trigger node
3. Copy the **Production URL** (not Test URL)
4. Verify it matches the URL in `.env`:
   ```env
   VITE_N8N_WEBHOOK_URL=https://shreyahubcredo.app.n8n.cloud/webhook/b17c4454-a32e-4dc9-8ee9-4da7162c4703
   ```
5. If different, update `.env` and restart the application

---

### 3. N8N CORS Configuration
**Symptom:** CORS error in browser console before 403  
**Cause:** N8N not configured to accept requests from your domain

**Solution:**

#### Option A: Enable CORS in N8N (Recommended)
1. Log in to N8N
2. Go to Settings → Security
3. Add your application domain to allowed origins:
   - For local development: `http://localhost:5173`
   - For production: `https://your-domain.com`
4. Save settings
5. Restart N8N if needed

#### Option B: Use N8N Cloud CORS Settings
If using N8N Cloud, CORS should be enabled by default. If not:
1. Contact N8N support
2. Request CORS to be enabled for your webhook
3. Provide your application domain

---

### 4. Webhook Authentication Required
**Symptom:** 403 with "Authentication required" message  
**Cause:** Webhook is configured to require authentication

**Solution:**

#### Check Webhook Settings
1. Open N8N workflow
2. Click Webhook trigger node
3. Check "Authentication" setting
4. If set to "Header Auth" or similar:
   - Note the required header name and value
   - Update the webhook service to include authentication

#### Update Webhook Service (if authentication needed)
Edit `src/services/webhookService.ts`:

```typescript
const response = await fetch(webhookUrl, {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY', // Add if needed
    // or
    'X-API-Key': 'YOUR_API_KEY', // Add if needed
  }
});
```

---

### 5. N8N Instance Access Restrictions
**Symptom:** 403 from specific domains only  
**Cause:** N8N instance has IP or domain restrictions

**Solution:**
1. Check N8N instance settings
2. Verify your application domain is whitelisted
3. Check if IP restrictions are in place
4. Contact N8N administrator to whitelist your domain/IP

---

## Quick Diagnostic Steps

### Step 1: Test Webhook with cURL
Test if the webhook works outside the application:

```bash
curl -X POST https://shreyahubcredo.app.n8n.cloud/webhook/b17c4454-a32e-4dc9-8ee9-4da7162c4703 \
  -F "image=@/path/to/test-image.jpg" \
  -F "image_id=test-123" \
  -F "filename=test.jpg" \
  -v
```

**Expected Results:**
- ✅ **200 OK**: Webhook is working, issue is CORS or browser-specific
- ❌ **403 Forbidden**: Webhook has authentication or access restrictions
- ❌ **404 Not Found**: Webhook URL is incorrect
- ❌ **500 Error**: N8N workflow has an error

### Step 2: Check N8N Workflow Status
1. Log in to N8N
2. Go to Workflows
3. Find your image analysis workflow
4. Check status:
   - ✅ **Active (green)**: Workflow is running
   - ❌ **Inactive (gray)**: Click to activate
   - ⚠️ **Error (red)**: Check workflow for errors

### Step 3: Check Browser Console
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for detailed error messages:
   ```
   403 Forbidden - Possible causes:
   1. N8N webhook requires authentication
   2. CORS policy blocking the request
   3. Webhook URL is incorrect or inactive
   4. N8N workflow is not active
   ```

### Step 4: Check Network Tab
1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Upload an image
4. Find the webhook request
5. Click on it to see:
   - Request headers
   - Response headers
   - Response body (may contain error details)

---

## Common Solutions

### Solution 1: Activate N8N Workflow
```
1. Open N8N
2. Go to your workflow
3. Click "Active" toggle
4. Verify it's green/active
5. Test upload again
```

### Solution 2: Update Webhook URL
```
1. Copy correct URL from N8N
2. Update .env file:
   VITE_N8N_WEBHOOK_URL=https://your-correct-url
3. Restart application
4. Test upload again
```

### Solution 3: Enable CORS in N8N
```
1. N8N Settings → Security
2. Add allowed origin: http://localhost:5173
3. Add allowed origin: https://your-domain.com
4. Save settings
5. Test upload again
```

### Solution 4: Use Mock Data (Temporary)
If you need to test other features while fixing the webhook:

```
1. Edit .env file
2. Set placeholder URL:
   VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/image-analysis
3. Restart application
4. App will use mock data automatically
```

---

## Testing After Fix

### Test 1: Check Status Indicator
1. Open Upload page
2. Look for status indicator at top
3. Should show:
   - ✅ **Green**: "Webhook Configured" - Ready to use
   - ⚠️ **Yellow**: "Demo Mode" - Using mock data
   - ❌ **Red**: "Webhook Error" - Configuration issue

### Test 2: Upload Test Image
1. Select a small test image
2. Click Upload
3. Watch browser console for logs
4. Should see:
   ```
   Using webhook URL: https://...
   Sending image to webhook: {...}
   Webhook response status: 200 OK
   Webhook raw response: {...}
   Analysis completed successfully
   ```

### Test 3: Verify Error Display
1. After upload completes
2. Should navigate to Analysis page
3. Should see error markers on image
4. Hover over markers to see details
5. Verify colors match error types

---

## Still Not Working?

### Check N8N Workflow Configuration

Your N8N workflow should have:

1. **Webhook Trigger Node**
   - Method: POST
   - Path: /webhook/b17c4454-a32e-4dc9-8ee9-4da7162c4703
   - Authentication: None (or configured in app)
   - Response Mode: "When Last Node Finishes"

2. **File Processing**
   - Extract image from form data
   - Process with AI service (Gemini, OpenAI, etc.)

3. **Response Formatting**
   - Return JSON in expected format:
     ```json
     {
       "errorsAndCorrections": [...],
       "image_dimensions": {...}
     }
     ```

### Contact Support

If none of the above solutions work:

1. **Collect Information:**
   - Browser console logs
   - Network tab details
   - N8N workflow status
   - Webhook URL being used
   - cURL test results

2. **Check N8N Logs:**
   - Log in to N8N
   - Go to Executions
   - Check for failed webhook executions
   - Review error messages

3. **Verify N8N Plan:**
   - Some N8N plans have webhook limitations
   - Check if your plan supports webhooks
   - Verify webhook quota not exceeded

---

## Fallback: Using Mock Data

While troubleshooting, the application automatically falls back to mock data:

### What Happens
1. Webhook request fails with 403
2. Application catches the error
3. Automatically uses mock data
4. Displays 5 sample errors
5. All features work normally

### Mock Data Includes
- ✅ All 5 error types (spelling, grammar, spacing, context, suggestions)
- ✅ Realistic coordinates
- ✅ Proper error descriptions
- ✅ Suggested corrections
- ✅ Interactive markers and hover effects

### To Explicitly Use Mock Data
```env
# Edit .env file
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/image-analysis

# Restart application
# Will show "Demo Mode" status
# All uploads will use mock data
```

---

## Summary Checklist

Before reporting an issue, verify:

- [ ] N8N workflow is **Active** (green toggle)
- [ ] Webhook URL in `.env` matches N8N webhook URL
- [ ] Application has been restarted after `.env` changes
- [ ] Browser console shows detailed error logs
- [ ] cURL test has been performed
- [ ] N8N workflow executions checked for errors
- [ ] CORS settings reviewed in N8N
- [ ] Webhook authentication settings checked
- [ ] Network tab shows request/response details
- [ ] Status indicator on Upload page checked

---

## Quick Reference

### Current Configuration
```env
VITE_N8N_WEBHOOK_URL=https://shreyahubcredo.app.n8n.cloud/webhook/b17c4454-a32e-4dc9-8ee9-4da7162c4703
```

### N8N Instance
```
URL: https://shreyahubcredo.app.n8n.cloud
Webhook ID: b17c4454-a32e-4dc9-8ee9-4da7162c4703
```

### Test Command
```bash
curl -X POST https://shreyahubcredo.app.n8n.cloud/webhook/b17c4454-a32e-4dc9-8ee9-4da7162c4703 \
  -F "image=@test.jpg" \
  -F "image_id=test" \
  -F "filename=test.jpg"
```

---

**Last Updated:** 2025-11-07  
**Version:** 1.0.0
