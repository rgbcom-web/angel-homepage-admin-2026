-- 자문단 접속 로그 (관리자 대시보드 통계용)
-- Supabase SQL Editor에서 실행하세요.

alter table public.advisory_members
  add column if not exists last_login_at timestamptz;

create table if not exists public.advisory_login_logs (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.advisory_members(id) on delete cascade,
  logged_in_at timestamptz not null default now()
);

create index if not exists advisory_login_logs_logged_in_at_idx
  on public.advisory_login_logs (logged_in_at desc);

create index if not exists advisory_login_logs_member_id_idx
  on public.advisory_login_logs (member_id);
