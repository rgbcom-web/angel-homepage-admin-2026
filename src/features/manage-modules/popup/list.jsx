'use client';

import { ManageModuleSideSheet } from './side-sheet';
import { DefaultList, EscapeRowClick } from '@/features/manage-modules/components/list';
import { DeleteButton, ModifyButton } from '@/features/manage-modules/components/ui';
import { Badge } from '@/shared/shadcn/components/ui/badge';

const columns = [
  {
    header: '번호',
    accessorKey: 'no',
    width: 'w-[80px] text-center',
  },
  { header: '제목', accessorKey: 'title', width: 'w-[300px]' },
  {
    header: '게시상태',
    accessorKey: 'display',
    width: 'w-[100px] text-center',
    cell: ({ row }) => {
      const { disabled } = row.original;
      return (
        <Badge variant={disabled ? 'destructiveLight' : 'positiveLight'}>
          {disabled ? '비활성화' : '활성화'}
        </Badge>
      );
    },
  },
  {
    header: '노출기간',
    accessorKey: 'period',
    width: 'w-[300px] text-center',
    cell: ({ row }) => {
      const { start_date, end_date, always_display } = row.original;
      return <span>{always_display ? '항시노출' : `${start_date} ~ ${end_date}`}</span>;
    },
  },
  {
    header: '너비',
    accessorKey: 'width',
    width: 'w-[80px] text-center',
    cell: ({ row }) => {
      const { width } = row.original;
      return <span>{width}px</span>;
    },
  },
  {
    header: '왼쪽',
    accessorKey: 'left',
    width: 'w-[80px] text-center',
    cell: ({ row }) => {
      const { left } = row.original;
      return <span>{left}px</span>;
    },
  },
  {
    header: '위쪽',
    accessorKey: 'top',
    width: 'w-[80px] text-center',
    cell: ({ row }) => {
      const { top } = row.original;
      return <span>{top}px</span>;
    },
  },
  {
    header: '순서',
    accessorKey: 'z_index',
    width: 'w-[80px] text-center',
    cell: ({ row }) => {
      const { z_index } = row.original;
      return <span>{z_index}</span>;
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
            successMessage={`"${title}" 팝업이 삭제되었습니다.`}
            dialogTitle={`팝업 삭제`}
            dialogDescription={`정말 "${title}" 팝업을 삭제하시겠습니까?`}
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
