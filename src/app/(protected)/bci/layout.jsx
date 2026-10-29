import { checkSession } from '@/features/auth/checkSession';

/**
 * 뇌-AI-로봇 연동시스템 개발 자문단 관리 - 최고관리자(super_admin)만 접근
 * 메뉴 숨김만으로는 URL 직접 접근이 가능하므로 레이아웃에서도 검사합니다.
 * 권한 없으면 메인 관리자 홈으로 보냄 (/ 를 bci로 다시 보내면 루프가 납니다).
 */
export default async function BciAdminLayout({ children }) {
  await checkSession({
    permission: (user) => user?.super_admin || user?.superAdmin,
    redirectUrl: '/',
  });

  return children;
}
