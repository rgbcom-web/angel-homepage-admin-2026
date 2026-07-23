-- 자문단 자료실 (파일 필드 포함)
-- Supabase SQL Editor에서 실행하세요.

create table if not exists public.advisory_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  is_notice boolean default false,
  show_in_notice boolean default false,
  views integer default 0,
  file_path text default '',
  file_name text default '',
  file_type text default 'pdf',
  created_at timestamptz default now()
);

alter table public.advisory_resources
  add column if not exists file_path text default '',
  add column if not exists file_name text default '',
  add column if not exists file_type text default 'pdf',
  add column if not exists views integer default 0,
  add column if not exists is_notice boolean default false,
  add column if not exists show_in_notice boolean default false;
