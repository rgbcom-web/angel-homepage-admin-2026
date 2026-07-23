'use client';

import { Button } from '@/shared/shadcn/components/ui/button';
import { usePathname } from 'next/navigation';
import { useQueryString } from '@/shared/hooks/useQueryString';

export function ViewApplicantsButton({ id }) {
  const qs = useQueryString();
  const pathname = usePathname();
  const href = `${pathname}/applicants/${id}`;
  const searchParamsObject = qs.toObject();
  const newSearchParamsObject = {
    parentCategory: searchParamsObject.category || '',
    parentPage: searchParamsObject.page || '',
  };

  const handleClick = () => {
    qs.routeTo({ path: href, paramsToSet: newSearchParamsObject });
  };

  return (
    <Button variant="outline" size="xs" onClick={handleClick}>
      지원자 보기
    </Button>
  );
}
