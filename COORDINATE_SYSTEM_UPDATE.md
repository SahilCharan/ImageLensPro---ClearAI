# Coordinate System Update - ImageLens Pro

## Overview
Updated the error detection system to use bounding boxes (rectangles) instead of point markers, with proper coordinate scaling from the original image to the displayed image.

## Changes Made

### 1. Database Schema Update
**File:** `supabase/migrations/02_add_error_dimensions.sql`
- Added `width` column (numeric, nullable) to errors table
- Added `height` column (numeric, nullable) to errors table
- These store the bounding box dimensions in pixels from the original image

### 2. Type Definitions Update
**File:** `src/types/types.ts`
- Updated `ImageError` interface to include:
  - `width: number | null`
  - `height: number | null`

### 3. Webhook Service Updates
**File:** `src/services/webhookService.ts`

#### Coordinate Parsing
- Enhanced `parseCoordinates()` function to extract all four values: x, y, width, height
- Handles webhook response format: `"x: 295, y: 126, width: 440, height: 10"`

#### Array Wrapper Handling
- Added logic to unwrap array responses from webhook: `[{ errorsAndCorrections: [...] }]`
- Extracts the first element if response is an array

#### Error Record Creation
- Updated error record mapping to include width and height:
```typescript
{
  image_id: imageId,
  error_type: mapErrorType(error.error_type),
  x_coordinate: coords.x,
  y_coordinate: coords.y,
  width: coords.width || null,
  height: coords.height || null,
  original_text: error.found_text || null,
  suggested_correction: error.corrected_text || null,
  description: error.issue_description || null,
}
```

#### Mock Data Update
- Updated all mock error records to include width and height values
- Mock boxes use realistic dimensions (60-120px width, 20px height)

### 4. Image Analysis Page Updates
**File:** `src/pages/ImageAnalysis.tsx`

#### Dimension Tracking
- Added `imageNaturalDimensions` state to track original image size
- Updated `handleImageLoad()` to capture both displayed and natural dimensions

#### Coordinate Scaling
- Enhanced `getErrorPosition()` function to:
  1. Calculate scale factors: `scaleX = displayedWidth / naturalWidth`
  2. Scale all coordinates: x, y, width, height
  3. Return complete bounding box dimensions
  4. Provide default 20px dimensions if width/height are null

#### Visual Representation
- **Changed from dots to rectangles:**
  - Error markers now display as bordered boxes
  - Box size matches the actual error region
  - Semi-transparent background (20% opacity)
  - Increases to 40% opacity on hover
  - Border color matches error type
  - Glowing shadow effect on hover

#### Hover Tooltip
- Repositioned tooltip to appear below the error box
- Dynamic positioning based on box height: `top: ${position.height + 8}px`
- Maintains left alignment with the error box

#### Error Table
- Updated Location column to display all coordinates:
  - Line 1: `x:295, y:126`
  - Line 2: `w:440, h:10` (if available)
- Uses monospace font for better readability

### 5. Upload Flow Update
**File:** `src/pages/Upload.tsx`
- Changed to wait for webhook completion before navigation
- Shows "Analyzing Image" toast during processing
- Shows "Analysis Complete" toast when done
- User is redirected only after analysis completes

## Coordinate System Explanation

### Original Image Coordinates
The webhook (Gemini Pro Vision) provides coordinates in the **original image's pixel space**:
- Example: `x: 295, y: 126, width: 440, height: 10`
- These are absolute pixel positions in the source image

### Display Scaling
The frontend scales these coordinates to match the displayed image size:

```typescript
const scaleX = displayedWidth / naturalWidth;
const scaleY = displayedHeight / naturalHeight;

const displayLeft = originalX * scaleX;
const displayTop = originalY * scaleY;
const displayWidth = originalWidth * scaleX;
const displayHeight = originalHeight * scaleY;
```

### Why This Approach?
1. **Accuracy:** Coordinates from AI model are precise to the original image
2. **Flexibility:** Display can be any size, scaling is automatic
3. **Consistency:** Same coordinate system as the AI model uses
4. **Simplicity:** No need to convert coordinates in the webhook

## Webhook Response Format

### Expected Format
```json
[
  {
    "errorsAndCorrections": [
      {
        "error_id": "1",
        "found_text": "recieve",
        "error_type": "Spelling",
        "issue_description": "Incorrect spelling",
        "corrected_text": "receive",
        "Coordinates": "x: 295, y: 126, width: 440, height: 10"
      }
    ]
  }
]
```

### Alternative Format (also supported)
```json
{
  "errorsAndCorrections": [
    {
      "error_id": "1",
      "found_text": "recieve",
      "error_type": "Spelling",
      "issue_description": "Incorrect spelling",
      "corrected_text": "receive",
      "Coordinates": {
        "x": 295,
        "y": 126,
        "width": 440,
        "height": 10
      }
    }
  ]
}
```

## Instructions for Gemini Pro Vision

When configuring your N8N webhook with Gemini Pro Vision, use this prompt:

```
Analyze this image for text errors. For each error found, provide:
1. The exact text with the error (found_text)
2. The error type: Spelling, Punctuation/Grammar, Consistency, Context, or Suggestions
3. A description of the issue (issue_description)
4. The corrected text (corrected_text)
5. The bounding box coordinates in the format: "x: [left], y: [top], width: [width], height: [height]"

The coordinates should be in pixels relative to the original image dimensions.
The x,y position is the top-left corner of the error region.
The width and height define the size of the bounding box containing the error.

Return the response in this JSON format:
{
  "errorsAndCorrections": [
    {
      "error_id": "1",
      "found_text": "the error text",
      "error_type": "Spelling",
      "issue_description": "description of the issue",
      "corrected_text": "corrected text",
      "Coordinates": "x: 295, y: 126, width: 440, height: 10"
    }
  ]
}
```

## Testing

### Manual Testing Steps
1. Upload an image with text errors
2. Wait for analysis to complete
3. Verify error boxes appear at correct locations
4. Hover over boxes to see error details
5. Check that boxes scale properly when resizing browser
6. Verify table shows all coordinate values

### Expected Behavior
- ✅ Error boxes appear as colored rectangles
- ✅ Boxes are positioned at the correct text locations
- ✅ Boxes scale proportionally with image size
- ✅ Hover shows detailed error information
- ✅ Table displays x, y, width, height values
- ✅ Different error types have different colors

## Color Coding
- 🔴 **Red** - Spelling errors
- 🟠 **Orange** - Grammatical errors  
- 🟡 **Yellow** - Space issues
- 🔵 **Blue** - Context errors
- 🟢 **Green** - Suggestions

## Future Enhancements
- [ ] Add ability to click error box to jump to table row
- [ ] Add ability to click table row to highlight error box
- [ ] Add zoom/pan controls for detailed inspection
- [ ] Add export functionality for error report
- [ ] Add batch processing for multiple images
