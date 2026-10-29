'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from './AuthSessionProvider';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

/**
 * useAuth·useRouter 를 호출하므로 훅 규칙상 이름이 use 로 시작해야 합니다.
 * (react-hooks/rules-of-hooks)
 */
export function useCheckSessionClient({ permission, redirectUrl } = {}) {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return { isAllowed: false, user: null };
  }

  if (!permission) {
    return { user };
  }

  const isAllowed = user?.superAdmin || permission(user);

  if (!isAllowed) {
    if (redirectUrl) {
      router.push(redirectUrl);
    }
    return { isAllowed: false, user };
  }

  return { isAllowed: true, user };
}

export function SessionCheck() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/logIn');
    }
  }, [status, router]);

  return null;
}
