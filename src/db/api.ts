import { supabase } from './supabase';
import type { Profile, Image, ImageError, ImageWithErrors } from '@/types/types';

export const profileApi = {
  async getCurrentProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Profile not found');
    return data;
  },

  async getAllProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }
};

export const imageApi = {
  async uploadImage(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('app-7dzvb2e20qgx_images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('app-7dzvb2e20qgx_images')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  async createImage(imageData: {
    user_id: string;
    original_url: string;
    filename: string;
  }): Promise<Image> {
    const { data, error } = await supabase
      .from('images')
      .insert({
        ...imageData,
        status: 'pending'
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create image record');
    return data;
  },

  async getUserImages(userId: string): Promise<Image[]> {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getImageById(imageId: string): Promise<ImageWithErrors | null> {
    const { data: image, error: imageError } = await supabase
      .from('images')
      .select('*')
      .eq('id', imageId)
      .maybeSingle();

    if (imageError) throw imageError;
    if (!image) return null;

    const { data: errors, error: errorsError } = await supabase
      .from('errors')
      .select('*')
      .eq('image_id', imageId)
      .order('created_at', { ascending: true });

    if (errorsError) throw errorsError;

    return {
      ...image,
      errors: Array.isArray(errors) ? errors : []
    };
  },

  async updateImageStatus(
    imageId: string,
    status: Image['status'],
    webhookResponse?: Record<string, unknown>
  ): Promise<Image> {
    const updates: Partial<Image> = { status };
    if (webhookResponse) {
      updates.webhook_response = webhookResponse;
    }

    const { data, error } = await supabase
      .from('images')
      .update(updates)
      .eq('id', imageId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Image not found');
    return data;
  },

  async updateImageDimensions(
    imageId: string,
    width: number,
    height: number
  ): Promise<Image> {
    const { data, error } = await supabase
      .from('images')
      .update({
        original_width: width,
        original_height: height
      })
      .eq('id', imageId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Image not found');
    return data;
  },

  async deleteImage(imageId: string): Promise<void> {
    const { error } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId);

    if (error) throw error;
  }
};

export const errorApi = {
  async createErrors(errors: Omit<ImageError, 'id' | 'created_at'>[]): Promise<ImageError[]> {
    const { data, error } = await supabase
      .from('errors')
      .insert(errors)
      .select();

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getErrorsByImageId(imageId: string): Promise<ImageError[]> {
    const { data, error } = await supabase
      .from('errors')
      .select('*')
      .eq('image_id', imageId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }
};

export const sessionApi = {
  async createSession(userId: string): Promise<string> {
    const deviceInfo = navigator.userAgent;
    const userAgent = navigator.userAgent;
    
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        device_info: deviceInfo,
        user_agent: userAgent,
        last_activity: new Date().toISOString(),
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create session');
    
    // Store session ID in localStorage
    localStorage.setItem('session_id', data.id);
    return data.id;
  },

  async updateSessionActivity(sessionId: string): Promise<void> {
    const { error } = await supabase.rpc('update_session_activity', {
      session_id: sessionId
    });

    if (error) throw error;
  },

  async deleteSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
    localStorage.removeItem('session_id');
  },

  async deleteAllUserSessions(userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    localStorage.removeItem('session_id');
  },

  async getActiveSessionsCount() {
    const { data, error } = await supabase.rpc('get_active_sessions_count');

    if (error) throw error;
    return data && data.length > 0 ? data[0] : { total_active_users: 0, total_active_sessions: 0 };
  },

  async getUserSessionsAdmin() {
    const { data, error } = await supabase.rpc('get_user_sessions_admin');

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async cleanupExpiredSessions(): Promise<void> {
    const { error } = await supabase.rpc('cleanup_expired_sessions');

    if (error) throw error;
  }
};
