# Gemini Vision API Integration Guide - ImageLens Pro

## Overview
This guide explains how to integrate Google Gemini Vision API with ImageLens Pro for accurate text error detection and coordinate mapping.

## How It Works

### 1. Coordinate System
Gemini Vision API provides coordinates in **pixels relative to the original image dimensions**:
- **x**: Horizontal distance in pixels from the LEFT edge
- **y**: Vertical distance in pixels from the TOP edge  
- **width**: Width of the error region in pixels
- **height**: Height of the error region in pixels

### 2. Scaling Process
```
Original Image (Gemini) → Stored in Database → Scaled to Display Size
     2881 x 3301              2881 x 3301           800 x 916 (example)
```

The application automatically scales coordinates:
```typescript
scaleX = displayedWidth / originalWidth
scaleY = displayedHeight / originalHeight

displayLeft = originalX * scaleX
displayTop = originalY * scaleY
displayWidth = originalWidth * scaleX
displayHeight = originalHeight * scaleY
```

## Gemini Response Format

### Expected Response Structure

Your N8N webhook should return data in this format:

```json
[
  {
    "content": {
      "parts": [
        {
          "text": "```json\n{\n  \"scale_using_to_giving_cordinates\": \"pixel\",\n  \"image_dimensions\": {\n    \"x\": 0,\n    \"y\": 0,\n    \"width\": 2881,\n    \"height\": 3301\n  },\n  \"errors_and_corrections\": [\n    {\n      \"error_id\": 1,\n      \"found_text\": \"Military snow mobile\",\n      \"error_type\": \"Spacing\",\n      \"issue_description\": \"The term 'snow mobile' should be a single compound word, 'snowmobile'.\",\n      \"corrected_text\": \"Military snowmobile\",\n      \"coordinates\": {\n        \"x\": 278,\n        \"y\": 2292,\n        \"width\": 282,\n        \"height\": 25\n      },\n      \"confidence\": \"high\"\n    }\n  ]\n}\n```"
        }
      ],
      "role": "model"
    }
  }
]
```

### Alternative Simplified Format (Also Supported)

```json
{
  "image_dimensions": {
    "x": 0,
    "y": 0,
    "width": 2881,
    "height": 3301
  },
  "errors_and_corrections": [
    {
      "error_id": 1,
      "found_text": "Military snow mobile",
      "error_type": "Spacing",
      "issue_description": "The term 'snow mobile' should be a single compound word.",
      "corrected_text": "Military snowmobile",
      "coordinates": {
        "x": 278,
        "y": 2292,
        "width": 282,
        "height": 25
      }
    }
  ]
}
```

## Supported Response Formats

The application handles multiple response formats:

### 1. Gemini API Wrapper (Recommended)
```json
[
  {
    "content": {
      "parts": [
        {
          "text": "```json\n{...}\n```"
        }
      ]
    }
  }
]
```

### 2. Array Wrapper
```json
[
  {
    "errors_and_corrections": [...]
  }
]
```

### 3. Direct Object
```json
{
  "errors_and_corrections": [...]
}
```

### 4. CamelCase (Legacy)
```json
{
  "errorsAndCorrections": [...]
}
```

## Gemini Prompt Template

Use this prompt in your N8N Gemini Vision node:

```
Analyze this image for text errors including:
- Spelling mistakes
- Grammatical errors
- Punctuation errors
- Spacing issues (e.g., "snow mobile" should be "snowmobile")
- Consistency errors (e.g., inconsistent capitalization)
- Contextual problems

For each error found, provide:
1. error_id: A unique number
2. found_text: The exact text containing the error
3. error_type: One of: "Spelling", "Punctuation/Grammar", "Spacing", "Consistency", "Context", "Suggestions"
4. issue_description: A clear description of the problem
5. corrected_text: The corrected version
6. coordinates: Bounding box in pixels from top-left corner

CRITICAL REQUIREMENTS:
- Coordinates MUST be in PIXELS relative to the original image dimensions
- x: pixels from LEFT edge (0 = left edge)
- y: pixels from TOP edge (0 = top edge)
- width: width of error region in pixels
- height: height of error region in pixels
- All coordinate values must be NUMBERS, not strings

Return ONLY valid JSON in this EXACT format:
{
  "scale_using_to_giving_cordinates": "pixel",
  "image_dimensions": {
    "x": 0,
    "y": 0,
    "width": <original_image_width>,
    "height": <original_image_height>
  },
  "errors_and_corrections": [
    {
      "error_id": 1,
      "found_text": "the error text",
      "error_type": "Spelling",
      "issue_description": "description of the issue",
      "corrected_text": "corrected text",
      "coordinates": {
        "x": 278,
        "y": 2292,
        "width": 282,
        "height": 25
      },
      "confidence": "high"
    }
  ]
}

IMPORTANT: The image_dimensions MUST contain the actual dimensions of the image you're analyzing.
```

## N8N Workflow Setup

### Step 1: Receive Image Upload
```
Webhook Trigger → Get Image from Supabase Storage
```

### Step 2: Call Gemini Vision API
```
HTTP Request Node:
- Method: POST
- URL: https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent
- Headers:
  - Content-Type: application/json
  - x-goog-api-key: YOUR_GEMINI_API_KEY
