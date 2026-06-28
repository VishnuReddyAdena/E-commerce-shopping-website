import { supabase } from '../config/supabase.js';

export const storageService = {
  /**
   * Upload a file buffer to Supabase Storage
   * @param {Buffer} fileBuffer - File content in buffer format
   * @param {string} bucket - Target bucket name ('products', 'users', 'brands', 'categories', 'banners', 'documents')
   * @param {string} filename - Filename with extension
   * @param {string} mimeType - The mime type of the file (e.g. 'image/jpeg')
   * @param {string} folderPath - Subfolder path inside the bucket (optional)
   */
  async uploadToSupabase(fileBuffer, bucket, filename, mimeType, folderPath = '') {
    try {
      const cleanFilename = `${Date.now()}_${filename.replace(/\s+/g, '_')}`;
      const filePath = folderPath ? `${folderPath}/${cleanFilename}` : cleanFilename;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileBuffer, {
          contentType: mimeType,
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const publicUrl = this.getPublicUrl(bucket, data.path);
      return { path: data.path, url: publicUrl };
    } catch (err) {
      console.error(`Backend storage upload error for bucket ${bucket}:`, err.message);
      throw err;
    }
  },

  /**
   * Get the public URL of a file
   * @param {string} bucket 
   * @param {string} path 
   */
  getPublicUrl(bucket, path) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Delete a file from a bucket
   * @param {string} bucket 
   * @param {string} path 
   */
  async deleteFile(bucket, path) {
    const { data, error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
    return data;
  }
};
