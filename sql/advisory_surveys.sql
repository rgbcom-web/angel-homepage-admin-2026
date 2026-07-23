-- 자문단 설문 (포털 /pediatric/surveys + 관리자 /pediatric/boards/surveys)
-- 구글폼 URL 연결 방식 (인앱 문항/응답 미사용)
-- Supabase SQL Editor에서 실행하세요.

create table if not exists public.advisory_surveys (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  start_date date not null,
  end_date date not null,
  google_form_url text default '',
  show_in_notice boolean default false,
  is_notice boolean default false,
  views integer default 0,
  questions jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 기존 테이블 마이그레이션
alter table public.advisory_surveys
  add column if not exists questions jsonb not null default '[]'::jsonb;

alter table public.advisory_surveys
  add column if not exists google_form_url text default '';

create index if not exists advisory_surveys_start_date_idx
  on public.advisory_surveys (start_date desc);

-- (레거시) 인앱 설문 응답 — 신규 구글폼 방식에서는 사용하지 않음
create table if not exists public.advisory_survey_responses (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.advisory_surveys(id) on delete cascade,
  member_id text not null,
  member_login_id text default '',
  member_name text default '',
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  unique (survey_id, member_id)
);

create index if not exists advisory_survey_responses_survey_id_idx
  on public.advisory_survey_responses (survey_id);
