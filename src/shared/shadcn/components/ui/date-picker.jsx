'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/shadcn/components/ui/button';
import { Calendar } from '@/shared/shadcn/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/shadcn/components/ui/popover';
import { FormControl } from '@/shared/shadcn/components/ui/form';

export function DatePicker({ field, onSelect, size, className }) {
  const [date, setDate] = useState(field.value ? new Date(field.value) : null);
  const [open, setOpen] = useState(false);

  const handleSelect = (date) => {
    setDate(date);
    field?.onChange(date);
    onSelect && onSelect(date);
    setOpen(false);
  };

  const handleClear = () => {
    setDate(null);
    field?.onChange(null);
    onSelect && onSelect(null);
  };

  useEffect(() => {
    setDate(field.value ? new Date(field.value) : null);
  }, [field.value]);

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant={'outline'}
              className={cn(
                'w-[240px] justify-start text-left font-normal',
                !date && 'text-muted-foreground',
                size === 'sm' && 'h-8',
                className?.button,
              )}
            >
              <CalendarIcon
                className={cn(size === 'sm' && '!h-3.5 !w-3.5', size === 'xs' && '!h-3 !w-3')}
              />
              {date ? format(date, 'yyyy.MM.dd') : <span>날짜를 선택하세요</span>}
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={handleSelect} initialFocus />
        </PopoverContent>
      </Popover>
      {date && (
        <button
          type="button"
          className={cn(
            'absolute right-2 top-1/2 flex h-4 w-4 -translate-y-1/2 cursor-pointer items-center justify-center opacity-70 hover:opacity-100',
            size === 'sm' && 'h-3.5 w-3.5',
            size === 'xs' && 'h-3 w-3',
          )}
          onClick={handleClear}
        >
          <X className="h-full w-full" />
        </button>
      )}
    </div>
  );
}
