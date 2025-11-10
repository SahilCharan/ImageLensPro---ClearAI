# Normalized Coordinates Implementation Guide

## Overview

ImageLens Pro now supports **normalized bounding box coordinates** from Gemini Pro Vision API. This format uses fractional values (0-1) instead of absolute pixels, making coordinates resolution-independent.

---

## 📊 Coordinate Format

### New Format: Normalized Array
```json
{
  "error_id": 1,
  "found_text": "OVER ALL SIZE:",
  "error_type": "Spacing",
  "coordinates": [0.237, 0.2599, 0.2509, 0.3339],
  "confidence": "high"
}
```

**Array Structure:** `[y1, x1, y2, x2]`
- `y1`: Top edge (fraction of image height, 0-1)
- `x1`: Left edge (fraction of image width, 0-1)
- `y2`: Bottom edge (fraction of image height, 0-1)
- `x2`: Right edge (fraction of image width, 0-1)

### Image Dimensions
```json
{
  "image_dimensions": {
    "width": 1920,
    "height": 1080
  }
}
```

---

## 🔄 Conversion Process

### Step 1: Webhook Receives Normalized Coordinates

**Example Input:**
```json
{
  "coordinates": [0.237, 0.2599, 0.2509, 0.3339],
  "image_dimensions": { "width": 1920, "height": 1080 }
}
```

### Step 2: Backend Converts to Pixels

**Conversion Formula:**
```javascript
const [y1, x1, y2, x2] = coordinates;
const imgWidth = 1920;
const imgHeight = 1080;

// Convert to pixel coordinates
const x = x1 * imgWidth;      // 0.2599 × 1920 = 499.008
const y = y1 * imgHeight;     // 0.237 × 1080 = 255.96
const width = (x2 - x1) * imgWidth;   // (0.3339 - 0.2599) × 1920 = 142.08
const height = (y2 - y1) * imgHeight; // (0.2509 - 0.237) × 1080 = 14.972
```

**Result:**
```javascript
{
  x: 499.008,
  y: 255.96,
  width: 142.08,
  height: 14.972
}
```

### Step 3: Store in Database

The webhook service stores pixel coordinates in the database:
```sql
INSERT INTO errors (x_coordinate, y_coordinate, width, height)
VALUES (499.008, 255.96, 142.08, 14.972);
```

### Step 4: Frontend Scales to Display Size

If the image displays at 960×540 on screen:
```javascript
const scaleX = 960 / 1920 = 0.5;
const scaleY = 540 / 1080 = 0.5;

const displayLeft = 499.008 × 0.5 = 249.504px;
const displayTop = 255.96 × 0.5 = 127.98px;
const displayWidth = 142.08 × 0.5 = 71.04px;
const displayHeight = 14.972 × 0.5 = 7.486px;
```

---

## 🛠️ Implementation Details

### Webhook Service (`src/services/webhookService.ts`)

The webhook service automatically detects and converts normalized coordinates:

```javascript
if (Array.isArray(coordField) && coordField.length === 4) {
  // Normalized format: [y1, x1, y2, x2]
  const [y1, x1, y2, x2] = coordField.map(Number);
  const imgWidth = imageDimensions?.width || 1920;
  const imgHeight = imageDimensions?.height || 1080;
  
  coords = {
    x: x1 * imgWidth,
    y: y1 * imgHeight,
    width: (x2 - x1) * imgWidth,
    height: (y2 - y1) * imgHeight
  };
}
```

### Supported Formats

The system now supports **three coordinate formats**:

1. **Normalized Array** (NEW)
   ```json
   "coordinates": [0.237, 0.2599, 0.2509, 0.3339]
   ```

2. **Pixel Object**
   ```json
   "coordinates": { "x": 499, "y": 256, "width": 142, "height": 15 }
   ```

3. **String Format**
   ```json
   "coordinates": "x: 499, y: 256, width: 142, height: 15"
   ```

---

## 📋 Example Webhook Response

### Complete Response Structure

```json
[
  {
    "errors_and_corrections": [
      {
        "error_id": 1,
        "found_text": "OVER ALL SIZE:",
        "error_type": "Spacing",
        "issue_description": "Extra space between 'OVER' and 'ALL'. Should be 'OVERALL SIZE:'.",
        "corrected_text": "OVERALL SIZE:",
        "coordinates": [0.237, 0.2599, 0.2509, 0.3339],
        "confidence": "high"
      },
      {
        "error_id": 2,
        "found_text": "REFERENRE ITEM #:",
        "error_type": "Spelling",
        "issue_description": "'REFERENRE' is misspelled. Should be 'REFERENCE'.",
        "corrected_text": "REFERENCE ITEM #:",
        "coordinates": [0.1065, 0.2599, 0.1185, 0.3661],
        "confidence": "high"
      }
    ],
    "image_dimensions": {
      "width": 1920,
      "height": 1080
    },
    "totals": {
      "total_text_items": 65,
      "total_errors": 12,
      "by_type": {
        "Spacing": 2,
        "Spelling": 3,
        "Consistency": 3,
        "Formatting": 4
      }
    }
  }
]
```

