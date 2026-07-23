'use client';

import { useSheet, SideSheet } from '@/features/components/sheet';
import { WriteForm } from './write-form';

export function ManageModuleSideSheet() {
  const { sheetData } = useSheet();

  const { id } = sheetData || {};
  const title = id ? '카테고리 수정' : '카테고리 생성';

  return <SideSheet title={title} body={<WriteForm id={id} />} size="sm" />;
}
