'use client';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/shadcn/components/ui/button';
import { useQueryString } from '@/shared/hooks/useQueryString';
import { MEMBER_STATUS_TABS } from '../constants';

export function MembersStatusTabs({ counts = {} }) {
  const qs = useQueryString();
  const active = qs.get('status') || '';

  return (
    <nav className={cn('flex flex-wrap gap-1')}>
      {MEMBER_STATUS_TABS.map((item) => {
        const count = counts[item.value] ?? 0;
        const isActive = active === String(item.value);

        return (
          <Button
            key={item.value || 'all'}
            type="button"
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            className={cn('rounded-full px-4', !isActive && 'bg-background text-muted-foreground')}
            onClick={() => qs.set({ status: String(item.value), page: 1 })}
          >
            {item.label}
            <span
              className={cn(
                'ml-1.5 tabular-nums',
                isActive ? 'text-primary-foreground/90' : 'text-muted-foreground',
              )}
            >
              {count}
            </span>
          </Button>
        );
      })}
    </nav>
  );
}
