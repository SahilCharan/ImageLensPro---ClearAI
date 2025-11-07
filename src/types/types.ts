export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface Image {
  id: string;
  user_id: string;
  original_url: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  webhook_response: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ImageError {
  id: string;
  image_id: string;
  error_type: 'spelling' | 'grammatical' | 'space' | 'context' | 'suggestions';
  x_coordinate: number;
  y_coordinate: number;
  width: number | null;
  height: number | null;
  original_text: string | null;
  suggested_correction: string | null;
  description: string | null;
  created_at: string;
}

export interface ImageWithErrors extends Image {
  errors?: ImageError[];
}

// Webhook data structure from n8n
export interface WebhookErrorData {
  error_id: string | number;
  found_text: string;
  error_type: 'Consistency' | 'Punctuation/Grammar' | 'Spelling' | 'Context' | 'Suggestions';
  issue_description: string;
  corrected_text: string;
  // Support both uppercase and lowercase field names
  Coordinates?: string | {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  coordinates?: string | {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence?: string;
}

export interface WebhookResponse {
  errorsAndCorrections: WebhookErrorData[];
  image?: string; // base64 image string if provided
}
