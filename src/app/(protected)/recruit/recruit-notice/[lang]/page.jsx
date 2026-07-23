import { LANG_LIST } from '@/app/app-constants';
import { PageContainer, PageHeader, PageBody } from '@/shared/layouts/PageLayouts';
import {
  ListPagination,
  Searchbar,
  CreateButton,
  CategoryButtons,
} from '@/features/manage-modules/components/ui';
import { ManageModuleContextProvider } from '@/features/manage-modules/components/manage-modules.context';

import { List, ManageModuleSideSheet } from '@/features/manage-modules/recruit-notice';
import { getList } from '@/features/manage-modules/recruit-notice/api';

export default async function Page({ params, searchParams }) {
  const { lang } = await params;
  const queryString = await searchParams;

  const configs = {
    tableName: `recruit_notice_${lang}`,
    itemsPerPage: 15,
    pagesPerBlock: 10,
  };

  const { data, count, error } = await getList(
    configs.tableName,
    queryString,
    configs.itemsPerPage,
  );

  return (
    <ManageModuleContextProvider tableName={configs.tableName}>
      <PageContainer>
        <PageHeader
          title={`채용공고 관리 (${LANG_LIST[lang]})`}
          primarySlot={
            <CreateButton>
              <ManageModuleSideSheet />
            </CreateButton>
          }
          secondarySlot={null}
          thirdSlot={<Searchbar />}
        />
        <PageBody>
          <List list={data} total={count} />
          <ListPagination
            itemsPerPage={configs.itemsPerPage}
            pagesPerBlock={configs.pagesPerBlock}
            listCount={count}
          />
        </PageBody>
      </PageContainer>
    </ManageModuleContextProvider>
  );
}
