'use server';

import { createAdminClient } from '@/service/db/supabase/server';
import { setPagingIndexes } from '@/features/manage-modules/components/ui';

export async function getList(
  tableName,
  categoryTableName,
  categoryId,
  searchParams,
  itemsPerPage,
) {
  try {
    const { search, page } = searchParams;
    const { startIndex, endIndex } = setPagingIndexes(page, itemsPerPage);

    const supa = await createAdminClient();

    const categoryQuery = supa
      .from(categoryTableName)
      .select('title')
      .eq('id', categoryId)
      .single();
    const query = supa.from(tableName).select('*', { count: 'exact' }).range(startIndex, endIndex);

    if (search) {
      query.or(`title.ilike.%${search}%`);
    }

    if (categoryId) {
      query.eq('category_id', categoryId);
    }

    query.order('order', { ascending: false });

    const { data: categoryData, error: categoryError } = await categoryQuery;
    const { data, count, error } = await query;

    if (error) {
      throw error;
    }

    // 데이터 가공
    data.map((item, i) => {
      item.no = count - startIndex - i;
    });

    return { data, count, categoryData };
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
