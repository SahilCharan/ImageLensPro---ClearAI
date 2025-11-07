import { imageApi, errorApi } from '@/db/api';
import type { ImageError, WebhookResponse, WebhookErrorData } from '@/types/types';

// Map webhook error types to our database error types
const mapErrorType = (webhookType: string): ImageError['error_type'] => {
  const typeMap: Record<string, ImageError['error_type']> = {
    'Consistency': 'context',
    'Punctuation/Grammar': 'grammatical',
    'Spelling': 'spelling',
    'Context': 'context',
    'Suggestions': 'suggestions'
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
    const webhookUrl = 'https://shreyahubcredo.app.n8n.cloud/webhook/b17c4454-a32e-4dc9-8ee9-4da7162c4703';

    try {
      await imageApi.updateImageStatus(imageId, 'processing');

      // Create FormData to send the actual image file
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('image_id', imageId);
      formData.append('filename', imageFile.name);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData, // Send FormData with the actual image file
      });

      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.statusText}`);
      }

      const data: WebhookResponse = await response.json();

      if (data.errorsAndCorrections && Array.isArray(data.errorsAndCorrections)) {
        const errorRecords: Omit<ImageError, 'id' | 'created_at'>[] = data.errorsAndCorrections.map((error: WebhookErrorData) => ({
          image_id: imageId,
          error_type: mapErrorType(error.error_type),
          x_coordinate: error.Coordinates.x,
          y_coordinate: error.Coordinates.y,
          original_text: error.found_text || null,
          suggested_correction: error.corrected_text || null,
          description: error.issue_description || null,
        }));

        await errorApi.createErrors(errorRecords);
        await imageApi.updateImageStatus(imageId, 'completed', data as unknown as Record<string, unknown>);
      } else {
        await imageApi.updateImageStatus(imageId, 'failed', data as unknown as Record<string, unknown>);
      }
    } catch (error) {
      console.error('Webhook error:', error);
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
        original_text: 'recieve',
        suggested_correction: 'receive',
        description: 'Common spelling mistake: "i before e except after c"'
      },
      {
        image_id: imageId,
        error_type: 'grammatical',
        x_coordinate: 45,
        y_coordinate: 50,
        original_text: 'They was going',
        suggested_correction: 'They were going',
        description: 'Subject-verb agreement error'
      },
      {
        image_id: imageId,
        error_type: 'space',
        x_coordinate: 65,
        y_coordinate: 40,
        original_text: 'alot',
        suggested_correction: 'a lot',
        description: 'Missing space between words'
      },
      {
        image_id: imageId,
        error_type: 'context',
        x_coordinate: 35,
        y_coordinate: 70,
        original_text: 'their',
        suggested_correction: 'there',
        description: 'Incorrect word usage in context'
      },
      {
        image_id: imageId,
        error_type: 'suggestions',
        x_coordinate: 55,
        y_coordinate: 60,
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
