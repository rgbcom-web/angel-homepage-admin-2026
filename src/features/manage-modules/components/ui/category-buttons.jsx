'use client';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/shadcn/components/ui/button';
import { useQueryString } from '@/shared/hooks/useQueryString';

export function CategoryButtons({ items, queryKey }) {
  const qs = useQueryString();
  const active = qs.get(queryKey) || String(items[0].value);

  const handleClick = (value) => {
    qs.set({ [queryKey]: String(value), page: 1 });
  };

  return (
    <nav className={cn('flex divide-x overflow-hidden rounded-md border')}>
      {items.map((item) => (
        <Button
          key={item.value}
          onClick={() => handleClick(item.value)}
          className={cn(
            'rounded-none bg-muted text-muted-foreground shadow-none',
            active === String(item.value)
              ? '!bg-background font-semibold !text-primary'
              : 'hover:bg-background',
          )}
        >
          {item.label}
        </Button>
      ))}
    </nav>
  );
}
