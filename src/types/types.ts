export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  device_info: string | null;
  ip_address: string | null;
  user_agent: string | null;
  last_activity: string;
  created_at: string;
  expires_at: string;
}

export interface ActiveSessionsCount {
  total_active_users: number;
  total_active_sessions: number;
}

export interface UserSessionDetail {
  user_id: string;
  user_email: string;
  user_name: string | null;
  active_sessions: number;
  last_activity: string;
}

export interface Image {
  id: string;
  user_id: string;
  original_url: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  webhook_response: Record<string, unknown> | null;
  original_width: number | null;
  original_height: number | null;
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
  error_type: 'Consistency' | 'Punctuation/Grammar' | 'Spelling' | 'Context' | 'Suggestions' | 'Spacing';
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
  errorsAndCorrections?: WebhookErrorData[];
  errors_and_corrections?: WebhookErrorData[]; // Support snake_case from Gemini
  image_dimensions?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  image?: string; // base64 image string if provided
}

// Gemini API response structure
export interface GeminiResponse {
  content?: {
    parts?: Array<{
      text?: string;
    }>;
  };
  // Direct response format
  scale_using_to_giving_cordinates?: string;
  image_dimensions?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  errors_and_corrections?: WebhookErrorData[];
}
