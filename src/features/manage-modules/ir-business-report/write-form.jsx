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
import { uploadFileToStorageClient } from '@/service/api/upload-file-to-storage-client';

import { toast } from 'sonner';
import { Input, FileInput } from '@/shared/shadcn/components/ui/input';
import { DatePicker } from '@/shared/shadcn/components/ui/date-picker';

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

    if (!id) {
      qs.set({
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
            name="published_at"
            label="발행일자"
            render={({ field }) => <DatePicker field={field} />}
          />
          <FieldBlock
            control={form.control}
            name="title"
            label="제목"
            render={({ field }) => <Input {...field} />}
          />
          <div className={cn('space-y-2')}>
            <FieldBlock
              control={form.control}
              name="files.attachments.0"
              label="첨부파일"
              description="첨부파일은 20MB 이하의 이미지, PDF, 문서, 엑셀, PPT 파일만 가능합니다."
              required
              render={({ field }) => <FileInput {...field} />}
            />
          </div>
        </Fieldset>
        <div className={cn('sticky bottom-0 z-[200] bg-white py-4')}>
          <FormSubmit className={cn('w-full')}>저장</FormSubmit>
        </div>
      </form>
    </Form>
  );
}
