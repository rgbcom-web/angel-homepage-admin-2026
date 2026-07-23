'use client';

import { cn } from '@/shared/lib/utils';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { setFieldErrors } from '@/shared/lib/validation.utils';
import { Form, Fieldset, FieldBlock, FormSubmit } from '@/shared/shadcn/components/ui/form';
import { getData, updateItem } from './api';
import { formSchema } from './schema';

import { FormFieldSkeleton } from '@/shared/shadcn/components/ui/skeleton';

import { toast } from 'sonner';
import { TagsInput } from '@/shared/shadcn/components/ui/tags-input';

import { useAuth } from '@/features/auth/AuthSessionProvider';

export function AlimMailRecipientsForm({ onSuccess }) {
  const { user } = useAuth();

  if (!user.super_admin) {
    return null;
  }

  const tableName = process.env.NEXT_PUBLIC_ALIM_MAIL_RECIPIENTS_TABLE_NAME;

  const [data, setData] = useState(null);

  useEffect(() => {
    const loadPrevData = async () => {
      const { data, errors } = await getData(tableName);
      setData(data);
    };
    loadPrevData();
  }, []);

  if (!data) {
    return (
      <div className={cn('grid gap-6')}>
        <FormFieldSkeleton />
        <FormFieldSkeleton />
        <FormFieldSkeleton />
      </div>
    );
  }

  return (
    <div className={cn('grid gap-6')}>
      {data.map((row) => (
        <FormElement key={row.table_id} row={row} onSuccess={onSuccess} tableName={tableName} />
      ))}
    </div>
  );
}

function FormElement({ row, onSuccess, tableName }) {
  const { table_title, table_id, email } = row;

  const form = useForm({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      table_id,
      email,
    },
  });

  useEffect(() => {
    form.reset({
      table_id,
      email,
    });
  }, [row]);

  console.log(form.formState.errors);

  const onSubmit = async (data) => {
    const { success, errors } = await updateItem(data, table_id, tableName);

    if (!success) {
      setFieldErrors(form, errors);

      if (errors.message) {
        toast.error(errors.message);
      }

      return;
    }

    toast.success(`${table_title} 알림메일 수신자 정보가 저장되었습니다.`);
  };

  return (
    <Form {...form}>
      <form action={form.handleSubmit(onSubmit)} className={cn('space-y-10')}>
        <Fieldset className={cn('flex gap-2')}>
          <FieldBlock
            control={form.control}
            name="email"
            label={table_title}
            render={({ field }) => (
              <div className={cn('flex gap-2')}>
                <div className={cn('w-full')}>
                  <TagsInput {...field} />
                </div>
                <FormSubmit className={cn('')}>저장</FormSubmit>
              </div>
            )}
          />
        </Fieldset>
      </form>
    </Form>
  );
}
