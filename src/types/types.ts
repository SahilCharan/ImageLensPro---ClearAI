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
  original_text: string | null;
  suggested_correction: string | null;
  description: string | null;
  created_at: string;
}

export interface ImageWithErrors extends Image {
  errors?: ImageError[];
}
