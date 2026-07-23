'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/shadcn/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { changeOrder } from './change-order';

export function ChangeOrderButton({ tableName, row, table }) {
  const rows = table.getRowModel().rows;
  const currentIndex = row.index;
  const currentId = row.original.id;
  const prevId = rows[currentIndex - 1]?.original.id;
  const nextId = rows[currentIndex + 1]?.original.id;

  const pathname = usePathname();

  const handleChangeOrder = async (direction) => {
    if (!prevId && direction === 'up') {
      toast.error('첫번째 게시글입니다.');
      return;
    }

    if (!nextId && direction === 'down') {
      toast.error('마지막 게시글입니다.');
      return;
    }

    const targetId = direction === 'up' ? prevId : nextId;
    const result = await changeOrder(tableName, currentId, targetId, pathname);

    if (!result.success) {
      toast.error(result.errors.message);
      return;
    }

    toast.success('순서가 변경되었습니다.');
  };

  return (
    <div className="flex flex-col" onClick={(e) => e.stopPropagation()}>
      <Button
        variant="outline"
        className={cn('h-5 rounded-b-none')}
        disabled={!prevId}
        onClick={() => handleChangeOrder('up')}
      >
        <ChevronUp />
      </Button>
      <Button
        variant="outline"
        className={cn('mt-[-1px] h-5 rounded-t-none')}
        disabled={!nextId}
        onClick={() => handleChangeOrder('down')}
      >
        <ChevronDown />
      </Button>
    </div>
  );
}
