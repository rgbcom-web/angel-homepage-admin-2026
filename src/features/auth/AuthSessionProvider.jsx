'use client';

import { createContext, use } from 'react';
import { SessionProvider } from 'next-auth/react';
import { SessionCheck } from '@/features/auth/checkSessionClient';

const AuthContext = createContext({});

export function AuthContextProvider({ session, children }) {
  return (
    <SessionProvider session={session}>
      <AuthContext value={{ session, user: session?.user }}>
        <SessionCheck />
        {children}
      </AuthContext>
    </SessionProvider>
  );
}

export function useAuth() {
  return use(AuthContext);
}
