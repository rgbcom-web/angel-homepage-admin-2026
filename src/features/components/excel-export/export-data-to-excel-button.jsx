'use client';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/shadcn/components/ui/button';
import { RiFileExcel2Fill } from 'react-icons/ri';

export function ExportDataToExcelButton({ className, children, ...props }) {
  return (
    <Button className={cn('bg-green-600 hover:bg-green-500', className)} {...props}>
      <RiFileExcel2Fill />
      {children || '데이터 내보내기'}
    </Button>
  );
}
