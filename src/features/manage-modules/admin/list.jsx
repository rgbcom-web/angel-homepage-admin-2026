'use client';

import { ManageModuleSideSheet } from './side-sheet';
import { DefaultList, EscapeRowClick } from '@/features/manage-modules/components/list';
import { DeleteButton, ModifyButton } from '@/features/manage-modules/components/ui';
import { Badge } from '@/shared/shadcn/components/ui/badge';
import { Circle, X } from 'lucide-react';

const columns = [
  {
    header: '번호',
    accessorKey: 'no',
    width: 'w-[80px] text-center',
  },
  {
    header: '아이디',
    accessorKey: 'id',
    width: 'w-[150px]',
  },
  {
    header: '이름',
    accessorKey: 'name',
    width: 'w-[250px]',
  },
  {
    header: '최고관리자',
    accessorKey: 'super_admin',
    cell: ({ row }) => {
      const { super_admin } = row.original;
      return (
        <Badge variant={super_admin ? 'positiveLight' : 'secondary'}>
          {super_admin ? '최고관리자' : '일반관리자'}
        </Badge>
      );
    },
  },
  {
    header: '메뉴',
    accessorKey: 'menu',
    cell: ({ row }) => {
      const { id, name, super_admin } = row.original;
      return (
        <EscapeRowClick className="flex gap-1">
          <ModifyButton id={id} />
          {!super_admin && (
            <DeleteButton
              id={id}
              successMessage={`"${name} (${id})" 관리자가 삭제되었습니다.`}
              dialogTitle={`관리자 삭제`}
              dialogDescription={`정말 "${name} (${id})" 관리자를 삭제하시겠습니까?`}
            />
          )}
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
