export const PEDIATRIC_SITE_NAME = '소아 보행 재활 로봇 개발 자문단';

export const PEDIATRIC_TABLES = {
  members: 'advisory_members',
  resources: 'advisory_resources',
  events: 'advisory_events',
  surveys: 'advisory_surveys',
  loginLogs: 'advisory_login_logs',
  memberViews: 'advisory_member_views',
};

export const PEDIATRIC_BOARD_META = {
  resources: {
    key: 'resources',
    title: '자료실',
    tableName: PEDIATRIC_TABLES.resources,
    description: `${PEDIATRIC_SITE_NAME} 자료실 게시글을 관리합니다. 상단 공지·홈 공지 체크 시 포털에 노출됩니다. 첨부 파일은 여러 개 등록할 수 있으며, 포털에서 다운로드되지 않고 보안 뷰어로만 열람됩니다.`,
  },
  events: {
    key: 'events',
    title: '행사',
    tableName: PEDIATRIC_TABLES.events,
    description: `${PEDIATRIC_SITE_NAME} 포털 행사 목록에 노출됩니다. 홈 공지 체크 시 메인 공지사항에 표시됩니다. 카테고리는 최대 3글자(학회/워크샵/행사)로 등록해 주세요. 이미지·PDF를 첨부하면 포털 상세에서 바로 표시됩니다.`,
  },
  surveys: {
    key: 'surveys',
    title: '설문',
    tableName: PEDIATRIC_TABLES.surveys,
    description: `${PEDIATRIC_SITE_NAME} 포털 설문 목록에 노출됩니다. 제목·기간·구글폼 URL을 등록하면, 회원이 클릭 시 구글폼으로 이동합니다. 설문 기간이 지나면 자동으로 종료 상태로 표시됩니다.`,
  },
};

export const MEMBER_STATUS_LABEL = {
  pending: '승인 대기',
  approved: '승인 완료',
  rejected: '거절',
  inactive: '비활성',
};

export const MEMBER_STATUS_TABS = [
  { label: '전체', value: '' },
  { label: '승인 대기', value: 'pending' },
  { label: '승인 완료', value: 'approved' },
  { label: '거절', value: 'rejected' },
  { label: '비활성', value: 'inactive' },
];

export const MEMBER_SEARCH_FIELDS = [
  { label: '이름', value: 'name' },
  { label: '아이디', value: 'login_id' },
  { label: '소속', value: 'affiliation' },
  { label: '이메일', value: 'email' },
];

export const MEMBER_LIST_SELECT =
  'id, login_id, email, name, birth_year, birth_date, phone, affiliation, department, title, address, status, created_at, last_login_at, admin_memo, admin_memo_updated_at, admin_memo_updated_by';
