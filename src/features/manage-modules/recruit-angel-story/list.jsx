'use client';

import moment from 'moment';
import { ManageModuleSideSheet } from './side-sheet';
import { COLOR_CLASS_MAP } from './write-form';
import { Badge } from '@/shared/shadcn/components/ui/badge';
import { DefaultList, EscapeRowClick } from '@/features/manage-modules/components/list';
import { DeleteButton, ModifyButton } from '@/features/manage-modules/components/ui';

const columns = [
  {
    header: '번호',
    accessorKey: 'no',
    width: 'w-[80px] text-center',
  },
  {
    header: '카테고리',
    accessorKey: 'category',
    width: 'w-[150px]',
    cell: ({ row }) => {
      const { category } = row.original;
      return <Badge className={COLOR_CLASS_MAP[category.color]}>{category.name}</Badge>;
    },
  },
  {
    header: '제목',
    accessorKey: 'title',
    width: 'w-[500px]',
    cell: ({ row }) => {
      const { title, fixed } = row.original;
      return (
        <>
          {fixed && <b className={'text-primary'}>[고정글]</b>} {title}
        </>
      );
    },
  },
  { header: '태그', accessorKey: 'tag', width: 'w-[200px]' },
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
