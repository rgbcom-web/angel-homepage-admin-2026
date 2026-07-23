'use client';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/shadcn/components/ui/button';
import { DownloadFileButton } from '@/service/api/download-file-button';
import { ArrowDownToLine } from 'lucide-react';

export function FileList({ files }) {
  if (!files || files?.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {files.map((file, index) => (
        <li key={index}>
          <DownloadFileButton file={file} className={cn('flex items-center')}>
            <Button asChild variant="link" size="sm">
              <span>
                <ArrowDownToLine className="h-4 w-4" />
                {file.originalName}
              </span>
            </Button>
          </DownloadFileButton>
        </li>
      ))}
    </ul>
  );
}
