import { pretendard } from '@/fonts';
import './globals.css';
import { Toaster } from '@/shared/shadcn/components/ui/sonner';

import { getServerSession } from 'next-auth';
import { authConfig } from '@/features/auth/auth.config';
import { AuthContextProvider } from '@/features/auth/AuthSessionProvider';

export const metadata = {
  title: 'Admin 엔젤로보틱스',
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authConfig);

  return (
    <html lang="ko">
      <body className={`${pretendard.variable}`}>
        <AuthContextProvider session={session}>{children}</AuthContextProvider>
        <Toaster />
      </body>
    </html>
  );
}
