import { LANG_LIST } from '@/app/app-constants';
import { PageContainer, PageHeader, PageBody } from '@/shared/layouts/PageLayouts';
import { ListPagination, Searchbar, CreateButton } from '@/features/manage-modules/components/ui';
import { ManageModuleContextProvider } from '@/features/manage-modules/components/manage-modules.context';

import { List, ManageModuleSideSheet } from '@/features/manage-modules/private-download';
import { getList } from '@/features/manage-modules/private-download/api';

export default async function Page({ params, searchParams }) {
  const { lang } = await params;
  const queryString = await searchParams;

  const configs = {
    tableName: `private_download_category_ko`,
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
          title={`비공개 다운로드 카테고리`}
          primarySlot={
            <CreateButton label="카테고리 생성">
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
