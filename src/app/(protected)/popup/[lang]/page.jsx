import { LANG_LIST } from '@/app/app-constants';
import { PageContainer, PageHeader, PageBody } from '@/shared/layouts/PageLayouts';
import {
  ListPagination,
  Searchbar,
  CategoryButtons,
  CreateButton,
} from '@/features/manage-modules/components/ui';
import { ManageModuleContextProvider } from '@/features/manage-modules/components/manage-modules.context';

import { List, ManageModuleSideSheet } from '@/features/manage-modules/popup';
import { getList } from '@/features/manage-modules/popup/api';

export default async function Page({ params, searchParams }) {
  const { lang } = await params;
  const queryString = await searchParams;

  const configs = {
    tableName: `popup_${lang}`,
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
          title={`팝업 관리 (${LANG_LIST[lang]})`}
          primarySlot={
            <CreateButton label="팝업 생성">
              <ManageModuleSideSheet />
            </CreateButton>
          }
          secondarySlot={
            <CategoryButtons
              items={[
                { label: '전체', value: '' },
                { label: '활성화', value: 'false' },
                { label: '비활성화', value: 'true' },
              ]}
              queryKey="disabled"
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
