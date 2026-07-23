import { LANG_LIST } from '@/app/app-constants';
import { PageContainer, PageHeader, PageBody } from '@/shared/layouts/PageLayouts';
import {
  ListPagination,
  Searchbar,
  CreateButton,
  CategoryButtons,
} from '@/features/manage-modules/components/ui';
import { ManageModuleContextProvider } from '@/features/manage-modules/components/manage-modules.context';

import { List, ManageModuleSideSheet } from '@/features/manage-modules/download';
import { getList } from '@/features/manage-modules/download/api';

import { DOWNLOAD_CATEGORY_LIST } from '@/app/app-constants';
import { arrayToOptions } from '@/shared/lib/utils';

export default async function Page({ params, searchParams }) {
  const { lang } = await params;
  const queryString = await searchParams;

  const configs = {
    tableName: `download_${lang}`,
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
          title={`제품 브로슈어 & 매뉴얼 관리 (${LANG_LIST[lang]})`}
          primarySlot={
            <CreateButton>
              <ManageModuleSideSheet />
            </CreateButton>
          }
          secondarySlot={
            <CategoryButtons
              items={arrayToOptions(DOWNLOAD_CATEGORY_LIST, false, (item) => item.toUpperCase())}
              queryKey="category"
            />
          }
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
