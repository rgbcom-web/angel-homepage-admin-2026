'use server';

import { createAdminClient } from '@/service/db/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateContactStatus(id, status, tableName, pathToRevalidate) {
  try {
    // 유효성 검사
    if (!id || !tableName) {
      throw new Error('id, tableName이 필요합니다.');
    }

    const supa = await createAdminClient();

    const query = supa.from(tableName).update({ status }).eq('id', id);

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

    return {
      success: false,
      errors: {
        message: error.message || '서버 오류가 발생했습니다.',
      },
    };
  }
}
