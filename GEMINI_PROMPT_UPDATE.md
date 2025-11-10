# Gemini Pro Vision Prompt for ImageLens Pro

## Overview
This document contains the updated prompt for Gemini Pro Vision API to ensure accurate bounding box coordinates for error detection in packaging images.

## Critical Requirements

### 1. Coordinate System - ABSOLUTE PIXELS ONLY
**You MUST provide coordinates in ABSOLUTE PIXELS from the original image:**

- **x**: Horizontal position of the TOP-LEFT corner (pixels from left edge)
- **y**: Vertical position of the TOP-LEFT corner (pixels from top edge)
- **width**: Horizontal span of the error text (in pixels)
- **height**: Vertical span of the error text (in pixels)

**⚠️ DO NOT USE PERCENTAGES - ONLY PIXEL VALUES**

### 2. Image Dimensions Required
Always include the original image dimensions at the start of your response:

```json
{
  "image_dimensions": {
    "width": 4800,
    "height": 3600
  }
}
```

### 3. Coordinate Format
Use object format (NOT string format):

```json
"coordinates": {
  "x": 336,
  "y": 108,
  "width": 150,
  "height": 20
}
```

❌ **WRONG** (string format):
```json
"coordinates": "x: 336, y: 108, width: 150, height: 20"
```

❌ **WRONG** (percentage format):
```json
"coordinates": {
  "x": "7%",
  "y": "3%",
  "width": "3%",
  "height": "0.5%"
}
```

---

## Complete Gemini Prompt

```
You are a packaging quality control OCR and language analysis expert.
Analyze the packaging image with EXTREME PRECISION and provide EXACT pixel coordinates for each error's bounding box.

### Task Requirements

1. Extract all visible text from the image
2. Identify spelling, grammar, spacing, punctuation, consistency, and formatting errors
3. For EACH error, provide its EXACT bounding box in pixel coordinates
4. Output ONLY valid JSON (no markdown, no code blocks, no explanations)

### Coordinate System - CRITICAL

**You MUST provide coordinates in ABSOLUTE PIXELS from the original image:**

- **x**: Horizontal position of the TOP-LEFT corner (pixels from left edge)
- **y**: Vertical position of the TOP-LEFT corner (pixels from top edge)
- **width**: Horizontal span of the error text (in pixels)
- **height**: Vertical span of the error text (in pixels)

**Example**: If your image is 4800×3600 pixels and an error is near the top-left at about 7% from left and 3% from top:
- x: 336 (4800 × 0.07)
- y: 108 (3600 × 0.03)
- width: 150 (approximate text width in pixels)
- height: 20 (approximate text height in pixels)

### Measurement Guidelines

1. First, determine the image dimensions (width × height in pixels)
2. For each error:
   - Locate the erroneous text in the image
   - Identify the top-left corner of the first character
   - Measure to the bottom-right corner of the last character
   - For multi-word errors, include the entire phrase in one box
   - Add small padding (2-5 pixels) around text for visibility
3. All coordinates must be integers (whole numbers)
4. All measurements are in pixels relative to the original image

### Output Format

{
  "image_dimensions": {
    "width": 4800,
    "height": 3600
  },
  "extracted_text": [
    "All visible text from the image in reading order"
  ],
  "errors_and_corrections": [
    {
      "error_id": 1,
      "found_text": "exact text with error",
      "error_type": "Spelling",
      "issue_description": "clear explanation",
      "corrected_text": "corrected version",
      "coordinates": {
        "x": 336,
        "y": 108,
        "width": 150,
        "height": 20
      },
      "confidence": "high"
    }
  ],
  "summary": {
    "total_text_items": 0,
    "total_errors_found": 0,
    "spelling_errors": 0,
    "grammar_errors": 0,
    "consistency_errors": 0,
    "spacing_errors": 0,
    "punctuation_errors": 0,
    "formatting_errors": 0
  }
}

### Error Types

- **Spelling**: Misspelled words
- **Grammar**: Grammatical errors, punctuation errors
- **Consistency**: Inconsistent information (codes, dates, etc.)
- **Spacing**: Extra or missing spaces
- **Punctuation**: Missing or incorrect punctuation
- **Formatting**: Capitalization, production notes left in final design

### Validation Checklist

Before outputting, verify:
- ✓ Image dimensions are provided at the start
- ✓ All coordinates are within image boundaries (0 ≤ x < width, 0 ≤ y < height)
- ✓ Width and height values are positive integers
- ✓ Bounding boxes actually contain the error text when overlaid
- ✓ No coordinate values are missing or set to zeros (unless truly at origin)
- ✓ Coordinates use object format (not string format)
- ✓ JSON is valid and properly formatted
- ✓ All coordinate values are in PIXELS (not percentages)

### Important Notes

- Do NOT use percentage-based coordinates
- Do NOT use string format for coordinates
- Do NOT include production notes (like "ADD HOLD STICKER HERE") as errors unless they shouldn't be on final product
- DO include the actual image pixel dimensions
- DO use the native resolution coordinates from the original image
- DO ensure all coordinate values are integers in pixel units

Begin analysis now.
```

