import { checkSession } from '@/features/auth/checkSession';

/**
 * 소아 보행 재활 로봇 개발 자문단 관리 - 최고관리자(super_admin)만 접근
 * 메뉴 숨김만으로는 URL 직접 접근이 가능하므로 레이아웃에서도 검사합니다.
 */
export default async function PediatricAdminLayout({ children }) {
  await checkSession({
    permission: (user) => user?.super_admin,
    redirectUrl: '/',
  });

  return children;
}
