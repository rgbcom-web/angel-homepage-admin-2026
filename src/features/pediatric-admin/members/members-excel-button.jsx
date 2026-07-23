'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { ExportDataToExcelButton } from '@/features/components/excel-export/export-data-to-excel-button';
import { exportDataToExcel } from '@/features/components/excel-export/export-data-to-excel';
import { useQueryString } from '@/shared/hooks/useQueryString';
import { getMembersForExport } from '../api/members';
import { MEMBER_STATUS_LABEL, PEDIATRIC_SITE_NAME } from '../constants';

const HEADERS = [
  { key: 'name', label: '이름', width: 14 },
  { key: 'login_id', label: '아이디', width: 16 },
  { key: 'affiliation', label: '소속', width: 22 },
  { key: 'department', label: '과', width: 14 },
  { key: 'title', label: '직급', width: 12 },
  { key: 'email', label: '이메일', width: 28 },
  { key: 'phone', label: '전화번호', width: 16 },
  { key: 'created_at', label: '가입일', width: 14 },
  { key: 'last_login_at', label: '최근 로그인', width: 20 },
  { key: 'status', label: '상태', width: 12 },
];

function formatDate(value, withTime = false) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return withTime
    ? date.toLocaleString('ko-KR', { hour12: false })
    : date.toLocaleDateString('ko-KR');
}

export function MembersExcelButton() {
  const qs = useQueryString();
  const [pending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(async () => {
      const searchParams = {
        status: qs.get('status') || '',
        search: qs.get('search') || '',
        searchField: qs.get('searchField') || 'name',
      };

      const { data, errors } = await getMembersForExport(searchParams);
      if (errors?.message) {
        toast.error(errors.message);
        return;
      }

      const rows = (data || []).map((item) => ({
        ...item,
        created_at: formatDate(item.created_at),
        last_login_at: formatDate(item.last_login_at, true),
        status: MEMBER_STATUS_LABEL[item.status] || item.status,
      }));

      const result = await exportDataToExcel({
        data: rows,
        headers: HEADERS,
        fileName: `${PEDIATRIC_SITE_NAME}_회원목록`,
      });

      if (result?.errors?.message) {
        toast.error(result.errors.message);
        return;
      }

      toast.success('엑셀 파일이 다운로드되었습니다.');
    });
  };

  return (
    <ExportDataToExcelButton disabled={pending} onClick={handleExport}>
      {pending ? '내보내는 중...' : '엑셀 다운로드'}
    </ExportDataToExcelButton>
  );
}
