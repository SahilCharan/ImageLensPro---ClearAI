# Webhook Configuration Guide - ImageLens Pro

## Overview
ImageLens Pro uses N8N webhooks to process images and detect errors. This guide explains how to configure the webhook integration.

---

## Current Status

### Webhook URL Configuration
The application currently uses a **fallback mechanism**:

1. **Primary**: Environment variable `VITE_N8N_WEBHOOK_URL` from `.env` file
2. **Fallback**: Hardcoded URL `https://shreyahubcredo.app.n8n.cloud/webhook/b17c4454-a32e-4dc9-8ee9-4da7162c4703`
3. **Mock Data**: If webhook fails or is not configured, the app uses mock data for demonstration

### Current Behavior
- ✅ If webhook URL is not configured, app automatically uses mock data
- ✅ If webhook request fails, app falls back to mock data
- ✅ Detailed console logging for debugging webhook issues
- ✅ User-friendly error messages and notifications

---

## Configuration Steps

### Step 1: Set Up N8N Webhook

1. **Create N8N Workflow:**
   - Log in to your N8N instance
   - Create a new workflow
   - Add a "Webhook" trigger node

2. **Configure Webhook Node:**
   - Set HTTP Method to `POST`
   - Set Path to something like `/webhook/image-analysis`
   - Enable "Respond Immediately" or configure response after processing
   - Accept `multipart/form-data` content type

3. **Add Image Processing Logic:**
   - Add nodes to receive the image file
   - Process the image (e.g., using Gemini AI, OpenAI Vision, or other OCR/AI services)
   - Return error detection results in the expected format

4. **Get Webhook URL:**
   - Copy the webhook URL from N8N
   - Example: `https://your-n8n-instance.com/webhook/b17c4454-a32e-4dc9-8ee9-4da7162c4703`

### Step 2: Update Environment Variable

1. **Open `.env` file** in the project root

2. **Update the webhook URL:**
   ```env
   VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
   ```

3. **Save the file**

4. **Restart the development server** (if running locally)

---

## Webhook Request Format

### Request Details
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Body Parameters**:
  - `image` (File): The uploaded image file
  - `image_id` (String): Database ID of the image record
  - `filename` (String): Original filename of the image

### Example Request
```javascript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('image_id', 'uuid-here');
formData.append('filename', 'example.jpg');

fetch('https://your-webhook-url', {
  method: 'POST',
  body: formData
});
```

---

## Expected Response Format

### Response Structure

The webhook should return a JSON response in one of these formats:

#### Format 1: Direct Object
```json
{
  "errorsAndCorrections": [
    {
      "error_id": "1",
      "error_type": "Spelling",
      "found_text": "recieve",
      "corrected_text": "receive",
      "issue_description": "Common spelling mistake",
      "coordinates": [0.1, 0.2, 0.15, 0.25]
    }
  ],
  "image_dimensions": {
    "width": 1920,
    "height": 1080
  }
}
```

#### Format 2: Array Wrapper
```json
[
  {
    "errorsAndCorrections": [...],
    "image_dimensions": {...}
  }
]
```

