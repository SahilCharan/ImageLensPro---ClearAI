# Coordinate Fix Testing Guide

## Overview
This document provides step-by-step testing procedures to verify the bounding box coordinate fixes in ImageLens Pro.

---

## What Was Fixed

### 1. **Coordinate Scaling Logic**
- ✅ Now uses `getBoundingClientRect()` for accurate displayed dimensions
- ✅ Uses `naturalWidth/naturalHeight` for original image dimensions
- ✅ Calculates precise scale factors: `scaleX = displayedWidth / naturalWidth`
- ✅ Applies container offset for padding/borders

### 2. **Coordinate Parser**
- ✅ Added `parseCoordinatesFromWebhook()` helper function
- ✅ Supports both string format: `"x: 295, y: 126, width: 440, height: 10"`
- ✅ Supports object format: `{ "x": 295, "y": 126, "width": 440, "height": 10 }`
- ✅ Converts percentages to pixels using natural dimensions

### 3. **Dimension Updates**
- ✅ Enhanced `handleImageLoad()` to use `getBoundingClientRect()`
- ✅ Added `updateDimensions()` function for recalculation
- ✅ Window resize listener for responsive scaling
- ✅ Container offset calculation for accurate positioning

### 4. **Error Type Normalization**
- ✅ Converts error types to lowercase before color lookup
- ✅ Prevents crashes from capitalized error types ("Spelling", "Grammar", etc.)
- ✅ Fallback to default color if type not found

### 5. **Tooltip Positioning**
- ✅ Default position: below the bounding box
- ✅ Auto-flip to above if would overflow viewport
- ✅ Position relative to box dimensions, not global screen

### 6. **Validation & Guards**
- ✅ Added `isReady` state to prevent premature rendering
- ✅ Minimum 3px width/height for visibility
- ✅ Clamping to prevent overflow outside image
- ✅ Comprehensive console logging for debugging

### 7. **UI Enhancements**
- ✅ Added "Show/Hide Boxes" toggle button
- ✅ Improved error marker visibility
- ✅ Better hover effects and transitions

---

## Testing Procedures

### Test 1: Basic Coordinate Display

**Steps:**
1. Upload a test image with known errors
2. Wait for webhook processing to complete
3. Navigate to the image analysis page
4. Verify bounding boxes appear on the image

**Expected Results:**
- ✅ Boxes appear exactly over error text
- ✅ Box size matches text dimensions
- ✅ No boxes outside image boundaries
- ✅ Console shows dimension calculations

**Console Output to Check:**
```javascript
Image dimensions updated: {
  displayed: { width: 800, height: 600 },
  original: { width: 4800, height: 3600 },
  offset: { left: 0, top: 0 },
  geminiProvided: true,
  scaleX: 0.1667,
  scaleY: 0.1667
}
```

---

### Test 2: Browser Resize Responsiveness

**Steps:**
1. Open image analysis page with errors displayed
2. Resize browser window (make it smaller)
3. Resize browser window (make it larger)
4. Observe bounding box positions

**Expected Results:**
- ✅ Boxes scale proportionally with image
- ✅ Boxes remain aligned with text
- ✅ No jumping or misalignment
- ✅ Console logs show recalculation on resize

---

### Test 3: Tooltip Positioning

**Steps:**
1. Hover over a bounding box near the top of the image
2. Hover over a bounding box near the bottom of the image
3. Hover over boxes on left and right sides

**Expected Results:**
- ✅ Tooltip appears below box (default)
- ✅ Tooltip flips above if would overflow bottom
- ✅ Tooltip is always fully visible
- ✅ Tooltip shows correct error details

---

### Test 4: Error Type Handling

**Steps:**
1. Check errors with different types: "Spelling", "Grammar", "Spacing"
2. Verify each error type has correct color
3. Check tooltip shows correct label

**Expected Results:**
- ✅ Spelling errors: Red color
- ✅ Grammar errors: Orange color
- ✅ Spacing errors: Yellow color
- ✅ Context errors: Blue color
- ✅ Suggestions: Green color
- ✅ No crashes from capitalized types

---

### Test 5: Show/Hide Toggle

**Steps:**
1. Click "Hide Boxes" button
2. Verify boxes disappear
3. Click "Show Boxes" button
4. Verify boxes reappear

**Expected Results:**
- ✅ Toggle button changes text
- ✅ Boxes hide/show smoothly
- ✅ Error summary still visible
- ✅ No console errors

---

### Test 6: Coordinate Format Compatibility

**Test with String Format:**
```json
{
  "coordinates": "x: 172, y: 122, width: 155, height: 16"
}
```

**Test with Object Format:**
```json
{
  "coordinates": {
    "x": 172,
    "y": 122,
    "width": 155,
    "height": 16
  }
}
```

**Expected Results:**
- ✅ Both formats work correctly
- ✅ Boxes appear in same position
- ✅ No parsing errors in console

---

### Test 7: Edge Cases

**Test Scenarios:**

