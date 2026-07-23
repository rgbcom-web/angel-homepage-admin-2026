'use client';

import { useSheet, SideSheet } from '@/features/components/sheet';
import { WriteForm } from './write-form';

export function ManageModuleSideSheet() {
  const { sheetData } = useSheet();

  const { id } = sheetData || {};
  const title = id ? '도입 병원 수정' : '도입 병원 생성';

  return <SideSheet title={title} body={<WriteForm id={id} />} size="sm" />;
}
