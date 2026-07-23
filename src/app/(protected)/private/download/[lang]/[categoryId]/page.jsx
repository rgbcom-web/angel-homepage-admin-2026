import { PageContainer, PageHeader, PageBody } from '@/shared/layouts/PageLayouts';
import { ListPagination, Searchbar, CreateButton } from '@/features/manage-modules/components/ui';
import { ManageModuleContextProvider } from '@/features/manage-modules/components/manage-modules.context';

import {
  List,
  BackToCategoryListButton,
  ManageModuleSideSheet,
} from '@/features/manage-modules/private-download/download-list';
import { getList } from '@/features/manage-modules/private-download/download-list/api';

export default async function Page({ params, searchParams }) {
  const { lang, categoryId } = await params;
  const queryString = await searchParams;

  const configs = {
    tableName: `private_download_${lang}`,
    categoryTableName: `private_download_category_${lang}`,
    itemsPerPage: 15,
    pagesPerBlock: 10,
  };

  const { data, categoryData, count, error } = await getList(
    configs.tableName,
    configs.categoryTableName,
    categoryId,
    queryString,
    configs.itemsPerPage,
  );

  return (
    <ManageModuleContextProvider tableName={configs.tableName}>
      <PageContainer>
        <PageHeader
          title={`${categoryData.title} 다운로드 목록`}
          primarySlot={
            <CreateButton label="다운로드 생성">
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
            buttons={<BackToCategoryListButton />}
          />
        </PageBody>
      </PageContainer>
    </ManageModuleContextProvider>
  );
}