1. **Very Small Errors (1-2 pixels)**
   - Expected: Minimum 3px box displayed
   
2. **Errors at Image Edges**
   - Expected: Boxes clamped within image boundaries
   
3. **Overlapping Errors**
   - Expected: Hovered box appears on top (z-index)
   
4. **Missing Dimensions**
   - Expected: Falls back to naturalWidth/naturalHeight
   
5. **Zero-width/height Errors**
   - Expected: Box not rendered (filtered out)

---

## Console Log Verification

### Expected Log Output

**On Image Load:**
```javascript
Image dimensions updated: {
  displayed: { width: 800, height: 600 },
  original: { width: 4800, height: 3600 },
  offset: { left: 16, top: 16 },
  geminiProvided: true,
  scaleX: 0.1667,
  scaleY: 0.1667
}
```

**For Each Error:**
```javascript
Error position calculation: {
  errorId: "uuid-here",
  errorType: "spelling",
  original: { x: 172, y: 122, w: 155, h: 16 },
  scale: { scaleX: "0.1667", scaleY: "0.1667" },
  result: { 
    left: "28.67", 
    top: "20.33", 
    width: "25.84", 
    height: "2.67" 
  },
  containerOffset: { left: 16, top: 16 }
}
```

---

## Sample Test Data

### Test Webhook Payload

```json
{
  "image_id": "your-image-uuid",
  "status": "completed",
  "image_dimensions": {
    "width": 4800,
    "height": 3600
  },
  "errors_and_corrections": [
    {
      "error_id": 1,
      "found_text": "REFENRENCE ITEM #:",
      "error_type": "Spelling",
      "issue_description": "Misspelled word - should be 'REFERENCE'",
      "corrected_text": "REFERENCE ITEM #:",
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
      "found_text": "OVER ALL SIZE",
      "error_type": "Spacing",
      "issue_description": "Should be one word 'OVERALL'",
      "corrected_text": "OVERALL SIZE",
      "coordinates": {
        "x": 295,
        "y": 126,
        "width": 440,
        "height": 10
      },
      "confidence": "high"
    }
  ]
}
```

---

## Troubleshooting

### Problem: Boxes are offset from text

**Check:**
1. Console log for scale factors
2. Database values for `original_width` and `original_height`
3. Gemini response format (pixels vs percentages)
4. Container padding/borders

**Solution:**
- Verify Gemini returns pixel coordinates
- Check `containerOffset` in console logs
- Ensure image loaded before rendering boxes

---

### Problem: Boxes don't appear

**Check:**
1. `isReady` state in React DevTools
2. Error coordinates in database (not zero)
3. `showBoxes` toggle state
4. Browser console for errors

**Solution:**
- Wait for image to load completely
- Check `position.visible` in render logic
- Verify error data exists in `imageData.errors`

---

### Problem: Boxes don't scale on resize

**Check:**
1. Window resize listener attached
2. `updateDimensions()` being called
3. Console logs on resize

**Solution:**
- Check useEffect dependencies
- Verify refs are not null
- Ensure state updates trigger re-render

---

### Problem: Tooltip appears off-screen

**Check:**
1. Tooltip positioning logic
2. `wouldOverflowBottom` calculation
3. Image dimensions state

**Solution:**
- Verify tooltip flip logic
- Check viewport height calculation
- Adjust tooltip offset values

---

## Performance Verification

### Metrics to Check

1. **Initial Load Time**
   - Image should load within 2 seconds
   - Boxes should appear immediately after image load
   
2. **Resize Performance**
   - Smooth scaling without lag
   - Boxes update within 100ms of resize
   
3. **Hover Responsiveness**
   - Tooltip appears instantly on hover
   - No delay or flickering

---

## Acceptance Criteria Checklist

- [ ] Bounding boxes appear exactly over text regions
- [ ] Boxes scale correctly when resizing browser
- [ ] No overflow outside image container
- [ ] Tooltip always visible and correctly aligned
- [ ] Works with string coordinate format
- [ ] Works with object coordinate format
- [ ] Works with percentage format (converted to pixels)
- [ ] Console logs show correct scaleX/scaleY math
- [ ] Error types normalized (lowercase)
- [ ] Show/Hide toggle works correctly
- [ ] Minimum 3px box size enforced
- [ ] Boxes clamped to image boundaries
- [ ] Window resize updates positions
- [ ] No console errors or warnings

---

## Post-Testing Actions

After all tests pass:

1. ✅ Commit changes with descriptive message
2. ✅ Update documentation if needed
3. ✅ Notify team of coordinate fix completion
4. ✅ Deploy to production environment
5. ✅ Monitor for any user-reported issues

---

## Support Resources

- **Main Documentation**: `GEMINI_INTEGRATION_GUIDE.md`
- **Prompt Guide**: `GEMINI_PROMPT_UPDATE.md`
- **Quick Reference**: `QUICK_REFERENCE.md`
- **Source Code**: `src/pages/ImageAnalysis.tsx`
- **Webhook Service**: `src/services/webhookService.ts`
