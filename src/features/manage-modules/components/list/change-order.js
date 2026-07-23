'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/service/db/supabase/server';

export async function changeOrder(tableName, currentId, targetId, pathToRevalidate) {
  try {
    if (!currentId || !targetId) {
      throw new Error('currentId 또는 targetId가 존재하지 않습니다.');
    }

    console.log(currentId, targetId);

    const supa = await createAdminClient();
    const table = () => supa.from(tableName);

    const [{ data: currentData, error: currentError }, { data: targetData, error: targetError }] =
      await Promise.all([
        table().select('*').eq('id', currentId).single(),
        table().select('*').eq('id', targetId).single(),
      ]);

    if (currentError || targetError) {
      throw new Error(
        '데이터를 조회하는 중 오류가 발생했습니다. currentError: ' +
          currentError?.message +
          ', targetError: ' +
          targetError?.message,
      );
    }

    if (!currentData || !targetData) {
      throw new Error(
        '조회된 데이터가 없습니다. currentData: ' + currentData + ', targetData: ' + targetData,
      );
    }

    const [{ error: updateError }, { error: updateTargetError }] = await Promise.all([
      table().update({ order: targetData.order }).eq('id', currentId),
      table().update({ order: currentData.order }).eq('id', targetId),
    ]);

    if (updateError || updateTargetError) {
      throw new Error(
        '순서를 업데이트하는 중 오류가 발생했습니다. updateError: ' +
          updateError?.message +
          ', updateTargetError: ' +
          updateTargetError?.message,
      );
    }

    pathToRevalidate && revalidatePath(pathToRevalidate);

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      errors: {
        message: error.message || '서버 오류가 발생했습니다.',
      },
    };
  }
}
