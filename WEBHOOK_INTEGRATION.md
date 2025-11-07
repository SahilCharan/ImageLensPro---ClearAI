# N8N Webhook Integration Guide

## Overview

ImageLens Pro integrates with N8N workflows via webhooks to perform AI-powered image error detection and analysis.

## Configuration

### 1. Set Webhook URL

Update the `.env` file with your N8N webhook URL:

```env
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/image-analysis
```

### 2. N8N Workflow Setup

Your N8N workflow should:

1. **Receive POST request** with the following payload:
```json
{
  "image_id": "uuid-string",
  "image_url": "https://storage-url/image.jpg"
}
```

2. **Process the image** using your AI/ML service to detect errors

3. **Return response** in the following format:

#### Success Response:
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
    },
    {
      "error_type": "grammatical",
      "x_coordinate": 45.0,
      "y_coordinate": 50.0,
      "original_text": "They was going",
      "suggested_correction": "They were going",
      "description": "Subject-verb agreement error"
    }
  ]
}
```

#### Error Response:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Error Types

The system supports five error types:

1. **spelling** - Spelling mistakes
2. **grammatical** - Grammar errors
3. **space** - Spacing issues
4. **context** - Contextual errors
5. **suggestions** - Improvement suggestions

## Coordinate System

- Coordinates are **percentages** (0-100) relative to image dimensions
- `x_coordinate`: Horizontal position (0 = left, 100 = right)
- `y_coordinate`: Vertical position (0 = top, 100 = bottom)

Example: `x_coordinate: 25, y_coordinate: 30` means 25% from left, 30% from top

## Color Coding

Each error type is displayed with a distinct color:

- **Spelling**: Red (#ef4444)
- **Grammatical**: Orange (#f97316)
- **Space**: Yellow (#eab308)
- **Context**: Blue (#5b8def)
- **Suggestions**: Green (#22c55e)

## Mock Mode

If no webhook URL is configured, the system uses mock data for demonstration purposes. This is useful for:

- Development and testing
- Demo presentations
- UI/UX validation

To enable mock mode, leave the webhook URL as the default value or set it to an empty string.

## Workflow Example

1. User uploads image → Image stored in Supabase Storage
2. Frontend calls `webhookService.sendImageForAnalysis()`
3. Image status set to "processing"
4. POST request sent to N8N webhook with image URL
5. N8N workflow analyzes image and returns errors
6. Errors saved to database
7. Image status updated to "completed"
8. User sees interactive error markers on image

## Error Handling

The system handles various error scenarios:

- **Network errors**: Image status set to "failed"
- **Invalid response**: Image status set to "failed"
- **Timeout**: Consider implementing timeout handling in N8N
- **Partial success**: All valid errors are saved even if some fail

## Testing

To test the integration:

1. Upload a test image
2. Click "Analyze" button
3. Check browser console for webhook requests
4. Verify N8N workflow receives correct payload
5. Confirm errors appear on image with correct positions

## Security Considerations

- Use HTTPS for webhook URLs
- Implement authentication in N8N workflow if needed
- Validate image URLs before processing
- Set appropriate CORS headers
- Rate limit webhook endpoints

## Troubleshooting

### Webhook not receiving requests
- Check VITE_N8N_WEBHOOK_URL in .env
- Verify N8N workflow is active
- Check network tab in browser DevTools

### Errors not displaying
- Verify coordinate values are 0-100
- Check error_type matches allowed values
- Ensure response format is correct

### Image status stuck on "processing"
- Check N8N workflow execution logs
- Verify webhook returns response
- Check for network timeouts
