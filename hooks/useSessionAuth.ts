import { useState, useEffect, useRef } from 'react';
import type { Session } from '@supabase/auth-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSupabaseConfigured, supabase } from '~/app/db';

export default function useSessionAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const resolved = useRef(false);

  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured || !supabase.auth) {
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    const resolve = (newSession: Session | null) => {
      if (!mounted) return;
      setSession(newSession);
      if (!resolved.current) {
        resolved.current = true;
        setLoading(false);
      }
    };

    // Try cached session first for fast initial render
    AsyncStorage.getItem('session')
      .then((data) => {
        if (data) {
          resolve(JSON.parse(data));
        }
      })
      .catch(console.error);

    // Then get fresh session from Supabase
    supabase.auth
      .getSession()
      .then(({ data: { session: freshSession } }) => {
        resolve(freshSession);
        AsyncStorage.setItem('session', JSON.stringify(freshSession));
      })
      .catch((error) => {
        console.error(error);
        if (!resolved.current) {
          resolved.current = true;
          if (mounted) setLoading(false);
        }
      });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (mounted) {
        setSession(currentSession);
        if (currentSession) {
          AsyncStorage.setItem('session', JSON.stringify(currentSession));
        } else {
          AsyncStorage.removeItem('session');
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}