---

## Example Response

```json
{
  "image_dimensions": {
    "width": 4800,
    "height": 3600
  },
  "extracted_text": [
    "REFENRENCE ITEM #:",
    "OVER ALL SIZE",
    "Product Name: Premium Coffee Beans"
  ],
  "errors_and_corrections": [
    {
      "error_id": 1,
      "found_text": "REFENRENCE",
      "error_type": "Spelling",
      "issue_description": "Misspelled word - should be 'REFERENCE'",
      "corrected_text": "REFERENCE",
      "coordinates": {
        "x": 172,
        "y": 122,
        "width": 155,
        "height": 16
      },
      "confidence": "high"
    },
    {
      "error_id": 2,
      "found_text": "OVER ALL",
      "error_type": "Spacing",
      "issue_description": "Should be one word 'OVERALL'",
      "corrected_text": "OVERALL",
      "coordinates": {
        "x": 295,
        "y": 126,
        "width": 440,
        "height": 10
      },
      "confidence": "high"
    }
  ],
  "summary": {
    "total_text_items": 3,
    "total_errors_found": 2,
    "spelling_errors": 1,
    "grammar_errors": 0,
    "consistency_errors": 0,
    "spacing_errors": 1,
    "punctuation_errors": 0,
    "formatting_errors": 0
  }
}
```

---

## Integration with N8N Webhook

### Webhook Processing
The webhook service (`src/services/webhookService.ts`) will:

1. Parse the Gemini response
2. Extract `image_dimensions` and store in database
3. Process each error with its pixel coordinates
4. Store coordinates in the `errors` table

### Database Schema
Ensure these columns exist:

**images table:**
- `original_width` (integer) - from `image_dimensions.width`
- `original_height` (integer) - from `image_dimensions.height`

**errors table:**
- `x_coordinate` (numeric) - from `coordinates.x`
- `y_coordinate` (numeric) - from `coordinates.y`
- `width` (numeric) - from `coordinates.width`
- `height` (numeric) - from `coordinates.height`

---

## Testing Checklist

After implementing the updated prompt:

- [ ] Gemini returns `image_dimensions` in response
- [ ] All coordinates are in pixel format (integers)
- [ ] No percentage values in coordinates
- [ ] Coordinates use object format (not strings)
- [ ] Bounding boxes align with text in frontend
- [ ] Boxes scale correctly on browser resize
- [ ] Tooltip appears correctly on hover
- [ ] No boxes overflow outside image container
- [ ] Console logs show correct scale calculations

---

## Troubleshooting

### If boxes are misaligned:
1. Check console logs for scale factors
2. Verify `original_width` and `original_height` in database
3. Ensure Gemini returned pixel coordinates (not percentages)
4. Check that image loaded correctly (`naturalWidth` matches `original_width`)

### If boxes don't appear:
1. Check `isReady` state in console
2. Verify error coordinates are not zero
3. Check that `showBoxes` toggle is enabled
4. Inspect browser console for errors

### If Gemini returns wrong format:
1. Verify the prompt is sent exactly as specified
2. Check that response parsing handles both camelCase and snake_case
3. Ensure webhook service logs the raw response for debugging

---

## Support

For issues or questions, check:
- `GEMINI_INTEGRATION_GUIDE.md` - Full integration documentation
- `QUICK_REFERENCE.md` - Quick reference for coordinate display
- Console logs in browser developer tools
- Database values in Supabase dashboard
