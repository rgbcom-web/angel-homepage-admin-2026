'use server';

import { createAdminClient } from '@/service/db/supabase/server';
import { setPagingIndexes } from '@/features/manage-modules/components/ui';

export async function getList(tableName, parentTableName, parentId, searchParams, itemsPerPage) {
  try {
    const { search, page } = searchParams;
    const { startIndex, endIndex } = setPagingIndexes(page, itemsPerPage);

    const supa = await createAdminClient();

    const parentQuery = supa.from(parentTableName).select('title').eq('id', parentId).single();
    const query = supa.from(tableName).select('*', { count: 'exact' }).range(startIndex, endIndex);

    if (search) {
      query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,contact.ilike.%${search}%,company.ilike.%${search}%`,
      );
    }

    if (parentId) {
      query.eq('parent', parentId);
    }

    query.order('id', { ascending: false });

    const { data: parentData, error: parentError } = await parentQuery;
    const { data, count, error } = await query;

    if (error) {
      throw error;
    }

    // 데이터 가공
    data.map((item, i) => {
      item.no = count - startIndex - i;
    });

    return { data, count, parentData };
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
