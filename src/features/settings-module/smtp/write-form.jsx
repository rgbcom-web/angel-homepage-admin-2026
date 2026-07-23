'use client';

import { cn } from '@/shared/lib/utils';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { setFieldErrors } from '@/shared/lib/validation.utils';
import { Form, Fieldset, FieldBlock, FormSubmit } from '@/shared/shadcn/components/ui/form';
import { formSchema, getDefaultValues } from './schema';
import { getItemById, updateItem } from './api';

import { FormFieldSkeleton } from '@/shared/shadcn/components/ui/skeleton';

import { toast } from 'sonner';
import { Input } from '@/shared/shadcn/components/ui/input';

import { useAuth } from '@/features/auth/AuthSessionProvider';

export function SetSMTPForm({ onSuccess }) {
  const { user } = useAuth();

  if (!user.super_admin) {
    return null;
  }

  const id = 1;
  const tableName = process.env.NEXT_PUBLIC_SMTP_TABLE_NAME;
  const [pending, setPending] = useState(true);

  const form = useForm({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    const loadPrevData = async () => {
      const { data, errors } = await getItemById(tableName, id);
      form.reset(data);
      setPending(false);
    };
    loadPrevData();
  }, []);

  const onSubmit = async (data) => {
    const { success, errors } = await updateItem(data, id, tableName);

    if (!success) {
      setFieldErrors(form, errors);

      if (errors.message) {
        toast.error(errors.message);
      }

      return;
    }

    toast.success(`SMTP 설정이 저장되었습니다.`);

    onSuccess?.();
  };

  if (pending) {
    return (
      <div className={cn('grid gap-6')}>
        <FormFieldSkeleton />
        <FormFieldSkeleton />
        <FormFieldSkeleton />
        <FormFieldSkeleton />
        <FormFieldSkeleton />
        <FormFieldSkeleton />
        <FormFieldSkeleton />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form action={form.handleSubmit(onSubmit)} className={cn('space-y-10')}>
        <Fieldset>
          <FieldBlock
            control={form.control}
            name="smtp_host"
            label="SMTP 호스트"
            render={({ field }) => <Input {...field} />}
          />
          <FieldBlock
            control={form.control}
            name="smtp_secure"
            label="SMTP 보안"
            render={({ field }) => <Input {...field} />}
          />
          <FieldBlock
            label="SMTP 포트"
            name="smtp_port"
            render={({ field }) => <Input type="int" {...field} />}
          />
          <FieldBlock
            label="SMTP 아이디"
            name="smtp_user"
            render={({ field }) => <Input {...field} />}
          />
          <FieldBlock
            label="SMTP 비밀번호"
            name="smtp_password"
            render={({ field }) => <Input type="password" {...field} />}
          />
          <FieldBlock
            label="최고관리자 계정 비밀번호"
            name="super_admin_password"
            render={({ field }) => <Input type="password" {...field} />}
          />
        </Fieldset>
        <div className={cn('sticky bottom-0 !mt-0 bg-white py-6')}>
          <FormSubmit className={cn('w-full')}>저장</FormSubmit>
        </div>
      </form>
    </Form>
  );
}
