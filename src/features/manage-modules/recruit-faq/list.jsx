'use client';

import { useManageModuleContext } from '@/features/manage-modules/components/manage-modules.context';
import { ManageModuleSideSheet } from './side-sheet';
import { DefaultList, EscapeRowClick } from '@/features/manage-modules/components/list';
import { DeleteButton, ModifyButton } from '@/features/manage-modules/components/ui';
import { ChangeOrderButton } from '@/features/manage-modules/components/list';

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
  { header: '질문', accessorKey: 'question' },
  {
    header: '메뉴',
    accessorKey: 'menu',
    width: 'w-[200px]',
    cell: ({ row }) => {
      const { id, question } = row.original;
      return (
        <EscapeRowClick className="flex gap-1">
          <ModifyButton id={id} />
          <DeleteButton
            id={id}
            successMessage={`"${question}" FAQ가 삭제되었습니다.`}
            dialogTitle={`FAQ 삭제`}
            dialogDescription={`정말 "${question}" FAQ를 삭제하시겠습니까?`}
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
