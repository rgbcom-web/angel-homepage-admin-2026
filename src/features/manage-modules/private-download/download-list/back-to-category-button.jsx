'use client';

import { Button } from '@/shared/shadcn/components/ui/button';
import { useQueryString } from '@/shared/hooks/useQueryString';
import { useRouter } from 'next/navigation';

export function BackToCategoryListButton() {
  const router = useRouter();
  const qs = useQueryString();
  const searchParamsObject = qs.toObject();
  const newSearchParamsObject = {
    search: searchParamsObject.categorySearch || '',
    page: searchParamsObject.categoryPage || '',
  };
  const href = `./?${qs.toString(newSearchParamsObject)}`;

  const handleClick = () => {
    router.push(href);
  };

  return <Button onClick={handleClick}>카테고리 목록</Button>;
}
