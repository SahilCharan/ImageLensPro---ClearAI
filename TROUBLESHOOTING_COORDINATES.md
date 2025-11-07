# Troubleshooting Coordinate Issues - ImageLens Pro

## Issue: Error Boxes Appearing in Corners

If all error boxes are appearing in the four corners instead of at the correct locations, follow this troubleshooting guide.

## Recent Fix Applied

### Problem Identified
The webhook was returning `coordinates` (lowercase) but our code was expecting `Coordinates` (uppercase C).

### Solution Implemented
Updated the code to support **both** field name variations:
- `Coordinates` (uppercase) - original format
- `coordinates` (lowercase) - new Gemini format

## How to Debug

### 1. Check Browser Console
Open your browser's Developer Tools (F12) and look at the Console tab. You should see detailed logging:

```
Webhook raw response: [...]
Processed webhook data: {...}
Processing error: 1 coordField: {...}
Parsed coordinates: {x: 172, y: 56, width: 147, height: 15}
Error records to save: [...]
Image dimensions: {displayed: {...}, natural: {...}, scaleX: ..., scaleY: ...}
Error position calculation: {...}
```

### 2. Verify Webhook Response Format

Your webhook should return data in one of these formats:

#### Format 1: Array Wrapper (Current)
```json
[
  {
    "errorsAndCorrections": [
      {
        "error_id": 1,
        "found_text": "REFERRENCE",
        "error_type": "Spelling",
        "issue_description": "...",
        "corrected_text": "REFERENCE",
        "coordinates": {
          "x": 172,
          "y": 56,
          "width": 147,
          "height": 15
        }
      }
    ]
  }
]
```

#### Format 2: Direct Object
```json
{
  "errorsAndCorrections": [
    {
      "error_id": 1,
      "found_text": "REFERRENCE",
      "error_type": "Spelling",
      "issue_description": "...",
      "corrected_text": "REFERENCE",
      "Coordinates": {
        "x": 172,
        "y": 56,
        "width": 147,
        "height": 15
      }
    }
  ]
}
```

#### Format 3: String Coordinates
```json
{
  "errorsAndCorrections": [
    {
      "error_id": 1,
      "found_text": "REFERRENCE",
      "error_type": "Spelling",
      "issue_description": "...",
      "corrected_text": "REFERENCE",
      "Coordinates": "x: 172, y: 56, width: 147, height: 15"
    }
  ]
}
```

**All three formats are now supported!**

### 3. Check Database Values

After uploading an image, check what was saved to the database:

```sql
SELECT 
  id,
  error_type,
  x_coordinate,
  y_coordinate,
  width,
  height,
  original_text
FROM errors
WHERE image_id = 'your-image-id'
ORDER BY created_at DESC;
```

**Expected values:**
- x_coordinate: Should be a number like 172, 275, etc. (NOT 0)
- y_coordinate: Should be a number like 56, 221, etc. (NOT 0)
- width: Should be a number like 147, 59, etc. (NOT NULL or 0)
- height: Should be a number like 15, 8, etc. (NOT NULL or 0)

**If you see all zeros or nulls**, the coordinate parsing failed.

### 4. Verify Image Dimensions

In the browser console, check the image dimensions log:

```
Image dimensions: {
  displayed: { width: 800, height: 600 },
  natural: { width: 1600, height: 1200 },
  scaleX: 0.5,
  scaleY: 0.5
}
```

**What to check:**
- `natural.width` and `natural.height` should match your original image size
- `displayed.width` and `displayed.height` should match the container size
- `scaleX` and `scaleY` should be reasonable values (typically 0.3 to 1.5)

**If scaleX or scaleY is 0, Infinity, or NaN**, there's a problem with image loading.

### 5. Check Error Position Calculations

Look for logs like:

```
Error position calculation: {
  errorId: "abc-123",
  original: { x: 172, y: 56, w: 147, h: 15 },
  scale: { scaleX: 0.5, scaleY: 0.5 },
  result: { left: 86, top: 28, width: 73.5, height: 7.5 }
}
```

**What to check:**
- `original.x` and `original.y` should NOT be 0 (unless the error is actually at 0,0)
- `scale.scaleX` and `scale.scaleY` should be reasonable numbers
- `result.left` and `result.top` should be within the image bounds

## Common Issues and Solutions

### Issue 1: All Boxes at (0, 0) - Top Left Corner

**Cause:** Coordinates not being parsed from webhook response

**Solution:**
1. Check webhook response format in console
2. Verify field name is either `coordinates` or `Coordinates`
3. Ensure coordinates are numbers, not strings

