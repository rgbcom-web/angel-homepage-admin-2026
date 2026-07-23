import { authConfig } from '@/features/auth/auth.config';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { SidebarProvider } from '@/shared/shadcn/components/ui/sidebar';
import { SideNavBar } from '@/features/side-navbar/side-navbar';

export default async function Layout({ children }) {
  const session = await getServerSession(authConfig);
  const user = session?.user;

  if (!user) {
    redirect('/logIn');
  }

  return (
    <>
      <SidebarProvider>
        <SideNavBar />
        {children}
      </SidebarProvider>
    </>
  );
}
