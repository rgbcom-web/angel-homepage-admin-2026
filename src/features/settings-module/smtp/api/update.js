'use server';

import { createAdminClient } from '@/service/db/supabase/server';
import { z } from 'zod';
import { transformZodErrors } from '@/shared/lib/validation.utils';
import { formSchema } from '../schema';
import bcrypt from 'bcrypt';

export async function updateItem(data, id, tableName) {
  try {
    // 유효성 검사
    const validationResult = formSchema.safeParse(data);
    if (!validationResult.success) {
      throw validationResult.error;
    }

    const { data: validatedData } = validationResult;
    const { smtp_password, super_admin_password, ...toUpdateData } = {
      ...validatedData,
    };

    if (smtp_password) {
      toUpdateData.smtp_password = smtp_password;
    }

    const supa = await createAdminClient();

    const authQuery = supa
      .from('admin')
      .select('password')
      .eq('id', 'admin')
      .eq('super_admin', true)
      .single();

    const query = supa
      .from(tableName)
      .update({ ...toUpdateData })
      .eq('id', id);

    const { data: authData, error: authError } = await authQuery;

    if (authError) {
      throw authError;
    }

    const isValid = await bcrypt.compare(super_admin_password, authData.password);

    if (!isValid) {
      throw new Error('최고관리자 계정 비밀번호가 일치하지 않습니다.');
    }

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
