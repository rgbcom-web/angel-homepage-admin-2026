'use client';

import { cn } from '@/shared/lib/utils';

export function EscapeRowClick({ children, className }) {
  return (
    <div className={cn(className)} onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  );
}
