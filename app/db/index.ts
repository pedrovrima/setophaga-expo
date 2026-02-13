import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

let async;
if (typeof window !== 'undefined') {
  async = AsyncStorage; // browser code
}

// Create Supabase client (used for auth only)
// Guard against missing env vars during static rendering
export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        storage: async,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : (null as any);

// Test connection
async function testConnection() {
  try {
    const { data, error } = await supabase.from('birds').select('*').limit(1);
    if (error) throw error;
    console.log('Connection successful:', data);
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

// testConnection();
