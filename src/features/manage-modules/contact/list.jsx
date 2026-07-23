'use client';

import moment from 'moment';
import { ManageModuleSideSheet } from './side-sheet';
import { DefaultList, EscapeRowClick } from '@/features/manage-modules/components/list';
import {
  DeleteButton,
  ModifyButton,
  UpdateContactStatusDropdown,
} from '@/features/manage-modules/components/ui';
import { Badge } from '@/shared/shadcn/components/ui/badge';
import { useParams } from 'next/navigation';

const columns = (lang) => [
  {
    header: '번호',
    accessorKey: 'no',
    width: 'w-[80px] text-center',
  },
  {
    header: '문의분류',
    accessorKey: 'category',
    width: 'w-[100px]',
    cell: ({ row }) => {
      const { category } = row.original;
      return <Badge variant="defaultLight">{category}</Badge>;
    },
  },
  {
    header: '문의제품',
    accessorKey: 'product',
    width: 'w-[150px]',
    cell: ({ row }) => {
      const { product } = row.original;
      return product ? <Badge variant="secondary">{product.toUpperCase()}</Badge> : '-';
    },
  },
  { header: '이름', accessorKey: 'name', width: 'w-[150px]' },
  { header: '이메일', accessorKey: 'email', width: 'w-[150px]' },
  { header: '연락처', accessorKey: 'contact', width: 'w-[150px]' },
  { header: '회사명', accessorKey: 'company', width: 'w-[150px]' },
  lang === 'ko'
    ? {
        header: '개인정보',
        accessorKey: 'privacy',
        width: 'w-[110px] text-center',
        cell: ({ row }) => {
          const { privacy } = row.original;
          return (
            <Badge variant={privacy ? 'positiveLight' : 'destructiveLight'}>
              {privacy ? '동의' : '미동의'}
            </Badge>
          );
        },
      }
    : {
        header: '국가',
        accessorKey: 'country',
        width: 'w-[110px]',
      },
  {
    header: '접수일자',
    accessorKey: 'created_at',
    width: 'w-[140px] text-center',
    cell: ({ row }) => {
      const { created_at } = row.original;
      return <span>{moment(created_at).format('YYYY-MM-DD')}</span>;
    },
  },
  {
    header: '문의상태',
    accessorKey: 'status',
    width: 'w-[150px]',
    cell: ({ row }) => {
      const { id, status } = row.original;
      return (
        <EscapeRowClick className="flex gap-1">
          <UpdateContactStatusDropdown id={id} status={status} />
        </EscapeRowClick>
      );
    },
  },
  {
    header: '메뉴',
    accessorKey: 'menu',
    cell: ({ row }) => {
      const { id, name, company } = row.original;
      const title = `${name} (${company})`;
      return (
        <EscapeRowClick className="flex gap-1">
          <ModifyButton id={id}>내용 보기</ModifyButton>
          <DeleteButton
            id={id}
            successMessage={`"${title}" 님의 문의가 삭제되었습니다.`}
            dialogTitle={`문의 삭제`}
            dialogDescription={`정말 "${title}" 님의 문의를 삭제하시겠습니까?`}
          />
        </EscapeRowClick>
      );
    },
  },
];

export function List({ list, total }) {
  const { lang } = useParams();
  return (
    <DefaultList
      data={list}
      columns={columns(lang)}
      total={total}
      sheet={<ManageModuleSideSheet />}
    />
  );
}
