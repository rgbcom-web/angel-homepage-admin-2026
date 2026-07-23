-- 자문단 알림 읽음 상태 (게시판 연동)
-- 알림 목록은 자료실/행사/설문 게시글에서 생성하고,
-- 이 테이블에 회원별 읽음만 기록합니다.

create table if not exists public.advisory_notification_reads (
  member_id uuid not null references public.advisory_members(id) on delete cascade,
  item_key text not null,
  read_at timestamptz not null default now(),
  primary key (member_id, item_key)
);

create index if not exists advisory_notification_reads_member_id_idx
  on public.advisory_notification_reads (member_id);
