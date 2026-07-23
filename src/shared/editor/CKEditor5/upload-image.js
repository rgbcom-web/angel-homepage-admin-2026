'use client';

import { createClient } from '@/service/db/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { getByteSize, splitFileName, markFileName } from '@/shared/lib/files.utils';

const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_MAX_SIZE = getByteSize(2);

export async function uploadImage(formData) {
  const supabase = createClient();

  try {
    const { file, tableName } = Object.fromEntries(formData);

    if (!file) {
      throw new Error('파일이 없습니다.');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error('지원하지 않는 파일 형식입니다.');
    }

    if (file.size > ALLOWED_MAX_SIZE) {
      throw new Error('파일 크기가 너무 큽니다.');
    }

    if (!tableName) {
      throw new Error('업로드할 경로값이 없습니다.');
    }

    const [_, ext] = splitFileName(file.name);
    const fileName = markFileName(`${uuidv4()}.${ext}`);
    const filePath = `${tableName}/editor/${fileName}`;

    const storage = supabase.storage.from(BUCKET_NAME);
    const upload = storage.upload(filePath, file);
    const result = await upload;

    if (result.error) {
      throw new Error(result.error.message);
    }

    result.data.publicUrl = storage.getPublicUrl(result.data.path).data.publicUrl;

    return result;
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
}
