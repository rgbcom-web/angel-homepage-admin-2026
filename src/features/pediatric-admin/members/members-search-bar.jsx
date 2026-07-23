'use client';

import { useEffect, useRef, useState } from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useQueryString } from '@/shared/hooks/useQueryString';
import { useThrottle } from '@/shared/hooks/useThrottle';
import { Input, inputClassName } from '@/shared/shadcn/components/ui/input';
import { Button } from '@/shared/shadcn/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/shadcn/components/ui/select';
import { MEMBER_SEARCH_FIELDS } from '../constants';

const PLACEHOLDERS = {
  name: '이름을 입력해주세요.',
  login_id: '아이디를 입력해주세요.',
  affiliation: '소속을 입력해주세요.',
  email: '이메일을 입력해주세요.',
};

export function MembersSearchBar() {
  const qs = useQueryString();
  const search = qs.get('search') || '';
  const searchField = qs.get('searchField') || 'name';
  const ref = useRef(null);

  const [field, setField] = useState(searchField);
  const [value, setValue] = useState(search);
  const throttledValue = useThrottle(value, 300);

  useEffect(() => {
    setValue(search);
  }, [search]);

  useEffect(() => {
    setField(searchField);
  }, [searchField]);

  useEffect(() => {
    const next = throttledValue.trim();
    if (next === (search || '')) return;

    if (next) {
      qs.set({ search: next, searchField: field, page: 1 });
    } else {
      qs.set({ searchField: field, page: 1 });
      qs.remove('search');
    }
  }, [throttledValue]);

  const handleFieldChange = (next) => {
    setField(next);
    qs.set({ searchField: next, page: 1 });
  };

  const handleClear = () => {
    setValue('');
    qs.remove('search');
    ref.current?.focus();
  };

  return (
    <div className={cn('flex items-center gap-2')}>
      <Select value={field} onValueChange={handleFieldChange}>
        <SelectTrigger className={cn('h-9 w-[110px]')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MEMBER_SEARCH_FIELDS.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className={cn(inputClassName, 'flex h-9 w-[280px] items-center pr-1.5')}>
        <Input
          ref={ref}
          ghost
          value={value}
          noFormControl
          onChange={(e) => setValue(e.target.value)}
          placeholder={PLACEHOLDERS[field] || '검색어를 입력해주세요.'}
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
    </div>
  );
}
