'use client';

import { createClient } from '../db/supabase/client';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET;

/**
 * 파일을 스토리지에 업로드하고 업로드된 파일 정보를 반환합니다.
 * 파일 업로드는 서버 부하를 줄이기 위해 클라이언트에서 처리합니다.
 * @param {Object} validatedData - 유효성 검사가 완료된 데이터 객체
 * @param {Object} validatedData.files - 업로드할 파일 객체들
 * @param {string} uploadPath - 파일이 업로드될 스토리지 경로
 * @returns {Promise<Object>} 업로드된 파일 정보가 포함된 데이터 객체
 */
export async function uploadFileToStorageClient(validatedData, uploadPath) {
  const db = createClient();

  // 클라이언트 요청 데이터에서 파일 필드 분리
  const { files, ...restData } = validatedData;

  if (!files) {
    return restData;
  }

  try {
    // 파일 필드 평탄화
    const flattenedFiles = Object.entries(files).flatMap(([key, fileOrArray]) => {
      const fileArray = Array.isArray(fileOrArray) ? fileOrArray : [fileOrArray];
      return fileArray.map((file) => ({ key, file }));
    });

    const fileFieldKeys = Object.keys(files);

    // 삭제할 파일 경로 배열 저장
    const toDeleteFiles = fileFieldKeys
      .map((key) => {
        if (Array.isArray(restData[key])) {
          const del = restData[key]
            .filter((file) => file && file.deleted)
            .map((file) => file.filePath);

          return del;
        } else {
          if (restData[key] && restData[key].deleted) {
            return restData[key].filePath;
          }
        }
      })
      .flat();

    // 삭제할 파일 스토리지에서 삭제
    if (toDeleteFiles.length > 0) {
      await db.storage.from(BUCKET_NAME).remove(toDeleteFiles);
    }

    // 업로드할 파일이 없으면 deleted 체크된 항목 제거하고 데이터 반환
    const isAllEmpty = flattenedFiles.every(({ file }) => !file);
    if (isAllEmpty) {
      fileFieldKeys.forEach((key) => {
        if (Array.isArray(restData[key])) {
          restData[key] = restData[key].filter((v) => v && !v.deleted);

          if (restData[key].length === 0) {
            restData[key] = null;
          }
        } else {
          if (restData[key] && restData[key].deleted) {
            restData[key] = null;
          }
        }
      });

      return restData;
    }

    // 파일 업로드 프로미스 배열 생성
    const uploadPromises = flattenedFiles.map(async ({ key, file }) => {
      if (!file) {
        return { key, result: null };
      }

      const { name: originalName } = file;
      const extension = originalName.split('.').pop();
      const newFileName = `${key}-${uuidv4()}.${extension}`;
      const filePath = `${uploadPath}/${newFileName}`;

      const { data, error } = await db.storage.from(BUCKET_NAME).upload(filePath, file);

      if (error) {
        console.error(`파일 업로드 실패: ${filePath}`, error);
        return { key, result: null }; // 실패한 경우 null 반환
      }

      return {
        key,
        result: {
          originalName,
          filePath,
        },
      };
    });

    // 파일 업로드 프로미스 배열 실행
    const uploadResultsArray = await Promise.allSettled(uploadPromises);

    // 파일 업로드 결과 파싱
    const uploadResults = uploadResultsArray.reduce((acc, { status, value }) => {
      if (status === 'fulfilled') {
        !acc[value.key] && (acc[value.key] = []);
        acc[value.key].push(value.result);
      }
      return acc;
    }, {});

    // 각 필드가 배열이 아닌 경우 단일 객체로 변환
    Object.keys(uploadResults).forEach((key) => {
      if (uploadResults[key].length === 1 && !Array.isArray(files[key])) {
        uploadResults[key] = uploadResults[key][0];
      }
    });

    /**
     * 클라이언트에서 files 필드로 넘겨받은 파일들의 업로드 결과를 key => 필드명으로 파싱하여 DB에 저장
     * ex)
     * 요청 : { ... , files: { thumbnail: File } }
     * 결과 : { ... , thumbnail: { filePath: '...', originalName: '...' } }
     * ** 배열 필드인 경우, deleted 체크 여부에 따라 신규 데이터와 병합
     * *** 빈 값은 제거하고 각 항목의 deleted 필드는 제거함
     */
    Object.entries(uploadResults).forEach(([key, value]) => {
      if (Array.isArray(uploadResults[key])) {
        restData[key] = uploadResults[key]
          .map((v, index) => {
            if (v) {
              return v;
            } else if (restData[key]?.[index] && restData[key]?.[index]?.deleted) {
              return null;
            }
            return restData[key]?.[index] ?? null;
          })
          .filter((v) => v);

        // 배열 필드가 빈 배열인 경우 null로 변환
        if (restData[key].length === 0) {
          restData[key] = null;
        }
      } else {
        if (value) {
          restData[key] = value;
        } else if (restData[key] && restData[key].deleted) {
          restData[key] = null;
        }
        if (restData[key]) {
          delete restData[key].deleted;
        }
      }
    });

    // 파싱된 데이터 반환하여 데이터베이스 저장에 사용
    return restData;
  } catch (error) {
    console.error('파일 업로드 에러 : ', error);

    // 에러 발생시 데이터 반환하여 데이터베이스 저장에 사용
    return restData;
  }
}
