/*
# Add Width and Height to Errors Table

This migration adds width and height columns to the errors table to support
displaying error bounding boxes instead of just point coordinates.

## Changes
- Add `width` column (numeric, nullable) to store error box width in pixels
- Add `height` column (numeric, nullable) to store error box height in pixels

## Notes
- Existing records will have NULL values for width and height
- New error records from webhook will include these dimensions
*/

ALTER TABLE errors 
ADD COLUMN width numeric,
ADD COLUMN height numeric;
