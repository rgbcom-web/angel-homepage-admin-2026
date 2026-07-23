'use client';

import { useSheet, SideSheet } from '@/features/components/sheet';
import { WriteForm } from './write-form';

export function ManageModuleSideSheet() {
  const { sheetData } = useSheet();

  const { id } = sheetData || {};
  const title = id ? '게시글 수정' : '게시글 생성';

  return <SideSheet title={title} body={<WriteForm id={id} />} size="sm" />;
}
