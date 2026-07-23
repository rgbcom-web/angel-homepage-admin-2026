import { authConfig } from '@/features/auth/auth.config';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export async function checkSession({ permission, redirectUrl } = {}) {
  const session = await getServerSession(authConfig);
  const user = session?.user;

  if (!user) {
    redirect('/logIn');
  }

  if (!permission) {
    return { user };
  }

  const isAllowed = user?.superAdmin || (permission && permission(user));

  if (!isAllowed) {
    if (redirectUrl) {
      redirect(redirectUrl);
    }
    return { isAllowed: false, user };
  }

  return { isAllowed: true, user };
}
