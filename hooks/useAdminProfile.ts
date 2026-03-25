import { useQuery } from '@tanstack/react-query';
import useSessionAuth from './useSessionAuth';
import type { Profile } from '~/db';

export default function useAdminProfile() {
  const { session, loading: sessionLoading } = useSessionAuth();
  const userId = session?.user?.id;

  const profileQuery = useQuery<Profile>({
    queryKey: ['admin-profile', userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await fetch(`/admin/profile?userId=${userId}`);
      if (!res.ok) throw new Error('Erro ao buscar perfil');
      return res.json();
    },
  });

  const role = profileQuery.data?.role;

  return {
    session,
    profile: profileQuery.data,
    isAdmin: role === 'admin' || role === 'super_admin',
    isSuperAdmin: role === 'super_admin',
    loading: sessionLoading || profileQuery.isLoading,
  };
}
