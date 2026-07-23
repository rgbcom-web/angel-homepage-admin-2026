'use client';

import { cn } from '@/shared/lib/utils';
import { useEffect, lazy } from 'react';
import { useManageModuleContext } from '@/features/manage-modules/components/manage-modules.context';
import { usePathname } from 'next/navigation';
import { useQueryString } from '@/shared/hooks/useQueryString';
import { useSheet } from '@/features/components/sheet';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { setFieldErrors } from '@/shared/lib/validation.utils';
import { Form, Fieldset, FieldBlock, FormSubmit } from '@/shared/shadcn/components/ui/form';
import { writeSchema, getDefaultValues } from './schema';
import { createItem, getItemById, updateItem } from './api';

import { toast } from 'sonner';
import { Input } from '@/shared/shadcn/components/ui/input';
import { DatePicker } from '@/shared/shadcn/components/ui/date-picker';
import { CheckboxWithLabel } from '@/shared/shadcn/components/ui/checkbox';

const Editor = lazy(() => import('@/shared/editor/CKEditor5'));

export function WriteForm({ id }) {
  const { setSheetOpen } = useSheet();
  const pathname = usePathname();
  const qs = useQueryString();
  const { tableName } = useManageModuleContext();

  const form = useForm({
    mode: 'onChange',
    resolver: zodResolver(writeSchema),
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    if (id) {
      const loadPrevData = async () => {
        const { data, errors } = await getItemById(tableName, id);
        form.reset(data);
      };
      loadPrevData();
    }
  }, [id]);

  const onSubmit = async (data) => {
    const { success, errors } = id
      ? await updateItem(id, data, tableName, pathname)
      : await createItem(data, tableName, pathname);

    if (!success) {
      setFieldErrors(form, errors);

      if (errors.message) {
        toast.error(errors.message);
      }

      return;
    }

    toast.success(`${data.title} 팝업이 ${id ? '수정' : '생성'}되었습니다.`);

    if (qs.get('disabled')) {
      qs.set({
        disabled: data.disabled.toString(),
        page: 1,
      });
    }
    setSheetOpen(false);
  };

  return (
    <Form {...form}>
      <form action={form.handleSubmit(onSubmit)} className={cn('space-y-10')}>
        <Fieldset title="노출기간 설정">
          <FieldBlock
            control={form.control}
            name="disabled"
            label="게시상태"
            description="체크시 아래 설정과 관계없이 팝업이 노출되지 않습니다."
            required
            render={({ field }) => <CheckboxWithLabel field={field} label="비활성화" boxed />}
          />
          <div className={cn('flex gap-x-3')}>
            <FieldBlock
              control={form.control}
              name="always_display"
              label="항시 노출"
              required
              className={{ container: cn('col-span-1') }}
              render={({ field }) => <CheckboxWithLabel field={field} label="항시 노출" boxed />}
            />
            <FieldBlock
              control={form.control}
              name="start_date"
              label="시작일"
              required
              className={{ container: cn('col-span-2') }}
              render={({ field }) => <DatePicker field={field} />}
            />
            <FieldBlock
              control={form.control}
              name="end_date"
              label="종료일"
              required
              className={{ container: cn('col-span-2') }}
              render={({ field }) => <DatePicker field={field} />}
            />
          </div>
        </Fieldset>
        <Fieldset title="위치 / 크기 설정">
          <div className={cn('grid grid-cols-3 gap-3 gap-y-4')}>
            <FieldBlock
              control={form.control}
              name="width"
              label="팝업창 너비 (px)"
              required
              render={({ field }) => <Input {...field} type="int" />}
            />
            <FieldBlock
              control={form.control}
              name="left"
              label="좌측 위치 (px)"
              required
              render={({ field }) => <Input {...field} type="int" />}
            />
            <FieldBlock
              control={form.control}
              name="top"
              label="상단 위치 (px)"
              required
              render={({ field }) => <Input {...field} type="int" />}
            />
            <FieldBlock
              control={form.control}
              name="z_index"
              label="팝업 순서"
              description="숫자가 낮을수록 먼저 표시됩니다."
              required
              className={{ container: cn('col-span-full') }}
              render={({ field }) => <Input {...field} type="int" />}
            />
          </div>
        </Fieldset>
        <Fieldset title="제목 및 내용">
          <FieldBlock
            control={form.control}
            name="title"
            render={({ field }) => <Input {...field} />}
          />
          <FieldBlock
            control={form.control}
            name="content"
            render={({ field }) => <Editor field={field} tableName={tableName} />}
          />
        </Fieldset>
        <div className={cn('sticky bottom-0 z-[200] bg-white py-4')}>
          <FormSubmit className={cn('w-full')}>저장</FormSubmit>
        </div>
      </form>
    </Form>
  );
}
