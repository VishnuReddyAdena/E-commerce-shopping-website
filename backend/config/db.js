import { supabase } from './supabase.js';

const connectDB = async () => {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase environment variables are missing.');
    }
    
    // Quick validation check to confirm Supabase connectivity
    const { error } = await supabase.from('products').select('id').limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('Supabase Postgres Connected Successfully');
    global.isDbConnected = true;
  } catch (error) {
    console.error(`Supabase Connection Error: ${error.message}`);
    console.warn(`[Failover] Server proceeding in Sandbox Mode using local memory arrays.`);
    global.isDbConnected = false;
  }
};

export default connectDB;
