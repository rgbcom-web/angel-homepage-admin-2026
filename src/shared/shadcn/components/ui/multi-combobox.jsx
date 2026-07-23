'use client';

import { Check, ChevronsUpDown, X } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/shadcn/components/ui/popover';

/**
 * 다중 선택이 가능한 콤보박스 컴포넌트
 * @param {Object} props
 * @param {Object} props.form - React Hook Form의 form 객체
 * @param {Object} props.field - React Hook Form의 field 객체
 * @param {Array} props.options - 콤보박스에 표시될 옵션 배열 [{label: string, value: string}]
 * @param {Object} props.className - 스타일링을 위한 클래스명 객체 {button?: string, options?: string}
 * @param {string} props.placeholder - 기본 표시 텍스트
 * @param {Array} props.referenceData - 참조 데이터 배열 (옵션)
 * @returns {JSX.Element} 다중 선택 콤보박스 컴포넌트
 */

export function MultiCombobox({
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
              'hover:border-primary hover:bg-white hover:text-primary hover:!opacity-100',
              !field.value?.length && 'text-muted-foreground',
              field.value?.length > 0 && 'pl-1.5',
              className?.button,
            )}
          >
            <div className="flex flex-wrap gap-1">
              {field.value?.length ? (
                field.value.map((value) => (
                  <div
                    key={value}
                    className="flex items-center gap-1 rounded bg-secondary py-0.5 pl-2 text-sm"
                  >
                    <span className="text-muted-foreground">
                      {referenceData
                        ? referenceData.find((a) => a._id === value)?.name
                        : options.find((option) => option.value === value)?.label}
                    </span>
                    <div
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer px-2 py-0.5 text-muted-foreground hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newValues = field.value.filter((v) => v !== value);
                        form.setValue(field.name, newValues, { shouldValidate: true });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          const newValues = field.value.filter((v) => v !== value);
                          form.setValue(field.name, newValues, { shouldValidate: true });
                        }
                      }}
                    >
                      <X className="!h-3 !w-3" />
                    </div>
                  </div>
                ))
              ) : (
                <span className={cn('text-left font-medium')}>{placeholder}</span>
              )}
            </div>
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
                    const values = field.value || [];
                    const newValues = values.includes(option.value)
                      ? values.filter((v) => v !== option.value)
                      : [...values, option.value];
                    form.setValue(field.name, newValues, { shouldValidate: true });
                  }}
                  className={cn('p-0 text-left')}
                >
                  <div
                    className={cn('flex w-full items-center justify-between px-2 py-1.5 text-left')}
                  >
                    {option.label}
                    <Check
                      className={cn(
                        'ml-auto',
                        (field.value || []).includes(option.value) ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
