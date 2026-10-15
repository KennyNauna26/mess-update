import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/AuthContext';
import { queryKeys } from '@/lib/queryClient';
import { getProfile } from '@/services/profile';

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.profile(user?.id ?? ''),
    queryFn: () => getProfile(user?.id as string),
    enabled: Boolean(user?.id),
  });
}
