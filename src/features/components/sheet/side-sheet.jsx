'use client';

import { cn } from '@/shared/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
  SheetClose,
} from '@/shared/shadcn/components/ui/sheet';
import { useSheet } from './sheet.context';
import { Button } from '@/shared/shadcn/components/ui/button';

const SIZE_MAP = {
  sm: 'w-[520px]',
  md: 'w-[880px]',
  lg: 'w-[1040px]',
  xl: 'w-[1200px]',
};

export function SideSheet({
  title = '시트 제목을 입력하세요.',
  header,
  body,
  footer,
  className = {},
  side = 'right',
  size = 'md',
}) {
  const { sheetOpen, setSheetOpen } = useSheet();

  const DefaultHeader = () => {
    return (
      <SheetHeader
        className={cn(
          'sticky top-0 z-10 flex-row items-center justify-between gap-4 space-y-0 bg-white py-4',
          className?.header,
        )}
      >
        <SheetTitle className={cn(className?.title)}>{title}</SheetTitle>
        <SheetClose asChild>
          <Button variant="black">닫기</Button>
        </SheetClose>
      </SheetHeader>
    );
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent
        className={cn('overflow-y-auto py-0', SIZE_MAP[size], className?.content)}
        side={side}
      >
        {!header ? (
          <DefaultHeader />
        ) : (
          <SheetHeader
            className={cn('sticky top-0 z-10 space-y-0 bg-white py-4', className?.header)}
          >
            {header}
          </SheetHeader>
        )}
        {body && <SheetBody className={cn(className?.body)}>{body}</SheetBody>}
        {footer && <SheetFooter className={cn(className?.footer)}>{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}
