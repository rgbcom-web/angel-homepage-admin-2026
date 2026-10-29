import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { BCI_DB_SCHEMA, requireBciEnv } from './bci-config';

/**
 * 뇌-AI-로봇 연동시스템 개발 자문단 전용 Supabase (서버)
 * 설정·주의사항은 bci-config.js 주석 참고.
 *
 * 기존 프로젝트와 같은 DB 를 쓰므로 db.schema 로 BCI 스키마를 고정합니다.
 * 이게 빠지면 service_role 키가 public 스키마의 소아 자문단 테이블을 그대로 읽고 씁니다.
 */

async function cookieAdapter() {
  const cookieStore = await cookies();

  return {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      try {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      } catch (error) {
        // The `set` method was called from a Server Component.
      }
    },
  };
}

function bciUrl() {
  return requireBciEnv('BCI_SUPABASE_URL', process.env.BCI_SUPABASE_URL);
}

async function bciOptions() {
  return {
    cookies: await cookieAdapter(),
    db: { schema: BCI_DB_SCHEMA },
  };
}

export const createBciClient = async () => {
  return createServerClient(
    bciUrl(),
    requireBciEnv('BCI_SUPABASE_ANON_KEY', process.env.BCI_SUPABASE_ANON_KEY),
    await bciOptions(),
  );
};

export const createBciAdminClient = async () => {
  return createServerClient(
    bciUrl(),
    requireBciEnv('BCI_SUPABASE_SERVICE_ROLE_KEY', process.env.BCI_SUPABASE_SERVICE_ROLE_KEY),
    await bciOptions(),
  );
};
