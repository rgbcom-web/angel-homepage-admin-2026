'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/shadcn/components/ui/button';
import Link from 'next/link';
import { Logo } from '@/shared/SVG';

export function SideNavBarHead() {
  return (
    <Button asChild size="lg" variant="ghost" className={cn('h-auto justify-start p-2')}>
      <Link href="/">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Logo className={cn('!h-2/3 !w-2/3')} />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">angel-robotics</span>
          <span className="truncate text-xs font-light">Homepage admin</span>
        </div>
      </Link>
    </Button>
  );
}
