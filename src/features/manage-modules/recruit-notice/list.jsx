'use client';

import moment from 'moment';
import { ManageModuleSideSheet } from './side-sheet';
import { DefaultList, EscapeRowClick } from '@/features/manage-modules/components/list';
import { DeleteButton, ModifyButton } from '@/features/manage-modules/components/ui';
import { Badge } from '@/shared/shadcn/components/ui/badge';
import { ViewApplicantsButton } from './applicants/view-applicants-button';
import { VerticalSeparator } from '@/shared/shadcn/components/ui/separator';

const columns = [
  {
    header: '번호',
    accessorKey: 'no',
    width: 'w-[80px] text-center',
  },
  {
    header: '부서/사업장',
    accessorKey: 'department',
    width: 'w-[250px]',
    cell: ({ row }) => {
      const { department, business_place } = row.original;
      return <span>{`${department} / ${business_place}`}</span>;
    },
  },
  { header: '제목', accessorKey: 'title', width: 'w-[500px]' },
  {
    header: '게시상태',
    accessorKey: 'disabled',
    width: 'w-[100px] text-center',
    cell: ({ row }) => {
      const { disabled } = row.original;
      return (
        <Badge variant={disabled ? 'secondary' : 'defaultLight'}>
          {disabled ? '미게시' : '게시'}
        </Badge>
      );
    },
  },
  {
    header: '공고 기간',
    accessorKey: 'start_date',
    width: 'w-[250px] text-center',
    cell: ({ row }) => {
      const { start_date, end_date } = row.original;
      return (
        <span>{`${start_date ? moment(start_date).format('YYYY-MM-DD') : ''} ~ ${
          end_date ? moment(end_date).format('YYYY-MM-DD') : ''
        }`}</span>
      );
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
            successMessage={`"${title}" 공고가 삭제되었습니다.`}
            dialogTitle={`공고 삭제`}
            dialogDescription={`정말 "${title}" 공고를 삭제하시겠습니까? 해당 공고에 지원자가 있는 경우 삭제할 수 없습니다. 삭제를 원할 경우 먼저 모든 지원자를 비워주세요.`}
          />
          <VerticalSeparator />
          <ViewApplicantsButton id={id} />
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
