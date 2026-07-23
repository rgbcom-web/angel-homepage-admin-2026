import { authConfig } from '@/features/auth/auth.config';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function PublicLayout({ children }) {
  const session = await getServerSession(authConfig);
  const user = session?.user;

  if (user) {
    redirect('/');
  }

  return <>{children}</>;
}
