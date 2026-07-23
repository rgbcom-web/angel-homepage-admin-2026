import { PageContainer, PageHeader, PageBody } from '@/shared/layouts/PageLayouts';
import { ListPagination } from '@/features/manage-modules/components/ui';
import {
  getMembers,
  getMemberStatusCounts,
} from '@/features/pediatric-admin/api/members';
import { MembersTable } from '@/features/pediatric-admin/members/members-table';
import { MembersStatusTabs } from '@/features/pediatric-admin/members/members-status-tabs';
import { MembersSearchBar } from '@/features/pediatric-admin/members/members-search-bar';
import { MembersExcelButton } from '@/features/pediatric-admin/members/members-excel-button';
import { MemberCreateForm } from '@/features/pediatric-admin/members/member-create-form';

export default async function PediatricMembersPage({ searchParams }) {
  const queryString = await searchParams;
  const configs = { itemsPerPage: 10, pagesPerBlock: 10 };

  const [{ data, count, errors }, { counts }] = await Promise.all([
    getMembers(queryString, configs.itemsPerPage),
    getMemberStatusCounts(),
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="회원관리"
        secondarySlot={
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              회원 승인 및 정보 관리, 활동 현황을 확인할 수 있습니다.
            </p>
            <MembersStatusTabs counts={counts} />
          </div>
        }
        thirdSlot={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <MembersSearchBar />
            <MembersExcelButton />
          </div>
        }
      />
      <PageBody>
        <MemberCreateForm />

        {errors?.message && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {errors.message}
            {(errors.message.includes('admin_memo') ||
              errors.message.includes('birth_date') ||
              errors.message.includes('inactive')) && (
              <p className="mt-2 text-xs">
                <code>sql/advisory_members_admin.sql</code> 을 실행해 주세요.
              </p>
            )}
          </div>
        )}

        <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
          <span>총 {count}건</span>
          <span>10개씩 보기</span>
        </div>

        <MembersTable list={data} />

        <ListPagination
          itemsPerPage={configs.itemsPerPage}
          pagesPerBlock={configs.pagesPerBlock}
          listCount={count}
        />
      </PageBody>
    </PageContainer>
  );
}