- Body:
{
  "contents": [{
    "parts": [
      {
        "text": "<YOUR_PROMPT_HERE>"
      },
      {
        "inline_data": {
          "mime_type": "image/jpeg",
          "data": "{{$binary.data.data}}"
        }
      }
    ]
  }]
}
```

### Step 3: Send Results to ImageLens Pro
```
HTTP Request Node:
- Method: POST
- URL: <YOUR_IMAGELENS_WEBHOOK_URL>
- Body: {{$json}}
```

## Error Types Mapping

| Gemini Error Type | Database Type | Color |
|-------------------|---------------|-------|
| Spelling | spelling | Red |
| Punctuation/Grammar | grammatical | Orange |
| Spacing | space | Yellow |
| Context | context | Blue |
| Consistency | context | Blue |
| Suggestions | suggestions | Green |

## Coordinate Validation

### Valid Coordinates
```json
{
  "x": 278,        // ✅ Number
  "y": 2292,       // ✅ Number
  "width": 282,    // ✅ Number
  "height": 25     // ✅ Number
}
```

### Invalid Coordinates
```json
{
  "x": "278",      // ❌ String (will fail)
  "y": "2292",     // ❌ String (will fail)
  "width": null,   // ⚠️ Will use default 20px
  "height": null   // ⚠️ Will use default 20px
}
```

## Testing Your Integration

### 1. Test with Sample Data

Send this test payload to your webhook:

```json
{
  "image_dimensions": {
    "x": 0,
    "y": 0,
    "width": 1000,
    "height": 1000
  },
  "errors_and_corrections": [
    {
      "error_id": 1,
      "found_text": "TEST",
      "error_type": "Spelling",
      "issue_description": "Test error at center",
      "corrected_text": "TEST",
      "coordinates": {
        "x": 450,
        "y": 450,
        "width": 100,
        "height": 50
      }
    }
  ]
}
```

**Expected Result:**
- Error box appears in the center of the image
- Box is approximately 100px wide and 50px tall (scaled to display size)

### 2. Verify in Browser Console

After uploading an image, check the console for:

```
Webhook raw response: [...]
Detected Gemini API response structure
Parsed webhook data: {...}
Original image dimensions from Gemini: {width: 2881, height: 3301}
Processing error: 1 coordField: {x: 278, y: 2292, width: 282, height: 25}
Parsed coordinates: {x: 278, y: 2292, width: 282, height: 25}
Image dimensions: {
  displayed: {width: 800, height: 916},
  original: {width: 2881, height: 3301},
  geminiProvided: true,
  scaleX: 0.2777,
  scaleY: 0.2775
}
Error position calculation: {
  errorId: "...",
  original: {x: 278, y: 2292, w: 282, h: 25},
  scale: {scaleX: 0.2777, scaleY: 0.2775},
  result: {left: 77.2, top: 636.1, width: 78.3, height: 6.9}
}
```

### 3. Verify in Database

Check that dimensions were stored:

```sql
SELECT 
  id,
  filename,
  original_width,
  original_height,
  status
FROM images
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:**
- original_width: 2881
- original_height: 3301
- status: 'completed'

## Troubleshooting

### Issue: Boxes Still in Wrong Positions

**Check 1: Verify Gemini is providing image_dimensions**
```javascript
console.log('Original image dimensions from Gemini:', imageDimensions);
```
Should show: `{width: 2881, height: 3301}`

**Check 2: Verify dimensions are stored in database**
```sql
SELECT original_width, original_height FROM images WHERE id = 'your-image-id';
```
Should NOT be NULL.

**Check 3: Verify scaling is using correct dimensions**
```javascript
console.log('Image dimensions:', {
  displayed: {...},
  original: {...},
  geminiProvided: true  // ← Should be true
});
```

### Issue: image_dimensions Not Being Saved

**Cause:** Gemini response doesn't include image_dimensions

**Solution:** Update your Gemini prompt to explicitly request image dimensions:
```
"You MUST include the image_dimensions field with the actual width and height of the image you're analyzing."
```

### Issue: Coordinates Are Strings

**Cause:** Gemini returning coordinates as strings instead of numbers

**Solution:** Add to your prompt:
```
"All coordinate values (x, y, width, height) MUST be numbers, NOT strings."
```

## Best Practices

### 1. Always Include Image Dimensions
Gemini should always return the original image dimensions in the response.

### 2. Use Pixel Coordinates
Never use percentages or normalized coordinates (0-1). Always use absolute pixels.

### 3. Validate Coordinate Types
Ensure all coordinates are numbers, not strings.

### 4. Test with Different Image Sizes
Test with images of various dimensions to ensure scaling works correctly:
- Small: 800x600
- Medium: 1920x1080
- Large: 4000x3000

### 5. Handle Missing Dimensions Gracefully
The application falls back to `img.naturalWidth/Height` if Gemini doesn't provide dimensions, but this may be less accurate if the image was resized during upload.

## Summary

✅ **What's Fixed:**
- Supports Gemini API response structure
- Extracts JSON from markdown code blocks
- Stores original image dimensions from Gemini
- Uses Gemini dimensions for accurate scaling
- Supports both `errors_and_corrections` and `errorsAndCorrections`
- Supports both `coordinates` and `Coordinates`
- Handles all response wrapper formats

✅ **What You Need to Do:**
1. Update your Gemini prompt to include image_dimensions
2. Ensure coordinates are numbers, not strings
3. Test with the sample payload above
4. Verify dimensions are being stored in database
5. Check browser console for accurate scaling

✅ **Expected Result:**
- Error boxes appear at EXACT locations on the text
- Boxes scale perfectly when browser is resized
- Coordinates are accurate regardless of display size
- Works with any image dimensions
