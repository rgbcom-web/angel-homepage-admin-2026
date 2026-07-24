-- 자문단 행사 (포털 /pediatric/events + 관리자 /pediatric/boards/events)
-- Supabase SQL Editor에서 실행하세요.

create table if not exists public.advisory_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text default '',
  category text not null,              -- 최대 3글자 (학회/워크샵/행사)
  location text not null,
  description text default '',
  start_date date not null,
  end_date date not null,
  year integer not null,
  show_in_notice boolean default false,
  is_notice boolean default false,
  views integer default 0,
  created_at timestamptz default now()
);

-- 행사 상세에 바로 노출할 이미지 첨부 ([{ path, name, url }])
alter table public.advisory_events
  add column if not exists images jsonb default '[]'::jsonb;

create index if not exists advisory_events_start_date_idx
  on public.advisory_events (start_date desc);
