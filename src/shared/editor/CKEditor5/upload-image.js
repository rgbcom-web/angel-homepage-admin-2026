'use client';

import { createClient } from '@/service/db/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { getByteSize, splitFileName, markFileName } from '@/shared/lib/files.utils';

const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_MAX_SIZE = getByteSize(2);

/**
 * @param {Object} [uploadTarget] 업로드 대상 지정 ({ createClient, bucket }).
 *   생략하면 기본 Supabase 프로젝트·버킷에 올립니다.
 */
export async function uploadImage(formData, uploadTarget) {
  try {
    const bucketName = uploadTarget?.bucket || BUCKET_NAME;
    if (!bucketName) {
      throw new Error('업로드할 스토리지 버킷 설정이 없습니다.');
    }

    // 업로드 대상이 지정된 경우 그 프로젝트의 클라이언트를 씁니다.
    // 설정이 없으면 createClient 가 던지므로 try 안에서 만듭니다.
    const supabase = uploadTarget?.createClient ? uploadTarget.createClient() : createClient();

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

    const storage = supabase.storage.from(bucketName);
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