#### Format 3: Gemini API Response
```json
[
  {
    "content": {
      "parts": [
        {
          "text": "```json\n{\"errorsAndCorrections\": [...], \"image_dimensions\": {...}}\n```"
        }
      ]
    }
  }
]
```

### Error Object Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `error_id` | String | Yes | Unique identifier for the error |
| `error_type` | String | Yes | Type of error (see Error Types below) |
| `found_text` | String | Yes | The incorrect text found in the image |
| `corrected_text` | String | Yes | The suggested correction |
| `issue_description` | String | No | Detailed description of the issue |
| `coordinates` | Array/String/Object | Yes | Position of the error (see Coordinate Formats below) |

### Error Types

The webhook can return these error types:

| Webhook Type | Mapped To | Color | Description |
|--------------|-----------|-------|-------------|
| `Spelling` | `spelling` | Red | Spelling mistakes |
| `Grammar` | `grammatical` | Orange | Grammatical errors |
| `Punctuation` | `grammatical` | Orange | Punctuation errors |
| `Punctuation/Grammar` | `grammatical` | Orange | Combined punctuation and grammar |
| `Spacing` | `space` | Yellow | Spacing issues |
| `Context` | `context` | Blue | Contextual errors |
| `Consistency` | `context` | Blue | Consistency issues |
| `Suggestions` | `suggestions` | Green | Improvement suggestions |
| `Formatting` | `suggestions` | Green | Formatting suggestions |

### Coordinate Formats

The application supports multiple coordinate formats:

#### Format 1: Normalized Array (Recommended)
```json
"coordinates": [0.1, 0.2, 0.15, 0.25]
```
- Format: `[y1, x1, y2, x2]`
- Values: Fractions from 0 to 1
- `y1, x1`: Top-left corner (normalized)
- `y2, x2`: Bottom-right corner (normalized)
- Will be converted to pixels using `image_dimensions`

#### Format 2: Pixel Object
```json
"coordinates": {
  "x": 295,
  "y": 126,
  "width": 440,
  "height": 10
}
```
- Direct pixel coordinates
- `x, y`: Top-left corner in pixels
- `width, height`: Dimensions in pixels

#### Format 3: String Format
```json
"coordinates": "x: 295, y: 126, width: 440, height: 10"
```
- String representation of pixel coordinates
- Will be parsed into object format

### Image Dimensions

**IMPORTANT**: Always include `image_dimensions` in the response for accurate coordinate mapping.

```json
"image_dimensions": {
  "width": 1920,
  "height": 1080
}
```

This ensures normalized coordinates are correctly converted to pixels.

---

## Example N8N Workflow

### Basic Workflow Structure

1. **Webhook Node** (Trigger)
   - Receives image file
   - Extracts `image_id` and `filename`

2. **HTTP Request Node** (AI Service)
   - Send image to Gemini AI / OpenAI Vision / OCR service
   - Request error detection and analysis

3. **Function Node** (Transform)
   - Parse AI response
   - Format into expected structure
   - Map error types
   - Convert coordinates if needed

4. **Respond to Webhook Node**
   - Return formatted JSON response

### Example Function Node Code

```javascript
// Parse AI response
const aiResponse = $input.first().json;

// Extract errors from AI response
const errors = aiResponse.errors.map((error, index) => ({
  error_id: String(index + 1),
  error_type: error.type,
  found_text: error.original,
  corrected_text: error.correction,
  issue_description: error.description,
  coordinates: error.bbox // Assuming AI returns bounding box
}));

// Get image dimensions
const imageDimensions = {
  width: aiResponse.image_width || 1920,
  height: aiResponse.image_height || 1080
};

// Return formatted response
return {
  json: {
    errorsAndCorrections: errors,
    image_dimensions: imageDimensions
  }
};
```

---

## Testing the Webhook

### Method 1: Using the Application

1. **Configure webhook URL** in `.env`
2. **Start the application**
3. **Upload an image** through the Upload page
4. **Check browser console** for webhook logs:
   - `Using webhook URL: ...`
   - `Sending image to webhook: ...`
   - `Webhook response status: ...`
   - `Webhook raw response: ...`
   - `Parsed webhook data: ...`

### Method 2: Using cURL

```bash
curl -X POST https://your-webhook-url \
  -F "image=@/path/to/test-image.jpg" \
  -F "image_id=test-123" \
  -F "filename=test-image.jpg"
```

### Method 3: Using Postman

1. Create new POST request
2. Set URL to your webhook URL
3. Go to Body tab → form-data
4. Add fields:
   - `image` (File): Select an image file
   - `image_id` (Text): `test-123`
   - `filename` (Text): `test-image.jpg`
5. Send request
6. Verify response format

---

## Debugging

### Console Logs

The application provides detailed console logging:

```javascript
// Webhook URL being used
console.log('Using webhook URL:', webhookUrl);

// Request details
console.log('Sending image to webhook:', {
  url: webhookUrl,
  imageId,
  filename: imageFile.name,
  size: imageFile.size,
  type: imageFile.type
});

// Response status
console.log('Webhook response status:', response.status, response.statusText);

// Raw response
console.log('Webhook raw response:', JSON.stringify(rawData, null, 2));

// Parsed data
console.log('Parsed webhook data:', JSON.stringify(parsedData, null, 2));

// Error processing
console.log('Processing error:', error.error_id, 'coordField:', coordField);
console.log('Final parsed coordinates:', coords);

