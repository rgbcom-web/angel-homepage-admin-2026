'use client';

import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';

import { cn } from '@/shared/lib/utils';

const Separator = React.forwardRef(
  ({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className,
      )}
      {...props}
    />
  ),
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

const VerticalSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div className={cn('flex items-center')}>
    <Separator orientation="vertical" className={cn('mx-1 h-2/3', className)} {...props} />
  </div>
));
VerticalSeparator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator, VerticalSeparator };
