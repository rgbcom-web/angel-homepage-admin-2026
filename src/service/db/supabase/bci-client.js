import { createBrowserClient } from '@supabase/ssr';
import { BCI_DB_SCHEMA, requireBciEnv } from './bci-config';

/**
 * 뇌-AI-로봇 연동시스템 개발 자문단 전용 Supabase (브라우저)
 *
 * 관리자 첨부 업로드(서버가 발급한 signed upload URL 사용)와
 * CKEditor 본문 이미지 업로드가 브라우저에서 직접 스토리지에 씁니다.
 *
 * 기존 프로젝트와 같은 DB 를 쓰므로 db.schema 로 BCI 스키마를 고정합니다.
 * 이게 빠지면 같은 쿼리가 public 스키마의 소아 자문단 테이블로 갑니다.
 */
export function createBciBrowserClient() {
  const url = requireBciEnv(
    'NEXT_PUBLIC_BCI_SUPABASE_URL',
    process.env.NEXT_PUBLIC_BCI_SUPABASE_URL,
  );
  const key = requireBciEnv(
    'NEXT_PUBLIC_BCI_SUPABASE_ANON_KEY',
    process.env.NEXT_PUBLIC_BCI_SUPABASE_ANON_KEY,
  );
  return createBrowserClient(url, key, { db: { schema: BCI_DB_SCHEMA } });
}
