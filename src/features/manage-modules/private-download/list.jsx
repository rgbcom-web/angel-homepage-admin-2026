'use client';

import { ManageModuleSideSheet } from './side-sheet';
import { DefaultList, EscapeRowClick } from '@/features/manage-modules/components/list';
import { DeleteButton, ModifyButton } from '@/features/manage-modules/components/ui';
import { Badge } from '@/shared/shadcn/components/ui/badge';
import { ChangeOrderButton } from '@/features/manage-modules/components/list';
import { useManageModuleContext } from '@/features/manage-modules/components/manage-modules.context';
import { ViewDownloadListButton } from './download-list/view-download-list-button';
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
  { header: '카테고리명', accessorKey: 'title', width: 'w-[500px]' },
  {
    header: '비활성화',
    accessorKey: 'disabled',
    width: 'w-[100px]',
    cell: ({ row }) => {
      const { disabled } = row.original;
      return (
        <Badge variant={disabled ? 'destructiveLight' : 'defaultLight'}>
          {disabled ? '비활성화' : '활성화'}
        </Badge>
      );
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
            successMessage={`"${title}" 카테고리가 삭제되었습니다.`}
            dialogTitle={`카테고리 삭제`}
            dialogDescription={`정말 "${title}" 카테고리를 삭제하시겠습니까? 삭제시 하위 항목들도 삭제되며 복구할 수 없습니다.`}
          />
          <VerticalSeparator />
          <ViewDownloadListButton id={id} />
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
