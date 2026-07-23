'use client';

import moment from 'moment';
import { DefaultList, EscapeRowClick } from '@/features/manage-modules/components/list';
import { DeleteButton, UpdateContactStatusDropdown } from '@/features/manage-modules/components/ui';
import { Badge } from '@/shared/shadcn/components/ui/badge';

const columns = [
  {
    header: '번호',
    accessorKey: 'no',
    width: 'w-[80px] text-center',
  },
  { header: '이름', accessorKey: 'name', width: 'w-[150px]' },
  { header: '이메일', accessorKey: 'email', width: 'w-[200px]' },
  { header: '연락처', accessorKey: 'contact', width: 'w-[150px]' },
  { header: '회사명', accessorKey: 'company', width: 'w-[200px]' },
  { header: '부서명', accessorKey: 'department', width: 'w-[150px]' },
  {
    header: '개인정보',
    accessorKey: 'privacy',
    width: 'w-[80px] text-center',
    cell: ({ row }) => {
      const { privacy } = row.original;
      return (
        <Badge variant={privacy ? 'positiveLight' : 'destructiveLight'}>
          {privacy ? '동의' : '미동의'}
        </Badge>
      );
    },
  },
  {
    header: '요청일자',
    accessorKey: 'created_at',
    width: 'w-[180px] text-center',
    cell: ({ row }) => {
      const { created_at } = row.original;
      return <span>{moment(created_at).format('YYYY-MM-DD')}</span>;
    },
  },
  {
    header: '요청상태',
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
      const { id, name, company, department } = row.original;
      return (
        <EscapeRowClick className="flex gap-1">
          <DeleteButton
            id={id}
            successMessage={`"${name} (${company} | ${department})" 요청이 삭제되었습니다.`}
            dialogTitle={`요청 삭제`}
            dialogDescription={`정말 "${name} (${company} | ${department})" 요청을 삭제하시겠습니까? 삭제시 복구할 수 없습니다.`}
          />
        </EscapeRowClick>
      );
    },
  },
];

export function List({ list, total }) {
  return <DefaultList data={list} columns={columns} total={total} />;
}
