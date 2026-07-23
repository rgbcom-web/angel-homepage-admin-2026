'use client';

import { cn } from '@/shared/lib/utils';
import { Form, FormControl, FormField } from '@/shared/shadcn/components/ui/form';
import { Input, inputClassName } from '@/shared/shadcn/components/ui/input';
import { Button } from '@/shared/shadcn/components/ui/button';
import { SearchIcon, XIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useThrottle } from '@/shared/hooks/useThrottle';
import { useEffect, useRef, useState } from 'react';
import { useQueryString } from '@/shared/hooks/useQueryString';

export function Searchbar({ type }) {
  if (type === 'form') {
    return <SearchForm />;
  }

  return <Search />;
}

function SearchForm() {
  const qs = useQueryString();
  const search = qs.get('search');

  const form = useForm({
    defaultValues: {
      search: search || '',
    },
  });

  const value = form.watch('search');

  const onSubmit = (data) => {
    qs.set({ search: data.search });
  };

  const handleClear = () => {
    form.setValue('search', '');

    if (search) {
      qs.remove('search');
    }
  };

  return (
    <Form {...form}>
      <form
        className={cn(inputClassName, 'flex w-[300px] items-center pr-1.5')}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="search"
          render={({ field }) => <Input ghost {...field} className={cn('w-full')} />}
        />
        <div className={cn('flex flex-shrink-0 gap-1')}>
          {value && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className={cn('h-6 w-6')}
              onClick={handleClear}
            >
              <XIcon />
            </Button>
          )}
          <Button type="submit" size="icon" variant="ghost" className={cn('h-6 w-6')}>
            <SearchIcon />
          </Button>
        </div>
      </form>
    </Form>
  );
}

function Search() {
  const ref = useRef(null);
  const qs = useQueryString();
  const search = qs.get('search');

  const [value, setValue] = useState(search || '');
  const throttledValue = useThrottle(value, 300);

  useEffect(() => {
    if (throttledValue !== search) {
      throttledValue ? qs.set({ search: throttledValue.trim() }) : qs.remove('search');
    }
  }, [throttledValue]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
  };

  const handleClear = () => {
    setValue('');
    qs.remove('search');
    ref.current.focus();
  };

  return (
    <div className={cn(inputClassName, 'flex w-[300px] items-center pr-1.5')}>
      <Input
        ref={ref}
        ghost
        value={value}
        noFormControl
        onChange={handleChange}
        className={cn('w-full')}
      />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={cn('h-6 w-6 flex-shrink-0')}
        onClick={handleClear}
      >
        {search ? <XIcon /> : <SearchIcon />}
      </Button>
    </div>
  );
}
