'use client';

import { cn } from '@/shared/lib/utils';
import { getFileDownloadUrl } from './download-file';
import { saveAs } from 'file-saver';
import { useState } from 'react';

export function DownloadFileButton({ file, children, className, ...props }) {
  const [pending, setPending] = useState(false);

  const handleDownload = async () => {
    setPending(true);

    try {
      const { data, errors } = await getFileDownloadUrl(file.filePath);

      if (errors) {
        window.alert('파일 다운로드 URL 생성 중 에러가 발생했습니다.');
        setPending(false);
        return;
      }

      if (data && data.url) {
        // URL에서 파일 가져오기
        const response = await fetch(data.url);
        const blob = await response.blob();

        // file-saver로 원본 파일명 지정하여 저장
        saveAs(blob, file.originalName);
      }
    } catch (error) {
      console.error('다운로드 오류:', error);
      window.alert('파일 다운로드 중 에러가 발생했습니다.');
    } finally {
      setPending(false);
    }
  };

  return (
    <button onClick={handleDownload} className={cn(className)} {...props} disabled={pending}>
      {typeof children === 'function' ? children({ pending }) : children}
    </button>
  );
}
