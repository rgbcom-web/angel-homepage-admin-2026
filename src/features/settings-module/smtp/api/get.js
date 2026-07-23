'use server';

import { createAdminClient } from '@/service/db/supabase/server';

export async function getItemById(tableName, id) {
  try {
    const supa = await createAdminClient();

    const query = supa
      .from(tableName)
      .select('smtp_host, smtp_port, smtp_secure, smtp_user')
      .eq('id', id)
      .single();

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return { data };
  } catch (error) {
    console.error(error.message);
    return {
      errors: {
        message: '서버 오류가 발생했습니다.',
      },
    };
  }
}
