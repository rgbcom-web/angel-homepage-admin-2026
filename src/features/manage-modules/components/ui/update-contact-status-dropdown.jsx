'use client';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/shared/shadcn/components/ui/select';
import { updateContactStatus } from './update-contact-state.api';
import { useManageModuleContext } from '../manage-modules.context';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const DEFAULT_OPTIONS = [
  { value: 0, label: '접수' },
  { value: 1, label: '확인중' },
  { value: 2, label: '답변완료' },
];

export function UpdateContactStatusDropdown({ status, id, options = DEFAULT_OPTIONS }) {
  const pathname = usePathname();
  const [value, setValue] = useState(status);

  useEffect(() => {
    setValue(status);
  }, [status]);

  const { tableName } = useManageModuleContext();

  const handleChange = async (value) => {
    const { success, errors } = await updateContactStatus(id, value, tableName, pathname);

    if (success) {
      toast.success('문의상태가 업데이트되었습니다.');
      setValue(value);
    } else {
      toast.error(errors.message);
      setValue(status);
    }
  };

  return (
    <Select value={value || 0} defaultValue={value || 0} onValueChange={handleChange}>
      <SelectTrigger>
        <SelectValue placeholder="문의상태" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
