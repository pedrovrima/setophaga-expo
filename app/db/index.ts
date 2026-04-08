import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoTrueClient } from '@supabase/auth-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const authUrl = supabaseUrl ? `${supabaseUrl.replace(/\/$/, '')}/auth/v1` : '';
const storageKey = authUrl ? `sb-${new URL(authUrl).hostname.split('.')[0]}-auth-token` : '';
const authStorage = Platform.OS === 'web' ? undefined : AsyncStorage;
export const isSupabaseConfigured = Boolean(authUrl && supabaseKey);

type SupabaseAuthOnlyClient = {
  auth: GoTrueClient | null;
};

// This app only uses Supabase Auth on native. Avoid the full supabase-js client
// because its Realtime dependency pulls in `ws`, which breaks Expo native bundling.
export const supabase: SupabaseAuthOnlyClient =
  isSupabaseConfigured
    ? {
        auth: new GoTrueClient({
          url: authUrl,
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            apikey: supabaseKey,
          },
          storageKey,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
          storage: authStorage,
        }),
      }
    : {
        auth: null,
      };
