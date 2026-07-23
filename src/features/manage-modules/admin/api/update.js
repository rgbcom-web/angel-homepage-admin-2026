'use server';

import { createAdminClient } from '@/service/db/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { transformZodErrors } from '@/shared/lib/validation.utils';
import { updateSchema } from '../schema';
import { hash } from 'bcrypt';

export async function updateItem(data, tableName, pathToRevalidate) {
  try {
    // 유효성 검사
    const validationResult = updateSchema.safeParse(data);
    if (!validationResult.success) {
      throw validationResult.error;
    }

    const { data: validatedData } = validationResult;
    const { password, id, super_admin, ...toUpdateData } = validatedData;

    if (password) {
      toUpdateData.password = await hash(password, 10);
    }

    const supa = await createAdminClient();

    const query = supa
      .from(tableName)
      .update({ ...toUpdateData })
      .eq('id', id);

    const { error } = await query;

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

    if (error.code === '23505') {
      return {
        success: false,
        errors: {
          message: '이미 존재하는 아이디입니다.',
        },
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
