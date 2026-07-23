import { LANG_LIST } from '@/app/app-constants';
import { PageContainer, PageHeader, PageBody } from '@/shared/layouts/PageLayouts';
import { ListPagination, Searchbar } from '@/features/manage-modules/components/ui';
import { ManageModuleContextProvider } from '@/features/manage-modules/components/manage-modules.context';

import { List, BackToParentListButton } from '@/features/manage-modules/recruit-notice/applicants';
import { getList } from '@/features/manage-modules/recruit-notice/applicants/api';

export default async function Page({ params, searchParams }) {
  const { lang, id } = await params;
  const queryString = await searchParams;

  const configs = {
    tableName: `recruit_notice_applicants_${lang}`,
    parentTableName: `recruit_notice_${lang}`,
    itemsPerPage: 15,
    pagesPerBlock: 10,
  };

  const { data, parentData, count, error } = await getList(
    configs.tableName,
    configs.parentTableName,
    id,
    queryString,
    configs.itemsPerPage,
  );

  return (
    <ManageModuleContextProvider tableName={configs.tableName}>
      <PageContainer>
        <PageHeader
          title={`${parentData.title} 지원자 목록 (${LANG_LIST[lang]})`}
          primarySlot={<BackToParentListButton />}
          secondarySlot={null}
          thirdSlot={<Searchbar />}
        />
        <PageBody>
          <List list={data} total={count} />
          <ListPagination
            itemsPerPage={configs.itemsPerPage}
            pagesPerBlock={configs.pagesPerBlock}
            listCount={count}
            buttons={<BackToParentListButton />}
          />
        </PageBody>
      </PageContainer>
    </ManageModuleContextProvider>
  );
}
