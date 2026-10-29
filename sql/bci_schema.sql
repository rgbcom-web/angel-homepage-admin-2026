-- ============================================================================
-- 뇌-AI-로봇 연동시스템 개발 자문단 — `bci` 스키마 초기 스키마
--
-- ⚠️ 실행 위치: **기존(소아 자문단 + 홈페이지) Supabase 프로젝트**의 SQL Editor
--    프로젝트를 새로 만들지 않고, 같은 DB 안의 `bci` 스키마로 분리합니다.
--    (무료 플랜은 조직당 활성 프로젝트가 2개로 제한돼 세 번째 프로젝트는 유료입니다)
--
-- 테이블명은 소아 자문단과 동일하게 advisory_* 를 유지합니다.
-- 스키마가 분리돼 있으므로 public.advisory_* 와 충돌하지 않고,
-- 코드/쿼리를 양쪽에서 그대로 비교할 수 있습니다.
--
-- 애플리케이션은 BCI 전용 클라이언트(src/service/db/supabase/bci-*.js)가
-- db.schema = 'bci' 로 접속하므로, 코드의 테이블명에는 스키마를 쓰지 않습니다.
--
-- 이 스크립트는 레포의 sql/advisory_*.sql 과 애플리케이션 코드에서 역산한 것입니다.
-- advisory_members 는 원본 레포에 create 스크립트가 없어 코드 기준으로 복원했습니다.
-- 운영 DB 접근이 가능하면 아래로 떠서 비교/대체하는 편이 가장 정확합니다.
--   pg_dump "$OLD_DB_URL" --schema-only --no-owner --no-privileges -t 'public.advisory_*'
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. 스키마 · 권한
--    PostgREST(Data API)가 bci 스키마를 보려면 SQL 권한과 대시보드 설정이 둘 다 필요합니다.
--    → Project Settings → Data API → Exposed schemas 에 `bci` 추가 (안 하면 전부 404)
--
--    anon 에도 권한을 주지만 각 테이블에 RLS 를 켜고 정책을 비워 두므로(9번)
--    실제로 읽히는 건 service_role 뿐입니다. 기존 public 스키마와 같은 구조입니다.
--
--    default privileges 는 '이후에 만들어지는' 객체에만 적용되므로
--    테이블 생성 전에 걸어 두고, 재실행 안전을 위해 10번에서 한 번 더 부여합니다.
-- ----------------------------------------------------------------------------
create schema if not exists bci;

grant usage on schema bci to anon, authenticated, service_role;

alter default privileges in schema bci
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema bci
  grant all on sequences to anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 2. 자문단 회원
-- ----------------------------------------------------------------------------
create table if not exists bci.advisory_members (
  id uuid primary key default gen_random_uuid(),

  -- 로그인 (Supabase Auth 미사용 · 자체 인증)
  login_id text not null,
  password_hash text not null,
  email text not null,

  -- 프로필
  name text not null,
  birth_year text default '',
  birth_date text,
  phone text default '',
  affiliation text default '',          -- 소속
  department text default '',           -- 진료과/부서
  title text default '',                -- 직위
  address text default '',
  address_detail text default '',
  zip_code text default '',

  -- 승인 상태
  status text not null default 'pending',

  -- 운영
  created_at timestamptz default now(),
  last_login_at timestamptz,
  admin_memo text default '',
  admin_memo_updated_at timestamptz,
  admin_memo_updated_by text,

  -- 비밀번호 재설정 (메일 링크)
  password_reset_token_hash text,
  password_reset_expires_at timestamptz
);

-- 아이디·이메일 중복 가입 차단 (코드에서도 선검사하지만 DB에서 막아 둡니다)
create unique index if not exists advisory_members_login_id_key
  on bci.advisory_members (login_id);

create unique index if not exists advisory_members_email_key
  on bci.advisory_members (email);

alter table bci.advisory_members drop constraint if exists advisory_members_status_check;
alter table bci.advisory_members
  add constraint advisory_members_status_check
  check (status in ('pending', 'approved', 'rejected', 'inactive'));

create index if not exists advisory_members_status_idx
  on bci.advisory_members (status, created_at desc);

