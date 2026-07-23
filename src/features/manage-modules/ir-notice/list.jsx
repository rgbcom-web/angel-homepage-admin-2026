'use client';

import moment from 'moment';
import { ManageModuleSideSheet } from './side-sheet';
import { DefaultList, EscapeRowClick } from '@/features/manage-modules/components/list';
import { DeleteButton, ModifyButton } from '@/features/manage-modules/components/ui';

const columns = [
  {
    header: '번호',
    accessorKey: 'no',
    width: 'w-[80px] text-center',
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
  { header: '조회수', accessorKey: 'views', width: 'w-[100px] text-center' },
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
            dialogDescription={`정말 "${title}" 게시글을 삭제하시겠습니까?`}
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
