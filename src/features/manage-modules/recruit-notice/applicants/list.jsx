'use client';

import moment from 'moment';
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
  { header: '이름', accessorKey: 'name', width: 'w-[150px]' },
  { header: '이메일', accessorKey: 'email', width: 'w-[200px]' },
  { header: '연락처', accessorKey: 'contact', width: 'w-[150px]' },
  {
    header: '개인정보 (필수)',
    accessorKey: 'privacy_required',
    width: 'w-[110px] text-center',
    cell: ({ row }) => {
      const { privacy_required } = row.original;
      return (
        <Badge variant={privacy_required ? 'positiveLight' : 'destructiveLight'}>
          {privacy_required ? '동의' : '미동의'}
        </Badge>
      );
    },
  },
  {
    header: '개인정보 (선택)',
    accessorKey: 'privacy_optional',
    width: 'w-[110px] text-center',
    cell: ({ row }) => {
      const { privacy_optional } = row.original;
      return (
        <Badge variant={privacy_optional ? 'positiveLight' : 'destructiveLight'}>
          {privacy_optional ? '동의' : '미동의'}
        </Badge>
      );
    },
  },
  {
    header: '민감정보 (선택)',
    accessorKey: 'privacy_sensitive',
    width: 'w-[110px] text-center',
    cell: ({ row }) => {
      const { privacy_sensitive } = row.original;
      return (
        <Badge variant={privacy_sensitive ? 'positiveLight' : 'destructiveLight'}>
          {privacy_sensitive ? '동의' : '미동의'}
        </Badge>
      );
    },
  },
  {
    header: '지원일자',
    accessorKey: 'created_at',
    width: 'w-[180px] text-center',
    cell: ({ row }) => {
      const { created_at } = row.original;
      return <span>{moment(created_at).format('YYYY-MM-DD')}</span>;
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
  return (
    <DefaultList data={list} columns={columns} total={total} sheet={<ManageModuleSideSheet />} />
  );
}
