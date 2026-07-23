'use server';

import { createAdminClient } from '@/service/db/supabase/server';

export async function getData(tableName) {
  try {
    const supa = await createAdminClient();

    const query = supa
      .from(tableName)
      .select('*')
      .order('order', { ascending: true })
      .order('id', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // email필드가 배열이 아닌 경우 배열로 변환
    const dataWithArrayEmail = data.map((item) => ({
      ...item,
      email: Array.isArray(item.email) ? item.email : item.email ? [item.email] : [],
    }));

    return { data: dataWithArrayEmail };
  } catch (error) {
    console.error(error.message);
    return {
      errors: {
        message: '서버 오류가 발생했습니다.',
      },
    };
  }
}
