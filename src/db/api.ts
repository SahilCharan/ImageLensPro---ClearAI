import { supabase } from './supabase';
import type { Profile, Image, ImageError, ImageWithErrors, AccountRequest, PasswordResetRequest } from '@/types/types';

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

export const accountRequestApi = {
  async createAccountRequest(requestData: {
    full_name: string;
    email: string;
    message?: string;
  }): Promise<AccountRequest> {
    console.log('[API] Creating account request with data:', {
      full_name: requestData.full_name,
      email: requestData.email,
      has_message: !!requestData.message
    });

    try {
      const insertData = {
        full_name: requestData.full_name,
        email: requestData.email,
        password_hash: null, // Password will be generated by admin upon approval
        message: requestData.message || null,
        status: 'pending' as const
      };

      console.log('[API] Inserting data into account_requests table...');
      
      const { data, error } = await supabase
        .from('account_requests')
        .insert(insertData)
        .select()
        .maybeSingle();

      console.log('[API] Supabase response:', { data, error });

      if (error) {
        console.error('[API] Supabase error:', error);
        throw error;
      }
      
      if (!data) {
        console.error('[API] No data returned from insert');
        throw new Error('Failed to create account request');
      }
      
      console.log('[API] Account request created successfully:', data);
      return data;
    } catch (err) {
      console.error('[API] Exception in createAccountRequest:', err);
      throw err;
    }
  },

  async getAllAccountRequests(): Promise<AccountRequest[]> {
    const { data, error } = await supabase
      .from('account_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getPendingAccountRequests(): Promise<AccountRequest[]> {
    const { data, error } = await supabase
      .from('account_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async approveAccountRequest(requestId: string, generatedPassword: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get the request details
    const { data: request, error: fetchError } = await supabase
      .from('account_requests')
      .select('*')
      .eq('id', requestId)
      .eq('status', 'pending')
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!request) throw new Error('Account request not found or already processed');

    // Create the user account using Supabase Admin API with generated password
    const { data: newUser, error: signUpError } = await supabase.auth.admin.createUser({
      email: request.email,
      password: generatedPassword,
      email_confirm: true,
      user_metadata: {
        full_name: request.full_name
      }
    });

    if (signUpError) throw signUpError;
    if (!newUser.user) throw new Error('Failed to create user');

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newUser.user.id,
        email: request.email,
        full_name: request.full_name,
        role: 'user',
        approval_status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString()
      });

    if (profileError) throw profileError;

    // Update request status
    const { error: updateError } = await supabase
      .from('account_requests')
      .update({
        status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) throw updateError;
  },

  async rejectAccountRequest(requestId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('account_requests')
      .update({
        status: 'rejected',
        approved_by: user.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .eq('status', 'pending');

    if (error) throw error;
  },

  async deleteAccountRequest(requestId: string): Promise<void> {
    const { error } = await supabase
      .from('account_requests')
      .delete()
      .eq('id', requestId);

    if (error) throw error;
  }
};

export const passwordResetApi = {
  async checkEmailExists(email: string): Promise<{ exists: boolean; user?: Profile }> {
    const { data, error } = await supabase
      .rpc('get_user_by_email', { user_email: email });

    if (error) throw error;
    
    if (data && data.length > 0) {
      return { exists: true, user: data[0] };
    }
    
    return { exists: false };
  },

  async createPasswordResetRequest(email: string, userId: string): Promise<PasswordResetRequest> {
    const { data, error } = await supabase
      .from('password_reset_requests')
      .insert({
        email,
        user_id: userId,
        status: 'pending'
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to create password reset request');
    
    return data;
  },

  async getAllPasswordResetRequests(): Promise<PasswordResetRequest[]> {
    const { data, error } = await supabase
      .from('password_reset_requests')
      .select('*')
      .order('requested_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getPendingPasswordResetRequests(): Promise<PasswordResetRequest[]> {
    const { data, error } = await supabase
      .from('password_reset_requests')
      .select('*')
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async approvePasswordResetRequest(requestId: string, newPassword: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get the request details
    const { data: request, error: fetchError } = await supabase
      .from('password_reset_requests')
      .select('*')
      .eq('id', requestId)
      .eq('status', 'pending')
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!request) throw new Error('Password reset request not found or already processed');
    if (!request.user_id) throw new Error('User ID not found in request');

    // Update user password using admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      request.user_id,
      { password: newPassword }
    );

    if (updateError) throw updateError;

    // Update request status
    const { error: statusError } = await supabase
      .from('password_reset_requests')
      .update({
        status: 'approved',
        processed_by: user.id,
        processed_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (statusError) throw statusError;
  },

  async rejectPasswordResetRequest(requestId: string, notes?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('password_reset_requests')
      .update({
        status: 'rejected',
        processed_by: user.id,
        processed_at: new Date().toISOString(),
        notes: notes || null
      })
      .eq('id', requestId)
      .eq('status', 'pending');

    if (error) throw error;
  },

  async deletePasswordResetRequest(requestId: string): Promise<void> {
    const { error } = await supabase
      .from('password_reset_requests')
      .delete()
      .eq('id', requestId);

    if (error) throw error;
  }
};
