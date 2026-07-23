'use server';

import { createAdminClient } from '../db/supabase/server';

export async function getFileDownloadUrl(
  filePath,
  bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET,
) {
  try {
    const supabase = await createAdminClient();

    // 퍼블릭 URL 생성
    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);

    if (!data || !data.publicUrl) {
      throw new Error('파일 URL을 생성할 수 없습니다.');
    }

    return {
      data: {
        url: data.publicUrl,
      },
    };
  } catch (error) {
    console.log(error.message);

    return {
      errors: {
        message: '서버 오류가 발생했습니다.',
      },
    };
  }
}
