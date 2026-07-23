-- 자문단 회원가입 승인 요청 알림메일 수신자
-- 관리자 → 설정 → 알림메일 수신자에서 이메일을 수정할 수 있습니다.
-- table_id 는 홈 포털 코드의 ADVISORY_SIGNUP_ALIM_TABLE_ID 와 같아야 합니다.

insert into public.settings_alim_mail_recipients (table_id, table_title, email, "order")
select
  'advisory_members',
  '자문단 회원가입 승인 요청',
  array['contact@angel-robotics.com', 'jeoh@angel-robotics.com']::text[],
  coalesce((select max("order") from public.settings_alim_mail_recipients), 0) + 1
where not exists (
  select 1
  from public.settings_alim_mail_recipients
  where table_id = 'advisory_members'
);