**Fix in N8N:**
Make sure your Gemini prompt returns coordinates as numbers:
```json
"coordinates": {
  "x": 172,
  "y": 56,
  "width": 147,
  "height": 15
}
```

NOT as strings:
```json
"coordinates": {
  "x": "172",
  "y": "56",
  "width": "147",
  "height": "15"
}
```

### Issue 2: Boxes in Wrong Locations

**Cause:** Coordinate system mismatch

**Solution:**
Ensure Gemini is providing coordinates in **pixels from the top-left corner** of the original image.

**Gemini Prompt Template:**
```
Analyze this image for text errors. For each error, provide coordinates as follows:
- x: horizontal distance in pixels from the LEFT edge of the image
- y: vertical distance in pixels from the TOP edge of the image  
- width: width of the error region in pixels
- height: height of the error region in pixels

Return coordinates as numbers (not strings) in this format:
{
  "coordinates": {
    "x": 172,
    "y": 56,
    "width": 147,
    "height": 15
  }
}
```

### Issue 3: Boxes Too Small or Too Large

**Cause:** Incorrect width/height values

**Solution:**
1. Check if width/height are in the correct unit (pixels, not percentages)
2. Verify the values in the database
3. Check the scaling calculation in console logs

### Issue 4: Boxes Not Scaling with Browser Resize

**Cause:** Image dimensions not updating

**Solution:**
The image dimensions are captured on initial load. If you resize the browser, refresh the page to recalculate positions.

## Testing Your Webhook

### Test Payload
Send this test payload to your webhook endpoint to verify it's working:

```json
[
  {
    "errorsAndCorrections": [
      {
        "error_id": 1,
        "found_text": "TEST",
        "error_type": "Spelling",
        "issue_description": "Test error",
        "corrected_text": "TEST",
        "coordinates": {
          "x": 100,
          "y": 100,
          "width": 50,
          "height": 20
        }
      }
    ]
  }
]
```

**Expected result:**
- Error box should appear at approximately 100 pixels from left and top
- Box should be about 50 pixels wide and 20 pixels tall (scaled to display size)

## N8N Webhook Configuration

### Recommended Gemini Prompt

```
Analyze this image for text errors including spelling mistakes, grammatical errors, 
spacing issues, contextual problems, and suggestions for improvement.

For each error found, provide:
1. error_id: A unique number for this error
2. found_text: The exact text containing the error
3. error_type: One of: "Spelling", "Punctuation/Grammar", "Consistency", "Context", "Suggestions"
4. issue_description: A clear description of what's wrong
5. corrected_text: The corrected version of the text
6. coordinates: The bounding box of the error in pixels

IMPORTANT: Coordinates must be in pixels from the top-left corner of the image.
- x: pixels from left edge
- y: pixels from top edge
- width: width of error region in pixels
- height: height of error region in pixels

Return ONLY valid JSON in this exact format:
{
  "errorsAndCorrections": [
    {
      "error_id": 1,
      "found_text": "the error text",
      "error_type": "Spelling",
      "issue_description": "description",
      "corrected_text": "corrected text",
      "coordinates": {
        "x": 172,
        "y": 56,
        "width": 147,
        "height": 15
      }
    }
  ]
}
```

### N8N Response Handling

If your N8N workflow wraps the response in an array, that's fine! The code handles both:
- `[{ errorsAndCorrections: [...] }]` ✅
- `{ errorsAndCorrections: [...] }` ✅

## Still Having Issues?

### Enable Detailed Logging

The application now includes comprehensive console logging. Check your browser console for:

1. **Webhook Response:** See exactly what data is received
2. **Coordinate Parsing:** See how each coordinate is processed
3. **Image Dimensions:** See the scaling factors
4. **Position Calculations:** See the final pixel positions

### Contact Support

If you're still experiencing issues, provide:
1. Screenshot of the browser console logs
2. Sample webhook response (from console)
3. Screenshot showing where boxes appear vs where they should be
4. Original image dimensions
5. Database query results for the errors table

## Summary of Fixes Applied

✅ Support both `coordinates` and `Coordinates` field names
✅ Handle array-wrapped webhook responses
✅ Parse both object and string coordinate formats
✅ Add comprehensive debug logging
✅ Proper coordinate scaling from original to displayed image
✅ Fallback to default dimensions if width/height missing
✅ Type safety for all coordinate operations

The application should now correctly display error boxes at the right locations regardless of:
- Field name casing (coordinates vs Coordinates)
- Response wrapper format (array vs object)
- Coordinate format (object vs string)
- Image display size (automatic scaling)
