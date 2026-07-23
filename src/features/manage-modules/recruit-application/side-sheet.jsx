'use client';

import { SideSheet } from '@/features/components/sheet';
import { DetailView } from './detail-view';

export function ManageModuleSideSheet() {
  const title = '지원 내역 상세';

  return <SideSheet title={title} body={<DetailView />} size="sm" />;
}
