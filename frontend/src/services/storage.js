import { supabase } from '../lib/supabase';

export const storageService = {
  /**
   * Upload a file to a specific Supabase storage bucket
   * @param {File} file - The file object to upload
   * @param {string} bucket - The name of the bucket ('products', 'users', 'brands', 'categories', 'banners', 'documents')
   * @param {string} path - Custom file path inside the bucket (optional)
   */
  async uploadToSupabase(file, bucket, path = '') {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = path ? `${path}/${fileName}` : fileName;

      // Check and create bucket dynamically if needed or assume predefined
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;
      
      const publicUrl = this.getPublicUrl(bucket, data.path);
      return { path: data.path, url: publicUrl };
    } catch (err) {
      console.error(`Error uploading to Supabase Storage (${bucket}):`, err.message);
      throw err;
    }
  },

  /**
   * Retrieve the public URL for a file in a bucket
   * @param {string} bucket 
   * @param {string} path 
   */
  getPublicUrl(bucket, path) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Delete a file from a storage bucket
   * @param {string} bucket 
   * @param {string} path 
   */
  async deleteFile(bucket, path) {
    const { data, error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
    return data;
  }
};
