import { imageApi, errorApi } from '@/db/api';
import type { ImageError } from '@/types/types';

interface WebhookErrorData {
  error_type: 'spelling' | 'grammatical' | 'space' | 'context' | 'suggestions';
  x_coordinate: number;
  y_coordinate: number;
  original_text?: string;
  suggested_correction?: string;
  description?: string;
}

interface WebhookResponse {
  success: boolean;
  errors?: WebhookErrorData[];
  message?: string;
}

export const webhookService = {
  async sendImageForAnalysis(imageId: string, imageUrl: string): Promise<void> {
    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

    if (!webhookUrl || webhookUrl === 'https://your-n8n-instance.com/webhook/image-analysis') {
      console.warn('N8N webhook URL not configured. Using mock data for demonstration.');
      await this.processMockAnalysis(imageId);
      return;
    }

    try {
      await imageApi.updateImageStatus(imageId, 'processing');

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_id: imageId,
          image_url: imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.statusText}`);
      }

      const data: WebhookResponse = await response.json();

      if (data.success && data.errors) {
        const errorRecords: Omit<ImageError, 'id' | 'created_at'>[] = data.errors.map(error => ({
          image_id: imageId,
          error_type: error.error_type,
          x_coordinate: error.x_coordinate,
          y_coordinate: error.y_coordinate,
          original_text: error.original_text || null,
          suggested_correction: error.suggested_correction || null,
          description: error.description || null,
        }));

        await errorApi.createErrors(errorRecords);
        await imageApi.updateImageStatus(imageId, 'completed', data as unknown as Record<string, unknown>);
      } else {
        await imageApi.updateImageStatus(imageId, 'failed', data as unknown as Record<string, unknown>);
      }
    } catch (error) {
      console.error('Webhook error:', error);
      await imageApi.updateImageStatus(imageId, 'failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
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
