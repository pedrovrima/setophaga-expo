import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://efrnpjtbfrzcbvyenvrv.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmcm5wanRiZnJ6Y2J2eWVudnJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ0ODUxMTUsImV4cCI6MjAzMDA2MTExNX0.bxR2hDui1eQXczqSw37Rm-ZUhuvlFLq6BmGQ1k3qGkU';

let async;
if (typeof window !== 'undefined') {
  async = AsyncStorage; // browser code
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: async,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
