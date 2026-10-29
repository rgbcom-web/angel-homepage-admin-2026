-- ============================================================================
-- 뇌-AI-로봇 연동시스템 개발 자문단 — 가입 승인 요청 알림메일 수신자
--
-- ⚠️ 실행 위치: 같은 프로젝트의 **public 스키마** (bci 스키마가 아닙니다)
--    메일 설정(settings_smtp · settings_alim_mail_recipients)은 회사 공용이라
--    public 에 그대로 두고, 수신자 행만 하나 추가합니다.
--
-- table_id 는 포털 코드의 BCI_SIGNUP_ALIM_TABLE_ID 와 반드시 같아야 합니다.
-- 소아 자문단 행(table_id = 'advisory_members')과 키가 겹치면 안 되므로
-- 'bci_members' 를 사용합니다.
--
-- 수신 이메일은 담당자 확인 후 바꿔서 실행하세요.
-- ============================================================================

insert into public.settings_alim_mail_recipients (table_id, table_title, email, "order")
select
  'bci_members',
  '뇌-AI-로봇 연동시스템 개발 자문단 회원가입 승인 요청',
  array['contact@angel-robotics.com', 'jeoh@angel-robotics.com']::text[],
  coalesce((select max("order") from public.settings_alim_mail_recipients), 0) + 1
where not exists (
  select 1
  from public.settings_alim_mail_recipients
  where table_id = 'bci_members'
);
