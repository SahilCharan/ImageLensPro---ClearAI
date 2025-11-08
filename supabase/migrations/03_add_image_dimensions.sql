/*
# Add Original Image Dimensions to Images Table

This migration adds columns to store the original image dimensions as reported
by Gemini Vision API. These dimensions are used for accurate coordinate scaling.

## Changes
- Add `original_width` column (integer, nullable) to store original image width in pixels
- Add `original_height` column (integer, nullable) to store original image height in pixels

## Notes
- These dimensions come from Gemini's image_dimensions response
- Used for scaling error coordinates from original image to displayed size
- Existing records will have NULL values (will use img.naturalWidth/Height as fallback)
*/

ALTER TABLE images 
ADD COLUMN original_width integer,
ADD COLUMN original_height integer;