create index if not exists advisory_members_password_reset_token_hash_idx
  on bci.advisory_members (password_reset_token_hash)
  where password_reset_token_hash is not null;

-- ----------------------------------------------------------------------------
-- 3. 자료실 (다중 첨부 · 포털에서는 보안 뷰어로만 열람)
-- ----------------------------------------------------------------------------
create table if not exists bci.advisory_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  is_notice boolean default false,        -- 목록 상단 고정
  show_in_notice boolean default false,   -- 포털 홈 공지 노출
  views integer default 0,

  -- 첫 번째 파일과 동기화되는 하위 호환 컬럼
  file_path text default '',
  file_name text default '',
  file_type text default 'pdf',

  -- 다중 첨부: [{ path, name, type, bucket? }]
  files jsonb default '[]'::jsonb,

  created_at timestamptz default now()
);

create index if not exists advisory_resources_created_at_idx
  on bci.advisory_resources (created_at desc);

-- ----------------------------------------------------------------------------
-- 4. 행사
-- ----------------------------------------------------------------------------
create table if not exists bci.advisory_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text default '',
  category text not null,                 -- 최대 3글자 (학회/워크샵/행사)
  location text not null,
  description text default '',
  start_date date not null,
  end_date date not null,
  year integer not null,
  show_in_notice boolean default false,
  is_notice boolean default false,
  views integer default 0,

  -- 상세에 바로 노출할 첨부: [{ path, name, url }]
  images jsonb default '[]'::jsonb,

  created_at timestamptz default now()
);

create index if not exists advisory_events_start_date_idx
  on bci.advisory_events (start_date desc);

-- ----------------------------------------------------------------------------
-- 5. 설문 (구글폼 URL 연결 방식)
-- ----------------------------------------------------------------------------
create table if not exists bci.advisory_surveys (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  start_date date not null,
  end_date date not null,
  google_form_url text default '',
  show_in_notice boolean default false,
  is_notice boolean default false,
  views integer default 0,
  questions jsonb not null default '[]'::jsonb,   -- (레거시 인앱 문항, 미사용)
  created_at timestamptz default now()
);

create index if not exists advisory_surveys_start_date_idx
  on bci.advisory_surveys (start_date desc);

-- 레거시 인앱 설문 응답 테이블(advisory_survey_responses)은 만들지 않습니다.
-- 현재 코드는 구글폼으로만 동작하며, 해당 테이블을 읽거나 쓰지 않습니다.

-- ----------------------------------------------------------------------------
-- 6. 접속 로그 (관리자 대시보드 통계)
-- ----------------------------------------------------------------------------
create table if not exists bci.advisory_login_logs (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references bci.advisory_members(id) on delete cascade,
  logged_in_at timestamptz not null default now()
);

create index if not exists advisory_login_logs_logged_in_at_idx
  on bci.advisory_login_logs (logged_in_at desc);

create index if not exists advisory_login_logs_member_id_idx
  on bci.advisory_login_logs (member_id);

-- ----------------------------------------------------------------------------
-- 7. 콘텐츠 열람 로그 (최근 30일 활동)
-- ----------------------------------------------------------------------------
create table if not exists bci.advisory_member_views (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references bci.advisory_members(id) on delete cascade,
  content_type text not null check (content_type in ('resource', 'event')),
  content_id uuid,
  viewed_at timestamptz not null default now()
);

create index if not exists advisory_member_views_member_id_idx
  on bci.advisory_member_views (member_id);

create index if not exists advisory_member_views_viewed_at_idx
  on bci.advisory_member_views (viewed_at desc);

create index if not exists advisory_member_views_type_idx
  on bci.advisory_member_views (member_id, content_type, viewed_at desc);

-- ----------------------------------------------------------------------------
-- 8. 알림 읽음 상태
-- ----------------------------------------------------------------------------
create table if not exists bci.advisory_notification_reads (
  member_id uuid not null references bci.advisory_members(id) on delete cascade,
  item_key text not null,
  read_at timestamptz not null default now(),
  primary key (member_id, item_key)
);

create index if not exists advisory_notification_reads_member_id_idx
  on bci.advisory_notification_reads (member_id);

