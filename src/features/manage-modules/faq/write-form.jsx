'use client';

import { cn } from '@/shared/lib/utils';
import { useEffect, lazy } from 'react';
import { useManageModuleContext } from '@/features/manage-modules/components/manage-modules.context';
import { usePathname, useParams } from 'next/navigation';
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
import { FormSelect } from '@/shared/shadcn/components/ui/select';

const Editor = lazy(() => import('@/shared/editor/CKEditor5'));

export function WriteForm({ id }) {
  const { lang } = useParams();
  const { setSheetOpen } = useSheet();
  const pathname = usePathname();
  const qs = useQueryString();
  const { tableName, categories } = useManageModuleContext();

  const form = useForm({
    mode: 'onChange',
    resolver: zodResolver(writeSchema),
    defaultValues: getDefaultValues(),
  });

  const categoryDepth1 = categories.depth1.map((item) => ({
    label: item[`name_${lang}`],
    value: item.id,
  }));

  const categoryDepth1Watch = form.watch('category_1');

  const categoryDepth2 = categories.depth2
    .filter((item) => item.parent === categoryDepth1Watch)
    .map((item) => ({
      label: item[`name_${lang}`],
      value: item.id,
    }));

  useEffect(() => {
    form.setValue('category_2', '');
  }, [categoryDepth1Watch]);

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

    toast.success(`${data.question} FAQ가 ${id ? '수정' : '생성'}되었습니다.`);

    const categoryParam = qs.get('category');

    if (categoryParam) {
      qs.set({
        category: data.category_1,
        page: 1,
      });
    }

    setSheetOpen(false);
  };

  return (
    <Form {...form}>
      <form action={form.handleSubmit(onSubmit)} className={cn('space-y-10')}>
        <Fieldset>
          <div className={cn('space-y-2')}>
            <FieldBlock
              control={form.control}
              name="category_1"
              label="카테고리"
              render={({ field }) => (
                <FormSelect {...field} options={categoryDepth1} onValueChange={field.onChange} />
              )}
            />
            {categoryDepth2.length > 0 && (
              <FieldBlock
                control={form.control}
                name="category_2"
                render={({ field }) => (
                  <FormSelect {...field} options={categoryDepth2} onValueChange={field.onChange} />
                )}
              />
            )}
          </div>
          <FieldBlock
            control={form.control}
            name="question"
            label="질문"
            render={({ field }) => <Input {...field} />}
          />
          <FieldBlock
            label="답변"
            name="answer"
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
