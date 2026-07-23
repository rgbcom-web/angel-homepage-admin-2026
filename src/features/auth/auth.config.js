import Credentials from 'next-auth/providers/credentials';
import { createAdminClient } from '@/service/db/supabase/server';
import bcrypt from 'bcrypt';

export const authConfig = {
  site: process.env.NEXTAUTH_URL,
  secret: process.env.NEXTAUTH_SECRET_KEY,
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 2, // 2시간
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const { id, password: passwordInput } = credentials;

        try {
          const supa = await createAdminClient();
          const { data: user, error } = await supa
            .from('admin')
            .select('id, name, password, super_admin')
            .eq('id', id)
            .single();

          if (!user) {
            throw new Error('해당 정보로 로그인할 수 없습니다.');
          }

          const { password: passwordDB, ...userInfo } = user;

          const isValid = await bcrypt.compare(passwordInput, passwordDB);

          if (!isValid) {
            throw new Error('해당 정보로 로그인할 수 없습니다.');
          }

          return userInfo;
        } catch (error) {
          console.log(error);
          throw new Error('해당 정보로 로그인할 수 없습니다.');
        }
      },
    }),
  ],
  pages: {
    signIn: '/logIn',
    error: '/logIn',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = token.user;
      }
      return session;
    },
  },
  events: {
    async signOut() {
      // 세션 만료시 실행
      if (typeof window !== 'undefined') {
        window.location.href = '/logIn';
      }
    },
  },
};
