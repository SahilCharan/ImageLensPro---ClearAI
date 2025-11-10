import { imageApi, errorApi } from '@/db/api';
import type { ImageError, WebhookResponse, WebhookErrorData } from '@/types/types';

// Parse coordinate string format: "x: 295, y: 126, width: 440, height: 10"
const parseCoordinates = (coordString: string): { x: number; y: number; width?: number; height?: number } => {
  const parts = coordString.split(',').map(p => p.trim());
  const coords: Record<string, number> = {};
  
  parts.forEach(part => {
    const [key, value] = part.split(':').map(s => s.trim());
    coords[key] = parseFloat(value);
  });
  
  return {
    x: coords.x || 0,
    y: coords.y || 0,
    width: coords.width,
    height: coords.height
  };
};

// Map webhook error types to our database error types
const mapErrorType = (webhookType: string): ImageError['error_type'] => {
  const typeMap: Record<string, ImageError['error_type']> = {
    'Consistency': 'context',
    'Punctuation/Grammar': 'grammatical',
    'Punctuation': 'grammatical',
    'Grammar': 'grammatical',
    'Spelling': 'spelling',
    'Spacing': 'space',
    'Context': 'context',
    'Suggestions': 'suggestions',
    'Formatting': 'suggestions' // Map formatting errors to suggestions
  };
  return typeMap[webhookType] || 'context';
};

