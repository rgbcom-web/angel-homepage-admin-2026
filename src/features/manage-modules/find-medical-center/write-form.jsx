'use client';

import { cn } from '@/shared/lib/utils';
import { useEffect } from 'react';
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
import { CheckboxGroup } from '@/shared/shadcn/components/ui/checkbox';
import { AddressInput } from '@/shared/shadcn/components/ui/address-input';

import { telFilter } from '@/shared/lib/utils';

export function WriteForm({ id }) {
  const { setSheetOpen } = useSheet();
  const pathname = usePathname();
  const qs = useQueryString();
  const { tableName, productOptions } = useManageModuleContext();

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

    toast.success(`${data.name} 병원정보가 ${id ? '수정' : '생성'}되었습니다.`);

    if (!id) {
      qs.set({
        products: '',
        page: 1,
      });
    }

    setSheetOpen(false);
  };

  return (
    <Form {...form}>
      <form action={form.handleSubmit(onSubmit)} className={cn('space-y-10')}>
        <Fieldset>
          <FieldBlock
            control={form.control}
            name="products"
            label="도입제품"
            render={() => (
              <CheckboxGroup
                name="products"
                control={form.control}
                options={productOptions}
                className={{ container: 'mb-3 flex-col gap-3' }}
                boxed={false}
              />
            )}
          />
          <FieldBlock
            control={form.control}
            name="name"
            label="병원명"
            render={({ field }) => <Input {...field} />}
          />
          <FieldBlock
            control={form.control}
            name="address"
            label="주소"
            render={() => (
              <AddressInput
                addressFieldName="address"
                detailAddressFieldName="detail_address"
                sidoFieldName="sido"
                sigunguFieldName="sigungu"
              />
            )}
          />
          <FieldBlock
            control={form.control}
            name="tel"
            label="전화번호"
            render={({ field }) => (
              <Input
                {...field}
                customfilter={telFilter}
                placeholder="'-' 는 자동으로 입력됩니다."
              />
            )}
          />
        </Fieldset>
        <div className={cn('sticky bottom-0 z-[200] bg-white py-4')}>
          <FormSubmit className={cn('w-full')}>저장</FormSubmit>
        </div>
      </form>
    </Form>
  );
}
