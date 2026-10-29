import {
  Image,
  LayoutList,
  ListTree,
  MessageSquare,
  Building2,
  FileText,
  FileUser,
  CircleUserRound,
  LayoutDashboard,
  Users,
} from 'lucide-react';

export const menuTree = [
  {
    title: '메인페이지',
    items: [
      {
        title: '팝업 관리',
        icon: Image,
        items: [
          {
            title: '국문',
            url: '/popup/ko',
          },
          {
            title: '영문',
            url: '/popup/en',
          },
        ],
      },
    ],
  },
  {
    title: '회사소개',
    items: [
      {
        title: '뉴스룸 게시판 관리',
        icon: LayoutList,
        items: [
          {
            title: '국문',
            url: '/company/newsroom/ko',
          },
          {
            title: '영문',
            url: '/company/newsroom/en',
          },
        ],
      },
    ],
  },
  {
    title: '고객지원',
    items: [
      {
        title: '고객 문의 접수 내역',
        icon: MessageSquare,
        items: [
          {
            title: '국문',
            url: '/support/contact/ko',
          },
          {
            title: '영문',
            url: '/support/contact/en',
          },
        ],
      },
      {
        title: '기부 문의 접수 내역',
        icon: MessageSquare,
        url: '/support/donation/ko',
      },
      {
        title: 'FAQ 관리',
        icon: LayoutList,
        items: [
          {
            title: '국문',
            url: '/support/faq/ko',
          },
          {
            title: '영문',
            url: '/support/faq/en',
          },
        ],
      },
      {
        title: '제품 브로슈어 & 매뉴얼 관리',
        icon: FileText,
        items: [
          {
            title: '국문',
            url: '/support/download/ko',
          },
          {
            title: '영문',
            url: '/support/download/en',
          },
        ],
      },
      {
        title: '비공개 다운로드',
        icon: FileText,
        url: '/private/download/ko',
      },
      {
        title: '도입 병원 관리',
        icon: Building2,
        url: '/support/find-medical-center/ko',
      },
    ],
  },
  {
    title: 'IR',
    items: [
      {
        title: '공고사항 관리',
        icon: ListTree,
        url: '/ir/notice/ko',
      },
      {
        title: '사업보고서',
        icon: ListTree,
        url: '/ir/business-report/ko',
      },
      {
        title: 'IR 자료',
        icon: ListTree,
        url: '/ir/material/ko',
      },
    ],
  },
  {
    title: '채용',
    items: [
      {
        title: '상시 채용 지원 내역',
        icon: FileUser,
        url: '/recruit/recruit-application/ko',
      },
      {
        title: '채용 공고 관리',
        icon: ListTree,
        url: '/recruit/recruit-notice/ko',
      },
      {
        title: '채용 FAQ 관리',
        icon: LayoutList,
        url: '/recruit/faq/ko',
      },
      {
        title: '엔젤 스토리',
        icon: LayoutList,
        url: '/recruit/angel-story/ko',
      },
    ],
  },
  {
    // 최고관리자만 사이드바에 표시
    permission: (user) => user?.super_admin,
    title: '소아 보행 재활 로봇 개발 자문단',
    items: [
      {
        title: 'Dashboard',
        icon: LayoutDashboard,
        url: '/pediatric/dashboard',
      },
      {
        title: '회원관리',
        icon: Users,
        url: '/pediatric/members',
      },
      {
        title: '게시판 관리',
        icon: LayoutList,
        items: [
          {
            title: '자료실',
            url: '/pediatric/boards/resources',
          },
          {
            title: '행사관리',
            url: '/pediatric/boards/events',
          },
          {
            title: '설문관리',
            url: '/pediatric/boards/surveys',
          },
        ],
      },
    ],
  },
  {
    // 최고관리자만 사이드바에 표시
    permission: (user) => user?.super_admin,
    title: '뇌-AI-로봇 연동시스템 개발 자문단',
    items: [
      {
        title: 'Dashboard',
        icon: LayoutDashboard,
        url: '/bci/dashboard',
      },
      {
        title: '회원관리',
        icon: Users,
        url: '/bci/members',
      },
      {
        title: '게시판 관리',
        icon: LayoutList,
        items: [
          {
            title: '자료실',
            url: '/bci/boards/resources',
          },
          {
            title: '행사관리',
            url: '/bci/boards/events',
          },
          {
            title: '설문관리',
            url: '/bci/boards/surveys',
          },
        ],
      },
    ],
  },
  {
    permission: (user) => user.super_admin,
    title: '계정',
    items: [
      {
        title: '관리자 계정',
        icon: CircleUserRound,
        url: '/account/admin',
      },
    ],
  },
];