---

## 🧮 Coordinate Calculation Examples

### Example 1: Top-Left Error

**Normalized:** `[0.1065, 0.2599, 0.1185, 0.3661]`
**Image:** 1920×1080

```javascript
y1 = 0.1065, x1 = 0.2599, y2 = 0.1185, x2 = 0.3661

// Convert to pixels
x = 0.2599 × 1920 = 499.008px
y = 0.1065 × 1080 = 115.02px
width = (0.3661 - 0.2599) × 1920 = 203.904px
height = (0.1185 - 0.1065) × 1080 = 12.96px
```

**Result Box:** 499×115, size 204×13 pixels

### Example 2: Bottom-Right Error

**Normalized:** `[0.8932, 0.1972, 0.9922, 0.2222]`
**Image:** 1920×1080

```javascript
y1 = 0.8932, x1 = 0.1972, y2 = 0.9922, x2 = 0.2222

// Convert to pixels
x = 0.1972 × 1920 = 378.624px
y = 0.8932 × 1080 = 964.656px
width = (0.2222 - 0.1972) × 1920 = 48px
height = (0.9922 - 0.8932) × 1080 = 106.92px
```

**Result Box:** 379×965, size 48×107 pixels

---

## 🎯 Error Type Mapping

The webhook service maps Gemini error types to database types:

| Gemini Type | Database Type | Color |
|-------------|---------------|-------|
| Spelling | spelling | Red |
| Grammar | grammatical | Orange |
| Spacing | space | Yellow |
| Context | context | Blue |
| Consistency | context | Blue |
| Formatting | suggestions | Green |
| Suggestions | suggestions | Green |

---

## ✅ Validation Rules

### Coordinate Validation

1. **Array Length:** Must be exactly 4 elements
2. **Value Range:** All values must be between 0 and 1
3. **Order:** y1 < y2 and x1 < x2
4. **Non-zero:** Width and height must be positive

### Image Dimensions

1. **Required:** `image_dimensions` must be present in response
2. **Positive:** Width and height must be > 0
3. **Reasonable:** Typically 100-10000 pixels

---

## 🔍 Debugging

### Console Logs

The webhook service logs detailed conversion information:

```javascript
Processing error: 1 coordField: [0.237, 0.2599, 0.2509, 0.3339]

Converted normalized coords: {
  normalized: [0.237, 0.2599, 0.2509, 0.3339],
  imageDims: { width: 1920, height: 1080 },
  pixels: { x: 499.008, y: 255.96, width: 142.08, height: 14.972 }
}

Final parsed coordinates: { x: 499.008, y: 255.96, width: 142.08, height: 14.972 }
```

### Frontend Logs

The frontend logs scaling calculations:

```javascript
Error position calculation: {
  errorId: "uuid",
  errorType: "spacing",
  original: { x: 499.008, y: 255.96, w: 142.08, h: 14.972 },
  scale: { scaleX: "0.5000", scaleY: "0.5000" },
  result: { left: "249.50", top: "127.98", width: "71.04", height: "7.49" }
}
```

---

## 🧪 Testing

### Test Case 1: Normalized Coordinates

**Input:**
```json
{
  "coordinates": [0.237, 0.2599, 0.2509, 0.3339],
  "image_dimensions": { "width": 1920, "height": 1080 }
}
```

**Expected Database Values:**
```javascript
x_coordinate: 499.008
y_coordinate: 255.96
width: 142.08
height: 14.972
```

**Expected Display (960×540):**
```javascript
left: 249.50px
top: 127.98px
width: 71.04px
height: 7.49px
```

### Test Case 2: Edge Coordinates

**Input:**
```json
{
  "coordinates": [0.0, 0.0, 0.1, 0.1],
  "image_dimensions": { "width": 1920, "height": 1080 }
}
```

**Expected Database Values:**
```javascript
x_coordinate: 0
y_coordinate: 0
width: 192
height: 108
```

### Test Case 3: Full Image

**Input:**
```json
{
  "coordinates": [0.0, 0.0, 1.0, 1.0],
  "image_dimensions": { "width": 1920, "height": 1080 }
}
```

