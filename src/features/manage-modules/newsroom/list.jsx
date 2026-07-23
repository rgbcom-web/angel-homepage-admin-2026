'use client';

import { cn } from '@/shared/lib/utils';
import moment from 'moment';
import { ManageModuleSideSheet } from './side-sheet';
import { DefaultList, EscapeRowClick } from '@/features/manage-modules/components/list';
import { DeleteButton, ModifyButton } from '@/features/manage-modules/components/ui';
import { Badge } from '@/shared/shadcn/components/ui/badge';
import Link from 'next/link';

const columns = [
  {
    header: '번호',
    accessorKey: 'no',
    width: 'w-[80px] text-center',
  },
  {
    header: '카테고리',
    accessorKey: 'category',
    width: 'w-[100px] text-center',
    cell: ({ row }) => {
      const { category } = row.original;
      return (
        <Badge variant={category === 'news' ? 'defaultLight' : 'outline'}>
          {category.toUpperCase()}
        </Badge>
      );
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
          {fixed && <b className={cn('text-primary')}>[고정글]</b>} {title}
        </>
      );
    },
  },
  {
    header: '태그',
    accessorKey: 'tag',
    width: 'w-[200px]',
    cell: ({ row }) => {
      const { tag } = row.original;
      return <Badge variant="outline">{tag}</Badge>;
    },
  },
  {
    header: '링크',
    accessorKey: 'link',
    width: 'w-[200px]',
    cell: ({ row }) => {
      const { link } = row.original;
      return (
        <EscapeRowClick>
          <Link href={link} target="_blank" className={cn('lineclamp-1 break-all')}>
            {link}
          </Link>
        </EscapeRowClick>
      );
    },
  },
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
