import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

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
