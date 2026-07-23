'use client';

import { useSheet } from './sheet.context';
import { Button } from '@/shared/shadcn/components/ui/button';

export function SheetTrigger({ children, action = 'toggle', onClick, data, ...props }) {
  const { setSheetOpen, setSheetData } = useSheet();

  const handleClick = () => {
    switch (action) {
      case 'toggle':
        setSheetOpen((prev) => {
          if (prev) {
            data && setSheetData(data);
          } else {
            setSheetData(null);
          }
          return !prev;
        });
        break;
      case 'open':
        setSheetOpen(true);
        data && setSheetData(data);
        break;
      case 'close':
        setSheetOpen(false);
        setSheetData(null);
        break;
    }
    onClick?.();
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
}
