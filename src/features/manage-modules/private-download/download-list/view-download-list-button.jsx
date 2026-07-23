'use client';

import { Button } from '@/shared/shadcn/components/ui/button';
import { usePathname } from 'next/navigation';
import { useQueryString } from '@/shared/hooks/useQueryString';

export function ViewDownloadListButton({ id }) {
  const qs = useQueryString();
  const pathname = usePathname();
  const href = `${pathname}/${id}`;
  const searchParamsObject = qs.toObject();
  const newSearchParamsObject = {
    parentSearch: searchParamsObject.search || '',
    parentPage: searchParamsObject.page || '',
  };

  const handleClick = () => {
    qs.routeTo({ path: href, paramsToSet: newSearchParamsObject });
  };

  return (
    <Button variant="outline" size="xs" onClick={handleClick}>
      다운로드 목록
    </Button>
  );
}
