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
import { uploadFileToStorageClient } from '@/service/api/upload-file-to-storage-client';

import { toast } from 'sonner';
import { Input, FileInput } from '@/shared/shadcn/components/ui/input';
import { DatePicker } from '@/shared/shadcn/components/ui/date-picker';
import { RadioSet } from '@/shared/shadcn/components/ui/radio-group';
import { CheckboxWithLabel } from '@/shared/shadcn/components/ui/checkbox';
import { NEWSROOM_CATEGORY_LIST } from '@/app/app-constants';
import { arrayToOptions } from '@/shared/lib/utils';

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
    /**
     * 파일 업로드 로직 실행
     * 파일 업로드는 서버 부하를 줄이기 위해 클라이언트에서 처리합니다.
     */
    const uploadResultData = await uploadFileToStorageClient(data, tableName);

    const { success, errors } = id
      ? await updateItem(id, uploadResultData, tableName, pathname)
      : await createItem(uploadResultData, tableName, pathname);

    if (!success) {
      setFieldErrors(form, errors);

      if (errors.message) {
        toast.error(errors.message);
      }

      return;
    }

    toast.success(`${data.title} 게시글이 ${id ? '수정' : '생성'}되었습니다.`);

    const categoryParam = qs.get('category');

    if (categoryParam) {
      qs.set({
        category: data.category,
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
            name="fixed"
            label="고정글"
            description="체크시 고정글로 설정됩니다."
            required
            render={({ field }) => <CheckboxWithLabel field={field} label="고정글" boxed />}
          />
          <FieldBlock
            control={form.control}
            name="category"
            label="카테고리"
            required
            render={({ field }) => (
              <RadioSet
                field={field}
                options={arrayToOptions(NEWSROOM_CATEGORY_LIST, false, (item) =>
                  item.toUpperCase(),
                )}
              />
            )}
          />
          <FieldBlock
            control={form.control}
            name="published_at"
            label="발행일자"
            required
            render={({ field }) => <DatePicker field={field} />}
          />
          <FieldBlock
            control={form.control}
            name="tag"
            label="태그"
            required
            render={({ field }) => <Input {...field} />}
          />
          <FieldBlock
            control={form.control}
            name="link"
            label="링크"
            required
            render={({ field }) => <Input {...field} />}
          />
          <FieldBlock
            control={form.control}
            name="title"
            label="제목"
            required
            render={({ field }) => <Input {...field} />}
          />
          <FieldBlock
            control={form.control}
            name="files.thumbnail"
            label="썸네일"
            description="권장 사이즈 : 432 x 230 px / 파일 크기 : 1MB 이하"
            required
            render={({ field }) => <FileInput {...field} />}
          />
        </Fieldset>
        <div className={cn('sticky bottom-0 z-[200] bg-white py-4')}>
          <FormSubmit className={cn('w-full')}>저장</FormSubmit>
        </div>
      </form>
    </Form>
  );
}
