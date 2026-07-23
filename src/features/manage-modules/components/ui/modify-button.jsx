'use client';

import { SheetTrigger } from '@/features/components/sheet';

export function ModifyButton({ id, children }) {
  return (
    <SheetTrigger action="open" variant="defaultLight" size="xs" data={{ id }}>
      {children || '수정'}
    </SheetTrigger>
  );
}