-- ----------------------------------------------------------------------------
-- 9. RLS
--    서버(포털 서버액션 · 관리자)는 전부 service_role 키로 접근하므로
--    RLS 를 켜고 정책을 비워 두면 외부 anon 접근만 차단됩니다.
--    ※ 관리자 첨부 업로드와 CKEditor 이미지 업로드는 브라우저에서 anon 키로
--      '스토리지'에 직접 쓰므로, 테이블 RLS 와 무관하게 아래 11번 버킷 정책이 필요합니다.
-- ----------------------------------------------------------------------------
alter table bci.advisory_members            enable row level security;
alter table bci.advisory_resources          enable row level security;
alter table bci.advisory_events             enable row level security;
alter table bci.advisory_surveys            enable row level security;
alter table bci.advisory_login_logs         enable row level security;
alter table bci.advisory_member_views       enable row level security;
alter table bci.advisory_notification_reads enable row level security;

-- ----------------------------------------------------------------------------
-- 10. 테이블 권한 재적용
--     1번의 default privileges 는 이 스크립트로 새로 만든 객체에만 걸리므로,
--     이미 존재했던 테이블까지 덮도록 마지막에 한 번 더 부여합니다. (재실행 안전)
-- ----------------------------------------------------------------------------
grant all on all tables    in schema bci to anon, authenticated, service_role;
grant all on all sequences in schema bci to anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 11. 스토리지 (SQL 아님 — 대시보드 작업 메모)
--
--   DB 는 스키마로 나눴지만 스토리지에는 스키마 개념이 없으므로 **버킷**으로 나눕니다.
--   같은 프로젝트 안에 BCI 전용 버킷을 **2개** 만듭니다. (소아 자문단도 같은 구조입니다)
--
--   a. 첨부 버킷 — 자료실 PDF · 행사 첨부
--      · 이름 예: bci-advisory  · Public: **OFF**
--      · 포털은 다운로드 없이 보안 뷰어로만 열람하므로 서버가 signed URL 로만 내려줍니다
--      · 환경변수 NEXT_PUBLIC_BCI_SUPABASE_STORAGE_BUCKET
--
--   b. 에디터 버킷 — 자료실 본문(CKEditor) 이미지
--      · 이름 예: bci-advisory-editor  · Public: **ON**
--      · CKEditor 는 업로드 직후 getPublicUrl 결과를 본문 HTML 의 <img src> 에 박아 저장합니다.
--        그 URL 은 만료가 없으므로 private 버킷이면 포털에서 본문 이미지가 깨집니다
--      · 환경변수 NEXT_PUBLIC_BCI_SUPABASE_EDITOR_BUCKET
--
--   c. 두 이름 모두 기존 버킷(angel_robotics_home 등)과 **겹치면 안 됩니다.**
--      같은 프로젝트이므로 이름이 겹치면 기존 자료와 그대로 섞입니다. 폴백은 없습니다.
--
--   d. 정책(Policies) — 필요한 건 에디터 버킷의 insert 하나뿐입니다.
--      어떤 경로가 어떤 권한을 쓰는지 정리하면:
--      · 자료실 PDF 업로드: 서버가 service_role 로 signed upload URL 을 발급하고
--        브라우저는 그 토큰으로 올립니다 → 토큰 자체가 인증이라 anon 정책 불필요
--      · 행사 첨부 업로드 / 삭제 / 열람 URL 발급, 자료실 다운로드: 전부 service_role → 불필요
--      · 본문 이미지 조회: public 버킷의 공개 URL → 불필요
--      · 본문 이미지 업로드: 브라우저가 anon 키로 직접 올립니다 → **에디터 버킷에 insert 정책 필요**
--        경로까지 묶어 두세요 (name like 'advisory_resources/editor/%').
--        버킷 전체에 열면 공개 키로 아무 경로에나 올릴 수 있습니다.
--      · 업로드 실패 시 정리: 브라우저가 anon 키로 remove → **정책을 두지 않습니다.**
--        허용하려면 공개 키로 삭제가 가능해집니다. 정책이 없으면 그 삭제만 무시되고
--        (코드가 결과를 보지 않습니다) 고아 파일이 남을 뿐 기능은 정상입니다.
-- ----------------------------------------------------------------------------
