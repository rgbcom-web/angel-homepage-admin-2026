'use server';

import { createAdminClient } from '@/service/db/supabase/server';
import { z } from 'zod';
import { transformZodErrors } from '@/shared/lib/validation.utils';
import { formSchema } from '../schema';
import bcrypt from 'bcrypt';

export async function updateItem(data, table_id, tableName) {
  try {
    // 유효성 검사
    const validationResult = formSchema.safeParse(data);
    if (!validationResult.success) {
      throw validationResult.error;
    }

    const { data: validatedData } = validationResult;
    const { email } = validatedData;

    const supa = await createAdminClient();

    const query = supa.from(tableName).update({ email }).eq('table_id', table_id);

    const { error } = await query;

    if (error) {
      throw error;
    }

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