// Success
console.log('Analysis completed successfully. Errors saved:', errorRecords.length);
```

### Common Issues

#### Issue 1: Webhook URL Not Configured
**Symptom**: App uses mock data immediately
**Solution**: 
- Check `.env` file
- Ensure `VITE_N8N_WEBHOOK_URL` is set correctly
- Restart development server

#### Issue 2: Webhook Returns 404
**Symptom**: `Webhook request failed: 404 Not Found`
**Solution**:
- Verify webhook URL is correct
- Check N8N workflow is active
- Test webhook URL with cURL

#### Issue 3: CORS Error
**Symptom**: Browser console shows CORS error
**Solution**:
- Configure N8N to allow CORS
- Add appropriate CORS headers in N8N response
- Or use N8N's built-in CORS settings

#### Issue 4: Invalid Response Format
**Symptom**: App falls back to mock data after receiving response
**Solution**:
- Check webhook response format matches expected structure
- Verify `errorsAndCorrections` field exists
- Ensure coordinates are in correct format
- Include `image_dimensions` in response

#### Issue 5: Coordinates Not Displaying Correctly
**Symptom**: Error markers appear in wrong positions
**Solution**:
- Always include `image_dimensions` in webhook response
- Use normalized coordinates (0-1 range) for best results
- Verify coordinate format matches one of the supported formats

---

## Mock Data Fallback

### When Mock Data is Used

The application automatically uses mock data in these scenarios:

1. **Webhook URL not configured** (placeholder URL in `.env`)
2. **Webhook request fails** (network error, timeout, etc.)
3. **Webhook returns error status** (4xx, 5xx)
4. **Response parsing fails** (invalid JSON, unexpected format)

### Mock Data Structure

The mock data includes 5 sample errors demonstrating all error types:

```javascript
[
  {
    error_type: 'spelling',
    original_text: 'recieve',
    suggested_correction: 'receive',
    description: 'Common spelling mistake: "i before e except after c"',
    coordinates: { x: 25, y: 30, width: 80, height: 20 }
  },
  {
    error_type: 'grammatical',
    original_text: 'They was going',
    suggested_correction: 'They were going',
    description: 'Subject-verb agreement error',
    coordinates: { x: 45, y: 50, width: 120, height: 20 }
  },
  // ... more errors
]
```

### Disabling Mock Data Fallback

If you want the application to fail instead of using mock data:

1. Open `src/services/webhookService.ts`
2. Find the `catch` block in `sendImageForAnalysis`
3. Comment out or remove the mock data fallback:

```typescript
} catch (error) {
  console.error('Webhook error:', error);
  // Remove or comment out this line:
  // await this.processMockAnalysis(imageId);
  
  // Instead, throw the error:
  throw error;
}
```

---

## Production Deployment

### Environment Variables

When deploying to production, ensure:

1. **Set production webhook URL**:
   ```env
   VITE_N8N_WEBHOOK_URL=https://production-n8n.com/webhook/your-id
   ```

2. **Verify N8N instance is accessible** from production environment

3. **Test webhook** before going live

4. **Monitor webhook performance**:
   - Response times
   - Error rates
   - Success rates

### Security Considerations

1. **Use HTTPS** for webhook URLs
2. **Implement authentication** if needed (API keys, tokens)
3. **Validate webhook responses** before processing
4. **Rate limiting** on N8N side to prevent abuse
5. **Error handling** for graceful degradation

### Performance Optimization

1. **Webhook timeout**: Consider adding timeout handling
2. **Async processing**: For large images, consider async webhook processing
3. **Caching**: Cache results for identical images
4. **Image optimization**: Compress images before sending to webhook

---

## Support

### Getting Help

If you encounter issues:

1. **Check console logs** for detailed error messages
2. **Test webhook** independently using cURL or Postman
3. **Verify response format** matches expected structure
4. **Review this guide** for common issues and solutions

### Contact Information

For additional support:
- Check the N8N documentation: https://docs.n8n.io/
- Review Gemini AI documentation: https://ai.google.dev/
- Check application logs in browser console

---

## Summary

### Quick Checklist

- [ ] N8N workflow created and active
- [ ] Webhook URL copied from N8N
- [ ] `.env` file updated with webhook URL
- [ ] Development server restarted
- [ ] Test image uploaded
- [ ] Console logs checked for errors
- [ ] Response format verified
- [ ] Error markers displaying correctly
- [ ] All error types working
- [ ] Coordinates accurate

### Key Points

✅ **Flexible Configuration**: Supports environment variable or fallback URL  
✅ **Automatic Fallback**: Uses mock data if webhook fails  
✅ **Multiple Formats**: Supports various response and coordinate formats  
✅ **Detailed Logging**: Comprehensive console logs for debugging  
✅ **Error Handling**: Graceful degradation with user-friendly messages  
✅ **Production Ready**: Secure and performant webhook integration  

---

**Last Updated**: 2025-11-07  
**Version**: 1.0.0
