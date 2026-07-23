'use client';

import { Button } from '@/shared/shadcn/components/ui/button';
import { useQueryString } from '@/shared/hooks/useQueryString';
import { useRouter } from 'next/navigation';

export function BackToParentListButton() {
  const router = useRouter();
  const qs = useQueryString();
  const searchParamsObject = qs.toObject();
  const newSearchParamsObject = {
    category: searchParamsObject.parentCategory || '',
    page: searchParamsObject.parentPage || '',
  };
  const href = `../?${qs.toString(newSearchParamsObject)}`;

  const handleClick = () => {
    router.push(href);
  };

  return <Button onClick={handleClick}>목록으로 돌아가기</Button>;
}
