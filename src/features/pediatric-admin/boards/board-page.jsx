import { notFound } from 'next/navigation';
import { PageContainer, PageHeader, PageBody } from '@/shared/layouts/PageLayouts';
import { ListPagination, Searchbar } from '@/features/manage-modules/components/ui';
import { PEDIATRIC_BOARD_META, PEDIATRIC_SITE_NAME } from '@/features/pediatric-admin/constants';
import { getBoardList } from '@/features/pediatric-admin/api/boards';
import { BoardCreateForm, BoardsTable } from '@/features/pediatric-admin/boards/boards-ui';

export default async function PediatricBoardPage({ boardKey, searchParams }) {
  const meta = PEDIATRIC_BOARD_META[boardKey];
  if (!meta) notFound();

  const queryString = await searchParams;
  const configs = { itemsPerPage: 15, pagesPerBlock: 10 };
  const { data, count, errors } = await getBoardList(boardKey, queryString, configs.itemsPerPage);

  return (
    <PageContainer>
      <PageHeader title={`${PEDIATRIC_SITE_NAME} ${meta.title} 관리`} thirdSlot={<Searchbar />} />
      <PageBody>
        <p className="mb-4 text-sm text-muted-foreground">{meta.description}</p>
        {errors?.message && (
          <div className="mb-4 space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <p>{errors.message}</p>
            {String(errors.message).includes('advisory_events') && (
              <p className="text-muted-foreground">
                <code className="rounded bg-muted px-1 py-0.5 text-xs">sql/advisory_events.sql</code> 을
                실행해 테이블을 만든 뒤 새로고침해 주세요.
              </p>
            )}
            {String(errors.message).includes('advisory_surveys') && (
              <p className="text-muted-foreground">
                <code className="rounded bg-muted px-1 py-0.5 text-xs">sql/advisory_surveys.sql</code> 을
                실행해 테이블을 만든 뒤 새로고침해 주세요.
              </p>
            )}
            {(String(errors.message).includes('google_form_url') ||
              String(errors.message).includes('questions') ||
              String(errors.message).includes('advisory_survey_responses')) && (
              <p className="text-muted-foreground">
                구글폼 URL 컬럼이 없다면{' '}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">sql/advisory_surveys.sql</code>{' '}
                을 다시 실행해 주세요.
              </p>
            )}
          </div>
        )}
        <BoardCreateForm boardKey={boardKey} />
        <BoardsTable boardKey={boardKey} list={data} />
        <ListPagination
          itemsPerPage={configs.itemsPerPage}
          pagesPerBlock={configs.pagesPerBlock}
          listCount={count}
        />
      </PageBody>
    </PageContainer>
  );
}
