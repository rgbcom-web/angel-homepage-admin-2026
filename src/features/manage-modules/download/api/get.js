'use server';

import { createAdminClient } from '@/service/db/supabase/server';
import { setPagingIndexes } from '@/features/manage-modules/components/ui';
import { DOWNLOAD_CATEGORY_LIST } from '@/app/app-constants';

export async function getList(tableName, searchParams, itemsPerPage) {
  try {
    const { search, page, category = DOWNLOAD_CATEGORY_LIST[0] } = searchParams;
    const { startIndex, endIndex } = setPagingIndexes(page, itemsPerPage);

    const supa = await createAdminClient();

    const query = supa.from(tableName).select('*', { count: 'exact' }).range(startIndex, endIndex);

    if (search) {
      query.ilike('title', `%${search}%`);
    }

    if (category) {
      query.eq('category', category);
    }

    query.order('order', { ascending: false });

    const { data, count, error } = await query;

    if (error) {
      throw error;
    }

    // 데이터 가공
    data.map((item, i) => {
      item.no = count - startIndex - i;
    });

    return { data, count };
  } catch (error) {
    console.error(error.message);
    return {
      data: [],
      count: 0,
      errors: {
        message: '서버 오류가 발생했습니다.',
      },
    };
  }
}

export async function getItemById(tableName, id) {
  try {
    const supa = await createAdminClient();

    const query = supa.from(tableName).select('*').eq('id', id).single();

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
