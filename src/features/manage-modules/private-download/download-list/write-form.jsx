'use client';

import { cn } from '@/shared/lib/utils';
import { useEffect } from 'react';
import { useManageModuleContext } from '@/features/manage-modules/components/manage-modules.context';
import { usePathname, useParams } from 'next/navigation';
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
import { CheckboxWithLabel } from '@/shared/shadcn/components/ui/checkbox';

export function WriteForm({ id }) {
  const { setSheetOpen } = useSheet();
  const pathname = usePathname();
  const { categoryId } = useParams();
  const { tableName } = useManageModuleContext();

  const form = useForm({
    mode: 'onChange',
    resolver: zodResolver(writeSchema),
    defaultValues: { ...getDefaultValues(), category_id: Number(categoryId) },
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

    toast.success(`${data.title} 다운로드가 ${id ? '수정' : '생성'}되었습니다.`);

    setSheetOpen(false);
  };

  return (
    <Form {...form}>
      <form action={form.handleSubmit(onSubmit)} className={cn('space-y-10')}>
        <Fieldset>
          <FieldBlock
            control={form.control}
            name="disabled"
            label="게시상태"
            required
            render={({ field }) => <CheckboxWithLabel field={field} label="비활성화" boxed />}
          />
          <FieldBlock
            control={form.control}
            name="title"
            label="카테고리명"
            render={({ field }) => <Input {...field} />}
          />
          <FieldBlock
            control={form.control}
            name="files.thumbnail"
            label="썸네일"
            description="1MB 이하의 이미지 / 권장 사이즈 : 274x385 px"
            render={({ field }) => <FileInput {...field} />}
          />
          <FieldBlock
            control={form.control}
            name="files.attachment"
            label="첨부파일"
            description="30MB 이하의 PDF 파일"
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
