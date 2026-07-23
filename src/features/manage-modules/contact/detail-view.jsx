'use client';

import { cn } from '@/shared/lib/utils';
import moment from 'moment';
import nl2br from 'react-br';
import { useDetail } from './detail.context';
import { UpdateContactStatusDropdown } from '../components/ui/';
import { useParams } from 'next/navigation';

import {
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableRow,
} from '@/shared/shadcn/components/ui/table';
import { Badge } from '@/shared/shadcn/components/ui/badge';

const classNames = {
  table: cn(
    'table-fixed [&_td]:border-x [&_th]:border-x [&_tr:first-child]:border-t [&_tr:last-child]:border-b [&_th]:bg-muted/100 [&_th]:font-semibold [&_th]:text-secondary-foreground [&_td]:p-3 [&_th]:p-3',
  ),
};

export function DetailView() {
  const { data } = useDetail();
  const { id } = data || {};
  const { lang } = useParams();
  return (
    <Table className={classNames.table}>
      <colgroup>
        <col width="120px" />
      </colgroup>
      <TableBody>
        <TableRow>
          <TableHead className={classNames.tableHead}>문의상태</TableHead>
          <TableCell>
            <UpdateContactStatusDropdown status={data.status} id={id} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableHead className={classNames.tableHead}>문의일자</TableHead>
          <TableCell>{moment(data.created_at).format('YYYY-MM-DD HH:mm:ss')}</TableCell>
        </TableRow>
        <TableRow>
          <TableHead className={classNames.tableHead}>카테고리</TableHead>
          <TableCell>
            <Badge variant="defaultLight">{data.category}</Badge>
          </TableCell>
        </TableRow>
        {data.product && (
          <TableRow>
            <TableHead className={classNames.tableHead}>제품</TableHead>
            <TableCell>
              <Badge variant="secondary">{data.product.toUpperCase()}</Badge>
            </TableCell>
          </TableRow>
        )}
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
        {lang === 'en' && (
          <TableRow>
            <TableHead className={classNames.tableHead}>국가</TableHead>
            <TableCell>{data.country}</TableCell>
          </TableRow>
        )}
        <TableRow>
          <TableHead className={classNames.tableHead}>회사명</TableHead>
          <TableCell>{data.company}</TableCell>
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
          <TableHead className={classNames.tableHead}>개인정보</TableHead>
          <TableCell>
            <Badge variant={data.privacy ? 'positiveLight' : 'destructiveLight'}>
              {data.privacy ? '동의' : '미동의'}
            </Badge>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
