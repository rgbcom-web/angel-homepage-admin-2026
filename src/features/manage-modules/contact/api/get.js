'use server';

import { createAdminClient } from '@/service/db/supabase/server';
import { setPagingIndexes } from '@/features/manage-modules/components/ui';

export async function getList(tableName, searchParams, itemsPerPage) {
  try {
    const { search, page, category } = searchParams;
    const { startIndex, endIndex } = setPagingIndexes(page, itemsPerPage);

    const supa = await createAdminClient();

    const query = supa.from(tableName).select('*', { count: 'exact' }).range(startIndex, endIndex);

    if (search) {
      query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,contact.ilike.%${search}%,title.ilike.%${search}%,content.ilike.%${search}%,company.ilike.%${search}%,product.ilike.%${search}%`,
      );
    }

    if (category) {
      query.eq('category', category);
    }

    query.order('created_at', { ascending: false });

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

export async function getItemById(tableName, id, answerTableName) {
  try {
    const supa = await createAdminClient();

    const select = `
      *,
      answerList:${answerTableName}(*)
    `;
    const query = supa
      .from(tableName)
      .select(select)
      .eq('id', id)
      .order('created_at', { foreignTable: answerTableName, ascending: false })
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
