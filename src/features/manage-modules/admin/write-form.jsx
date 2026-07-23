'use client';

import { cn } from '@/shared/lib/utils';
import { useEffect } from 'react';
import { useManageModuleContext } from '@/features/manage-modules/components/manage-modules.context';
import { usePathname } from 'next/navigation';
import { useSheet } from '@/features/components/sheet';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { setFieldErrors } from '@/shared/lib/validation.utils';
import { Form, Fieldset, FieldBlock, FormSubmit } from '@/shared/shadcn/components/ui/form';
import { createSchema, updateSchema, getDefaultValues } from './schema';
import { createItem, getItemById, updateItem } from './api';

import { toast } from 'sonner';
import { Input } from '@/shared/shadcn/components/ui/input';

export function WriteForm({ id }) {
  const { setSheetOpen } = useSheet();
  const pathname = usePathname();
  const { tableName } = useManageModuleContext();

  const form = useForm({
    mode: 'onChange',
    resolver: zodResolver(id ? updateSchema : createSchema),
    defaultValues: getDefaultValues(),
  });

  const superAdmin = form.watch('super_admin');

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
      ? await updateItem(data, tableName, pathname)
      : await createItem(data, tableName, pathname);

    if (!success) {
      setFieldErrors(form, errors);

      if (errors.message) {
        toast.error(errors.message);
      }

      return;
    }

    toast.success(`${data.id} 관리자가 ${id ? '수정' : '생성'}되었습니다.`);

    setSheetOpen(false);
  };

  return (
    <Form {...form}>
      <form action={form.handleSubmit(onSubmit)} className={cn('space-y-10')}>
        <Fieldset>
          <FieldBlock
            control={form.control}
            name="id"
            label="아이디"
            render={({ field }) => <Input {...field} disabled={!!id} />}
          />
          <FieldBlock
            label="이름"
            name="name"
            render={({ field }) => <Input {...field} disabled={superAdmin} />}
          />
          <FieldBlock
            label="비밀번호"
            name="password"
            render={({ field }) => <Input type="password" {...field} />}
          />
        </Fieldset>
        <div className={cn('sticky bottom-0 z-[200] bg-white py-4')}>
          <FormSubmit className={cn('w-full')}>저장</FormSubmit>
        </div>
      </form>
    </Form>
  );
}