export const webhookService = {
  /**
   * Send image file directly to webhook for analysis
   * @param imageId - Database ID of the image record
   * @param imageFile - The actual image file to send
   */
  async sendImageForAnalysis(imageId: string, imageFile: File): Promise<void> {
    // Get webhook URL from environment variable
    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || 
                      'https://shreyahubcredo.app.n8n.cloud/webhook/b17c4454-a32e-4dc9-8ee9-4da7162c4703';

    console.log('Using webhook URL:', webhookUrl);

    // Check if webhook URL is configured
    if (!webhookUrl || webhookUrl === 'https://your-n8n-instance.com/webhook/image-analysis') {
      console.warn('Webhook URL not configured. Using mock data.');
      await this.processMockAnalysis(imageId);
      return;
    }

    try {
      await imageApi.updateImageStatus(imageId, 'processing');

      // Create FormData to send the actual image file
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('image_id', imageId);
      formData.append('filename', imageFile.name);

      console.log('Sending image to webhook:', {
        url: webhookUrl,
        imageId,
        filename: imageFile.name,
        size: imageFile.size,
        type: imageFile.type
      });

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData, // Send FormData with the actual image file
      });

      console.log('Webhook response status:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`);
      }

      const rawData = await response.json();
      
      // Debug logging
      console.log('Webhook raw response:', JSON.stringify(rawData, null, 2));
      
      // Parse Gemini response structure if needed
      let parsedData: WebhookResponse;
      
      // Handle Gemini API response wrapped in content.parts[0].text
      if (Array.isArray(rawData) && rawData[0]?.content?.parts?.[0]?.text) {
        console.log('Detected Gemini API response structure');
        const jsonText = rawData[0].content.parts[0].text;
        // Extract JSON from markdown code blocks if present
        const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/) || jsonText.match(/```\n([\s\S]*?)\n```/);
        const cleanJson = jsonMatch ? jsonMatch[1] : jsonText;
        parsedData = JSON.parse(cleanJson);
      }
      // Handle array wrapper: [{ errorsAndCorrections: [...] }]
      else if (Array.isArray(rawData) && rawData.length > 0) {
        parsedData = rawData[0];
      }
      // Direct object response
      else {
        parsedData = rawData;
      }

      console.log('Parsed webhook data:', JSON.stringify(parsedData, null, 2));

      // Extract errors from either camelCase or snake_case field
      const errors = parsedData.errorsAndCorrections || parsedData.errors_and_corrections;
      
      // Extract image dimensions if provided
      const imageDimensions = parsedData.image_dimensions;
      
      if (imageDimensions) {
        console.log('Original image dimensions from Gemini:', imageDimensions);
        // Update image record with original dimensions
        await imageApi.updateImageDimensions(imageId, imageDimensions.width, imageDimensions.height);
      }

      if (errors && Array.isArray(errors)) {
        const errorRecords: Omit<ImageError, 'id' | 'created_at'>[] = errors.map((error: WebhookErrorData) => {
          // Get coordinates from either 'Coordinates' or 'coordinates' field
          const coordField = error.Coordinates || error.coordinates;
          
          console.log('Processing error:', error.error_id, 'coordField:', coordField);
          
          let coords: { x: number; y: number; width?: number; height?: number };
          
          // Handle different coordinate formats
          if (Array.isArray(coordField) && coordField.length === 4) {
            // Normalized format: [y1, x1, y2, x2] (fractions 0-1)
            // Convert to pixel coordinates using image dimensions
            const [y1, x1, y2, x2] = coordField.map(Number);
            const imgWidth = imageDimensions?.width || 1920;
            const imgHeight = imageDimensions?.height || 1080;
            
            coords = {
              x: x1 * imgWidth,
              y: y1 * imgHeight,
              width: (x2 - x1) * imgWidth,
              height: (y2 - y1) * imgHeight
            };
            
            console.log('Converted normalized coords:', {
              normalized: coordField,
              imageDims: { width: imgWidth, height: imgHeight },
              pixels: coords
            });
          } else if (typeof coordField === 'string') {
            // String format: "x: 295, y: 126, width: 440, height: 10"
            coords = parseCoordinates(coordField);
          } else if (coordField && typeof coordField === 'object') {
            // Object format: { x: 295, y: 126, width: 440, height: 10 }
            coords = coordField as { x: number; y: number; width?: number; height?: number };
          } else {
            // Fallback
            coords = { x: 0, y: 0, width: 0, height: 0 };
          }
          
          console.log('Final parsed coordinates:', coords);
          
          return {
            image_id: imageId,
            error_type: mapErrorType(error.error_type),
            x_coordinate: coords.x,
            y_coordinate: coords.y,
            width: coords.width || null,
            height: coords.height || null,
            original_text: error.found_text || null,
            suggested_correction: error.corrected_text || null,
            description: error.issue_description || null,
          };
        });

        console.log('Error records to save:', errorRecords);

        await errorApi.createErrors(errorRecords);
        await imageApi.updateImageStatus(imageId, 'completed', parsedData as unknown as Record<string, unknown>);
        
        console.log('Analysis completed successfully. Errors saved:', errorRecords.length);
      } else {
        console.warn('No errors found in webhook response');
        await imageApi.updateImageStatus(imageId, 'completed', parsedData as unknown as Record<string, unknown>);
      }
    } catch (error) {
      console.error('Webhook error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Fallback to mock data if webhook fails
      console.warn('Webhook failed. Using mock data for demonstration.');
      await this.processMockAnalysis(imageId);
    }
  },

  async processMockAnalysis(imageId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockErrors: Omit<ImageError, 'id' | 'created_at'>[] = [
      {
        image_id: imageId,
        error_type: 'spelling',
        x_coordinate: 25,
        y_coordinate: 30,
        width: 80,
        height: 20,
        original_text: 'recieve',
        suggested_correction: 'receive',
        description: 'Common spelling mistake: "i before e except after c"'
      },
      {
        image_id: imageId,
        error_type: 'grammatical',
        x_coordinate: 45,
        y_coordinate: 50,
        width: 120,
        height: 20,
        original_text: 'They was going',
        suggested_correction: 'They were going',
        description: 'Subject-verb agreement error'
      },
      {
        image_id: imageId,
        error_type: 'space',
        x_coordinate: 65,
        y_coordinate: 40,
        width: 60,
        height: 20,
        original_text: 'alot',
        suggested_correction: 'a lot',
        description: 'Missing space between words'
      },
      {
        image_id: imageId,
        error_type: 'context',
        x_coordinate: 35,
        y_coordinate: 70,
        width: 70,
        height: 20,
        original_text: 'their',
        suggested_correction: 'there',
        description: 'Incorrect word usage in context'
      },
      {
        image_id: imageId,
        error_type: 'suggestions',
        x_coordinate: 55,
        y_coordinate: 60,
        width: 90,
        height: 20,
        original_text: 'good',
        suggested_correction: 'excellent',
        description: 'Consider using a stronger word for emphasis'
      }
    ];

    await errorApi.createErrors(mockErrors);
    await imageApi.updateImageStatus(imageId, 'completed', {
      mock: true,
      message: 'Mock analysis completed'
    });
  }
};
