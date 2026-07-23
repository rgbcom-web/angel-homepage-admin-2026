'use server';

import { createAdminClient } from '@/service/db/supabase/server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { transformZodErrors } from '@/shared/lib/validation.utils';
import { writeSchema } from '../schema';

export async function createItem(formData, tableName, pathToRevalidate) {
  try {
    // 유효성 검사
    const validationResult = writeSchema.safeParse(formData);
    if (!validationResult.success) {
      throw validationResult.error;
    }

    const supa = await createAdminClient();

    const query = supa.from(tableName).insert({
      ...validationResult.data,
    });

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // 페이지 리렌더링
    pathToRevalidate && revalidatePath(pathToRevalidate);

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: transformZodErrors(error),
      };
    }

    return {
      success: false,
      errors: {
        message: error.message || '서버 오류가 발생했습니다.',
      },
    };
  }
}
