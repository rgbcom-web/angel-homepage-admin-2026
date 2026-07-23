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
    header: '도입제품',
    accessorKey: 'products',
    width: 'w-[300px]',
    cell: ({ row }) => {
      const { products } = row.original;
      return (
        <span className="flex flex-wrap gap-1">
          {products?.map((product) => (
            <Badge key={product} variant="defaultLight">
              {product}
            </Badge>
          ))}
        </span>
      );
    },
  },
  { header: '병원명', accessorKey: 'name', width: 'w-[200px]' },
  {
    header: '주소',
    accessorKey: 'address',
    width: 'w-[300px]',
    cell: ({ row }) => {
      const { address, detail_address } = row.original;
      return (
        <span>
          {address}
          {detail_address && ` ${detail_address}`}
        </span>
      );
    },
  },
  { header: '전화번호', accessorKey: 'tel', width: 'w-[150px]' },
  {
    header: '수정/삭제',
    accessorKey: 'menu',
    width: 'w-auto',
    cell: ({ row }) => {
      const { id, name } = row.original;
      return (
        <EscapeRowClick className="flex gap-1">
          <ModifyButton id={id} />
          <DeleteButton
            id={id}
            successMessage={`"${name}" 병원정보가 삭제되었습니다.`}
            dialogTitle={`병원 삭제`}
            dialogDescription={`정말 "${name}" 병원정보를 삭제하시겠습니까?`}
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
