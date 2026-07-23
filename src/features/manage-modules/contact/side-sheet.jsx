'use client';

import { cn } from '@/shared/lib/utils';
import { SideSheet } from '@/features/components/sheet';
import { DetailProvider } from './detail.context';
import { DetailView } from './detail-view';
import { DetailAnswer } from './detail-answer';

export function ManageModuleSideSheet() {
  const title = '문의 상세 내용';

  return (
    <SideSheet
      className={{
        content: cn('flex h-screen flex-1 flex-col gap-0 overflow-hidden'),
        body: cn('h-full min-h-0 flex-1 p-0'),
      }}
      title={title}
      body={
        <DetailProvider>
          <div className={cn('grid h-full grid-cols-2 divide-x')}>
            <SheetBodyColumn>
              <DetailView />
            </SheetBodyColumn>
            <SheetBodyColumn className={cn('bg-secondary/30')}>
              <DetailAnswer />
            </SheetBodyColumn>
          </div>
        </DetailProvider>
      }
      size="lg"
    />
  );
}

function SheetBodyColumn({ children, className }) {
  return (
    <div
      className={cn(
        'h-full min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      {children}
    </div>
  );
}
