'use client';

import { SheetProvider, SheetTrigger } from '@/features/components/sheet';

export function CreateButton({ label = '게시글 생성', children }) {
  return (
    <SheetProvider>
      <SheetTrigger action="open">{label}</SheetTrigger>
      {children}
    </SheetProvider>
  );
}