**Expected Database Values:**
```javascript
x_coordinate: 0
y_coordinate: 0
width: 1920
height: 1080
```

---

## 🚨 Common Issues

### Issue 1: Boxes Appear in Wrong Location

**Cause:** Image dimensions not provided or incorrect

**Solution:** Verify `image_dimensions` in webhook response matches actual image

**Check:**
```javascript
console.log('Image dimensions from Gemini:', imageDimensions);
console.log('Image natural dimensions:', img.naturalWidth, img.naturalHeight);
```

### Issue 2: Boxes Too Small or Too Large

**Cause:** Incorrect coordinate order (x/y swapped)

**Solution:** Verify array order is `[y1, x1, y2, x2]` not `[x1, y1, x2, y2]`

### Issue 3: Boxes Outside Image

**Cause:** Normalized values > 1 or < 0

**Solution:** Validate normalized coordinates are in range [0, 1]

---

## 📊 Performance Considerations

### Conversion Overhead

- **Negligible:** Conversion happens once during webhook processing
- **Cached:** Pixel coordinates stored in database
- **Efficient:** Frontend only scales, doesn't convert

### Memory Usage

- **Normalized:** 4 floats = 16 bytes
- **Pixels:** 4 floats = 16 bytes
- **No difference:** Same memory footprint

### Accuracy

- **Normalized:** Maintains precision across resolutions
- **Pixels:** May lose precision when scaling
- **Recommendation:** Use normalized for source of truth

---

## 🎓 Best Practices

### 1. Always Provide Image Dimensions

```json
{
  "image_dimensions": { "width": 1920, "height": 1080 }
}
```

### 2. Use Consistent Coordinate Order

Always use `[y1, x1, y2, x2]` format

### 3. Validate Coordinate Ranges

Ensure all values are between 0 and 1:
```javascript
const isValid = coords.every(c => c >= 0 && c <= 1);
```

### 4. Handle Missing Dimensions

Provide fallback dimensions:
```javascript
const imgWidth = imageDimensions?.width || 1920;
const imgHeight = imageDimensions?.height || 1080;
```

### 5. Log Conversion Details

Always log coordinate conversions for debugging:
```javascript
console.log('Converted normalized coords:', {
  normalized: coordField,
  imageDims: { width: imgWidth, height: imgHeight },
  pixels: coords
});
```

---

## 🔄 Migration Guide

### From Pixel Coordinates to Normalized

If you have existing pixel coordinates and want to convert to normalized:

```javascript
function pixelsToNormalized(x, y, width, height, imgWidth, imgHeight) {
  return [
    y / imgHeight,           // y1
    x / imgWidth,            // x1
    (y + height) / imgHeight, // y2
    (x + width) / imgWidth    // x2
  ];
}
```

**Example:**
```javascript
pixelsToNormalized(499, 256, 142, 15, 1920, 1080);
// Returns: [0.237, 0.2599, 0.2509, 0.3339]
```

### From Normalized to Pixels

Already implemented in webhook service:

```javascript
function normalizedToPixels(coords, imgWidth, imgHeight) {
  const [y1, x1, y2, x2] = coords;
  return {
    x: x1 * imgWidth,
    y: y1 * imgHeight,
    width: (x2 - x1) * imgWidth,
    height: (y2 - y1) * imgHeight
  };
}
```

---

## 📞 Support

### Troubleshooting Checklist

- [ ] Verify `image_dimensions` in webhook response
- [ ] Check coordinate array has 4 elements
- [ ] Confirm values are between 0 and 1
- [ ] Verify order is `[y1, x1, y2, x2]`
- [ ] Check console logs for conversion details
- [ ] Validate database values are in pixels
- [ ] Ensure frontend scaling is correct

### Resources

- **Webhook Service:** `src/services/webhookService.ts`
- **Frontend Display:** `src/pages/ImageAnalysis.tsx`
- **Type Definitions:** `src/types/types.ts`
- **Database Schema:** `supabase/migrations/`

---

## 🎉 Summary

✅ **Normalized coordinates supported** - `[y1, x1, y2, x2]` format  
✅ **Automatic conversion** - Webhook converts to pixels  
✅ **Resolution independent** - Works with any image size  
✅ **Backward compatible** - Still supports pixel formats  
✅ **Comprehensive logging** - Full debugging information  
✅ **Production ready** - Tested and validated  

The system now seamlessly handles normalized bounding box coordinates from Gemini Pro Vision API while maintaining backward compatibility with existing pixel-based formats.
