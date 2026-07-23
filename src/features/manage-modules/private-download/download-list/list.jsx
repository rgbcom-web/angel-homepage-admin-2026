'use client';

import { ManageModuleSideSheet } from './side-sheet';
import { DefaultList, EscapeRowClick } from '@/features/manage-modules/components/list';
import { DeleteButton, ModifyButton } from '@/features/manage-modules/components/ui';
import { ChangeOrderButton } from '@/features/manage-modules/components/list';
import { Badge } from '@/shared/shadcn/components/ui/badge';
import { useManageModuleContext } from '@/features/manage-modules/components/manage-modules.context';

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
  { header: '제목', accessorKey: 'title', width: 'w-[350px]' },
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
            successMessage={`"${title}" 다운로드가 삭제되었습니다.`}
            dialogTitle={`다운로드 삭제`}
            dialogDescription={`정말 "${title}" 다운로드를 삭제하시겠습니까? 삭제시 복구할 수 없습니다.`}
          />
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
