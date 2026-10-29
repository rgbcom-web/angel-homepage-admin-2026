'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/shared/shadcn/components/ui/button';

export function DashboardDateRange({ from, to }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [fromValue, setFromValue] = useState(from);
  const [toValue, setToValue] = useState(to);

  const apply = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('from', fromValue);
    params.set('to', toValue);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm shadow-sm">
      <CalendarDays className="h-4 w-4 text-slate-400" />
      <input
        type="date"
        value={fromValue}
        onChange={(e) => setFromValue(e.target.value)}
        className="rounded border-0 bg-transparent text-sm outline-none"
      />
      <span className="text-slate-400">~</span>
      <input
        type="date"
        value={toValue}
        onChange={(e) => setToValue(e.target.value)}
        className="rounded border-0 bg-transparent text-sm outline-none"
      />
      <Button size="xs" variant="outline" onClick={apply}>
        적용
      </Button>
    </div>
  );
}
