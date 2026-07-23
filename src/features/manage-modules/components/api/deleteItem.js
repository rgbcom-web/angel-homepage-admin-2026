'use server';

import { createAdminClient } from '@/service/db/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteItem(id, tableName, pathToRevalidate) {
  try {
    if (!id) {
      return {
        errors: {
          message: 'id 값이 없습니다.',
        },
      };
    }

    const supa = await createAdminClient();

    const query = supa.from(tableName).delete().eq('id', id);

    const { error } = await query;

    if (error) {
      throw error;
    }

    pathToRevalidate && revalidatePath(pathToRevalidate);

    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      errors: {
        message: '서버 오류가 발생했습니다.',
      },
    };
  }
}
