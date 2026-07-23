'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/shadcn/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/shadcn/components/ui/command';
import { FormControl } from '@/shared/shadcn/components/ui/form';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/shadcn/components/ui/popover';

/**
 * 콤보박스 컴포넌트
 * @param {Object} props
 * @param {Object} props.form - React Hook Form의 form 객체
 * @param {Object} props.field - React Hook Form의 field 객체
 * @param {Array} props.options - 콤보박스에 표시될 옵션 배열 [{label: string, value: string}]
 * @param {Object} props.className - 스타일링을 위한 클래스명 객체 {button?: string, options?: string}
 * @param {string} props.placeholder - 기본 표시 텍스트
 * @param {Array} props.referenceData - 참조 데이터 배열 (옵션)
 * @returns {JSX.Element} 콤보박스 컴포넌트
 */

export function Combobox({
  form,
  field,
  options,
  className,
  placeholder = '옵션을 선택하세요',
  referenceData,
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              'min-w-[250px] justify-between pl-2.5 pr-1.5',
              'hover:bg-white hover:text-primary hover:!opacity-100',
              !field.value && 'text-muted-foreground',
              className?.button,
            )}
          >
            <span className={cn('text-left font-normal')}>
              {field.value
                ? referenceData
                  ? referenceData.find((a) => a._id === field.value)?.name
                  : options.find((option) => option.value === field.value)?.label
                : placeholder}
            </span>
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent
        className={cn('w-[var(--radix-popover-trigger-width)] p-0', className?.options)}
      >
        <Command>
          <CommandInput placeholder="옵션 검색" className="h-9" />
          <CommandList>
            <CommandEmpty>옵션이 없습니다.</CommandEmpty>
            <CommandGroup>
              {options?.map((option) => (
                <CommandItem
                  value={option.label}
                  key={option.value}
                  onSelect={() => {
                    form.setValue(field.name, option.value, { shouldValidate: true });
                  }}
                  className={cn('p-0 text-left')}
                >
                  <PopoverClose
                    className={cn('flex w-full items-center justify-between px-2 py-1.5 text-left')}
                  >
                    {option.label}
                    <Check
                      className={cn(
                        'ml-auto',
                        option.value === field.value ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </PopoverClose>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
