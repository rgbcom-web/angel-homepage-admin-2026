'use client';

import { cn } from '@/shared/lib/utils';
import moment from 'moment';
import { ManageModuleSideSheet } from './side-sheet';
import { DefaultList, EscapeRowClick } from '@/features/manage-modules/components/list';
import {
  DeleteButton,
  ModifyButton,
  UpdateContactStatusDropdown,
} from '@/features/manage-modules/components/ui';
import { Badge } from '@/shared/shadcn/components/ui/badge';
import { ChangeOrderButton } from '@/features/manage-modules/components/list';
import { useManageModuleContext } from '@/features/manage-modules/components/manage-modules.context';
import { ViewDownloadRequestsButton } from './download-requests/view-download-requests-button';
import { VerticalSeparator } from '@/shared/shadcn/components/ui/separator';

const columns = [
  {
    header: '순서변경',
    accessorKey: 'order-change',
    width: 'w-[80px] text-center',
    cell: ({ row, table }) => {
      const { tableName } = useManageModuleContext();
      return <ChangeOrderButton tableName={tableName} row={row} table={table} />;
    },
  },
  {
    header: '카테고리',
    accessorKey: 'category',
    width: 'w-[80px]',
    cell: ({ row }) => {
      const { category } = row.original;
      return (
        <Badge variant="defaultLight" className={cn('w-full justify-center')}>
          {category.toUpperCase()}
        </Badge>
      );
    },
  },
  { header: '제목', accessorKey: 'title', width: 'w-[500px]' },
  {
    header: '발행일자',
    accessorKey: 'published_at',
    width: 'w-[150px] text-center',
    cell: ({ row }) => {
      const { published_at } = row.original;
      return <span>{moment(published_at).format('YYYY-MM-DD')}</span>;
    },
  },
  {
    header: '메뉴',
    accessorKey: 'menu',
    cell: ({ row }) => {
      const { id, title } = row.original;
      return (
        <EscapeRowClick className="flex gap-1">
          <ModifyButton id={id} />
          <DeleteButton
            id={id}
            successMessage={`"${title}" 게시글이 삭제되었습니다.`}
            dialogTitle={`게시글 삭제`}
            dialogDescription={`정말 "${title}" 게시글을 삭제하시겠습니까? 삭제시 요청 목록도 삭제되며 복구할 수 없습니다.`}
          />
          <VerticalSeparator />
          <ViewDownloadRequestsButton id={id} />
        </EscapeRowClick>
      );
    },
  },
];

export function List({ list, total }) {
  return (
    <DefaultList data={list} columns={columns} total={total} sheet={<ManageModuleSideSheet />} />
  );
}
