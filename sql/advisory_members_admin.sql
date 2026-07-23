-- 자문단 회원관리 확장 (시안: 비활성 / 관리자 메모 / 콘텐츠 조회 로그)
-- Supabase SQL Editor에서 실행하세요.

-- 상태: pending | approved | rejected | inactive
alter table public.advisory_members drop constraint if exists advisory_members_status_check;
alter table public.advisory_members
  add constraint advisory_members_status_check
  check (status in ('pending', 'approved', 'rejected', 'inactive'));

alter table public.advisory_members
  add column if not exists birth_date text,
  add column if not exists admin_memo text default '',
  add column if not exists admin_memo_updated_at timestamptz,
  add column if not exists admin_memo_updated_by text,
  add column if not exists last_login_at timestamptz;

-- 자료실/행사 열람 로그 (최근 30일 활동용)
create table if not exists public.advisory_member_views (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.advisory_members(id) on delete cascade,
  content_type text not null check (content_type in ('resource', 'event')),
  content_id uuid,
  viewed_at timestamptz not null default now()
);

create index if not exists advisory_member_views_member_id_idx
  on public.advisory_member_views (member_id);

create index if not exists advisory_member_views_viewed_at_idx
  on public.advisory_member_views (viewed_at desc);

create index if not exists advisory_member_views_type_idx
  on public.advisory_member_views (member_id, content_type, viewed_at desc);
