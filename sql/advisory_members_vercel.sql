-- 자문단 회원 — Vercel/운영용 (로컬 파일 제거 대응)
-- Supabase SQL Editor에서 실행하세요.

alter table public.advisory_members
  add column if not exists birth_date text,
  add column if not exists address_detail text default '',
  add column if not exists zip_code text default '',
  add column if not exists admin_memo text default '',
  add column if not exists admin_memo_updated_at timestamptz,
  add column if not exists admin_memo_updated_by text,
  add column if not exists last_login_at timestamptz,
  add column if not exists password_reset_token_hash text,
  add column if not exists password_reset_expires_at timestamptz;

alter table public.advisory_members drop constraint if exists advisory_members_status_check;
alter table public.advisory_members
  add constraint advisory_members_status_check
  check (status in ('pending', 'approved', 'rejected', 'inactive'));

create index if not exists advisory_members_password_reset_token_hash_idx
  on public.advisory_members (password_reset_token_hash)
  where password_reset_token_hash is not null;
