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
import { CheckboxWithLabel } from '@/shared/shadcn/components/ui/checkbox';
import { DatePicker } from '@/shared/shadcn/components/ui/date-picker';
import { buttonVariants } from '@/shared/shadcn/components/ui/button';
import { ANGEL_STORY_CATEGORY_LIST, ANGEL_STORY_COLOR_LIST } from '@/app/app-constants';

export const COLOR_CLASS_MAP = {
  blue: 'bg-brand-blue',
  mint: 'bg-brand-mint',
  orange: 'bg-brand-orange',
  pink: 'bg-brand-pink',
  gray: 'bg-brand-gray',
};

export const BORDER_CLASS_MAP = {
  blue: 'border-brand-blue',
  mint: 'border-brand-mint',
  orange: 'border-brand-orange',
  pink: 'border-brand-pink',
  gray: 'border-brand-gray',
};

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

  const categoryWatch = form.watch('category');
  const predefinedCategories = ANGEL_STORY_CATEGORY_LIST.slice(0, -1);
  const isCustomInput = !predefinedCategories.some((cat) => cat.name === categoryWatch?.name);

  const handleCategoryChange = (category) => {
    if (category.name === '직접입력') {
      form.setValue(
        'category',
        { name: '', color: category.color, isCustom: true },
        { shouldDirty: true },
      );
    } else {
      form.setValue(
        'category',
        { name: category.name, color: category.color, isCustom: false },
        { shouldDirty: true },
      );
    }
  };

  const handleColorChange = (color) => {
    form.setValue('category.color', color, { shouldDirty: true });
  };

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
            name="fixed"
            label="고정글"
            description="체크시 고정글로 설정됩니다."
            required
            render={({ field }) => <CheckboxWithLabel field={field} label="고정글" boxed />}
          />
          <FieldBlock
            control={form.control}
            name="published_at"
            label="발행일자"
            render={({ field }) => <DatePicker field={field} />}
          />
          <FieldBlock
            control={form.control}
            name="category"
            label="카테고리"
            required
            render={() => {
              const categoryError = form.formState.errors.category;
              return (
                <div className={cn('flex flex-wrap items-center gap-2')}>
                  {predefinedCategories.map((category) => {
                    const isSelected = categoryWatch?.name === category.name;
                    return (
                      <button
                        key={category.name}
                        type="button"
                        onClick={() => handleCategoryChange(category)}
                        className={cn(
                          'flex cursor-pointer items-center gap-2',
                          buttonVariants({ variant: 'outline' }),
                          'pl-2.5',
                          isSelected && `border-2 ${BORDER_CLASS_MAP[category.color]}`,
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-4 w-4 items-center justify-center rounded-full',
                            COLOR_CLASS_MAP[category.color],
                          )}
                        >
                          {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                        </span>
                        <span className="font-normal">{category.name}</span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => handleCategoryChange({ name: '직접입력', color: 'pink' })}
                    className={cn(
                      'flex cursor-pointer items-center gap-2',
                      buttonVariants({ variant: 'outline' }),
                      'pl-2.5',
                      isCustomInput &&
                        `border-2 ${BORDER_CLASS_MAP[categoryWatch?.color] || BORDER_CLASS_MAP.pink}`,
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded-full',
                        isCustomInput
                          ? COLOR_CLASS_MAP[categoryWatch?.color] || COLOR_CLASS_MAP.pink
                          : COLOR_CLASS_MAP.gray,
                      )}
                    >
                      {isCustomInput && <span className="h-2 w-2 rounded-full bg-white" />}
                    </span>
                    <span className="font-normal">직접입력</span>
                  </button>

                  {isCustomInput && (
                    <div
                      className={cn(
                        'flex items-center gap-1.5 rounded-md border px-2 py-1',
                        categoryError && 'border-destructive',
                      )}
                    >
                      <Input
                        value={categoryWatch?.name || ''}
                        onChange={(e) =>
                          form.setValue('category.name', e.target.value, { shouldDirty: true })
                        }
                        placeholder="카테고리명을 입력하세요"
                        className="h-7 w-40 border-0 p-0 text-sm shadow-none focus-visible:ring-0"
                        autoFocus
                      />
                      <div className="h-4 w-px bg-border" />
                      <div className="flex gap-1">
                        {ANGEL_STORY_COLOR_LIST.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => handleColorChange(color)}
                            className={cn(
                              'h-4 w-4 rounded-full transition-all',
                              COLOR_CLASS_MAP[color],
                              categoryWatch?.color === color
                                ? 'ring-1 ring-gray-400 ring-offset-1'
                                : 'hover:ring-1 hover:ring-gray-300 hover:ring-offset-1',
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }}
          />
          <FieldBlock
            control={form.control}
            name="tag"
            label="태그"
            render={({ field }) => <Input {...field} />}
          />
          <FieldBlock
            control={form.control}
            name="files.thumbnail"
            label="썸네일"
            description="권장 사이즈 : 430 x 230 px / 파일 크기 : 1MB 이하"
            required
            render={({ field }) => <FileInput {...field} />}
          />
          <FieldBlock
            control={form.control}
            name="title"
            label="제목"
            render={({ field }) => <Input {...field} />}
          />
          <FieldBlock
            label="내용"
            name="content"
            render={({ field }) => <Editor field={field} tableName={tableName} />}
          />

          <div className={cn('space-y-2')}>
            <FieldBlock
              control={form.control}
              name="files.attachments.0"
              label="첨부파일"
              description="첨부파일은 10MB 이하의 이미지, PDF, 문서, 엑셀, PPT 파일만 가능합니다."
              required
              render={({ field }) => <FileInput {...field} />}
            />
            <FieldBlock
              control={form.control}
              name="files.attachments.1"
              required
              render={({ field }) => <FileInput {...field} />}
            />
            <FieldBlock
              control={form.control}
              name="files.attachments.2"
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
