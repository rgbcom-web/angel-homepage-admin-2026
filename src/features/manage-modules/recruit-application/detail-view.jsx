'use client';

import { cn } from '@/shared/lib/utils';
import moment from 'moment';
import nl2br from 'react-br';
import { useEffect, useState } from 'react';
import { useSheet } from '@/features/components/sheet';
import { useManageModuleContext } from '@/features/manage-modules/components/manage-modules.context';
import { getItemById } from './api';

import {
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableRow,
} from '@/shared/shadcn/components/ui/table';
import { Badge } from '@/shared/shadcn/components/ui/badge';
import { FileList } from '@/features/manage-modules/components/ui';

const classNames = {
  table: cn(
    'table-fixed [&_td]:border-x [&_th]:border-x [&_tr:first-child]:border-t [&_tr:last-child]:border-b [&_th]:bg-muted/100 [&_th]:font-semibold [&_th]:text-secondary-foreground [&_td]:p-3 [&_th]:p-3',
  ),
};

export function DetailView() {
  const { tableName } = useManageModuleContext();
  const { sheetData } = useSheet();
  const { id } = sheetData || {};
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await getItemById(tableName, id);
      setData(data);
    };
    fetchData();
  }, [id]);

  if (!data) return null;

  return (
    <Table className={classNames.table}>
      <colgroup>
        <col width="120px" />
      </colgroup>
      <TableBody>
        <TableRow>
          <TableHead className={classNames.tableHead}>지원일자</TableHead>
          <TableCell>{moment(data.created_at).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
        </TableRow>
        <TableRow>
          <TableHead className={classNames.tableHead}>이름</TableHead>
          <TableCell>{data.name}</TableCell>
        </TableRow>
        <TableRow>
          <TableHead className={classNames.tableHead}>이메일</TableHead>
          <TableCell>{data.email}</TableCell>
        </TableRow>
        <TableRow>
          <TableHead className={classNames.tableHead}>연락처</TableHead>
          <TableCell>{data.contact}</TableCell>
        </TableRow>
        <TableRow>
          <TableHead className={classNames.tableHead}>제목</TableHead>
          <TableCell>{data.title}</TableCell>
        </TableRow>
        <TableRow>
          <TableHead className={classNames.tableHead}>내용</TableHead>
          <TableCell>{nl2br(data.content)}</TableCell>
        </TableRow>
        <TableRow>
          <TableHead className={classNames.tableHead}>개인정보 (필수)</TableHead>
          <TableCell>
            <Badge variant={data.privacy_required ? 'positiveLight' : 'destructiveLight'}>
              {data.privacy_required ? '동의' : '미동의'}
            </Badge>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableHead className={classNames.tableHead}>개인정보 (선택)</TableHead>
          <TableCell>
            <Badge variant={data.privacy_optional ? 'positiveLight' : 'destructiveLight'}>
              {data.privacy_optional ? '동의' : '미동의'}
            </Badge>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableHead className={classNames.tableHead}>민감정보 (선택)</TableHead>
          <TableCell>
            <Badge variant={data.privacy_sensitive ? 'positiveLight' : 'destructiveLight'}>
              {data.privacy_sensitive ? '동의' : '미동의'}
            </Badge>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableHead className={classNames.tableHead}>첨부파일</TableHead>
          <TableCell className={cn('!py-4')}>
            <FileList files={data.attachments} />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
