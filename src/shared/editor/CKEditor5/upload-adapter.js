'use client';

import { convertFileSize, getByteSize } from '@/shared/lib/files.utils';
import { uploadImage } from './upload-image';

/**
 * @param {Object} [uploadTarget] 업로드 대상 지정 ({ createClient, bucket }).
 *   생략하면 기본 Supabase 스키마·버킷에 올립니다.
 *   전용 스키마·버킷을 쓰는 화면(BCI 자문단)에서만 넘깁니다.
 */
const customUploadAdapter = (loader, tableName, uploadTarget, maxSize = 2) => {
  return {
    async upload() {
      const file = await loader.file;

      const maxSizeByte = getByteSize(maxSize);

      if (file.size > maxSizeByte) {
        return Promise.reject(
          `${convertFileSize(maxSizeByte)} 이하의 이미지를 업로드 해주세요.\n이미지 파일은 가급적 작은 용량으로 업로드 하는 것이 좋습니다.\n현재 파일 용량: ${convertFileSize(file.size)}`,
        );
      }

      const formData = new FormData();
      formData.append('tableName', tableName);
      formData.append('file', file, encodeURIComponent(file.name));
      const { data: uploadResult, error } = await uploadImage(formData, uploadTarget);

      // 에러 처리
      if (error) {
        console.error('Upload error', error);
        return Promise.reject(`이미지 업로드에 실패했습니다.\nError message: "${error}"`);
      }

      return {
        default: uploadResult.publicUrl,
      };
    },

    abort() {
      console.log('Upload aborted');
    },
  };
};

export default customUploadAdapter;
