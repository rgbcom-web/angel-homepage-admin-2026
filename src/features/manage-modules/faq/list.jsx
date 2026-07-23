'use client';

import { useManageModuleContext } from '@/features/manage-modules/components/manage-modules.context';
import { ManageModuleSideSheet } from './side-sheet';
import { DefaultList, EscapeRowClick } from '@/features/manage-modules/components/list';
import { DeleteButton, ModifyButton } from '@/features/manage-modules/components/ui';
import { Badge } from '@/shared/shadcn/components/ui/badge';
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
  {
    header: '카테고리',
    accessorKey: 'category',
    width: 'w-[250px]',
    cell: ({ row }) => {
      const { category_1_name, category_2_name } = row.original;
      return (
        <span className="flex gap-1">
          <Badge variant="defaultLight">{category_1_name}</Badge>
          {category_2_name && <Badge variant="secondary">{category_2_name}</Badge>}
        </span>
      );
    },
  },
  { header: '질문', accessorKey: 'question', width: 'w-[500px]' },
  {
    header: '메뉴',
    accessorKey: 'menu',
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
