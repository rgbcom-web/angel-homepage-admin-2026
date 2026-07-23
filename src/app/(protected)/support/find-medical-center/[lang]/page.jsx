import { LANG_LIST } from '@/app/app-constants';
import { PageContainer, PageHeader, PageBody } from '@/shared/layouts/PageLayouts';
import {
  ListPagination,
  Searchbar,
  CategoryButtons,
  CreateButton,
} from '@/features/manage-modules/components/ui';
import { ManageModuleContextProvider } from '@/features/manage-modules/components/manage-modules.context';

import { List, ManageModuleSideSheet } from '@/features/manage-modules/find-medical-center';
import { getList, getCategories } from '@/features/manage-modules/find-medical-center/api';

export default async function Page({ params, searchParams }) {
  const { lang } = await params;
  const queryString = await searchParams;

  const configs = {
    tableName: `medical_center_${lang}`,
    categoryTableName: `medical_center_products`,
    itemsPerPage: 15,
    pagesPerBlock: 10,
  };

  const { categories } = await getCategories(configs.categoryTableName);

  const productOptions = categories.map((item) => ({
    label: item.name_ko,
    value: item[`name_${lang}`],
  }));

  const { data, count, error } = await getList(
    configs.tableName,
    queryString,
    configs.itemsPerPage,
  );

  return (
    <ManageModuleContextProvider tableName={configs.tableName} productOptions={productOptions}>
      <PageContainer>
        <PageHeader
          title={`도입 병원 관리 (${LANG_LIST[lang]})`}
          primarySlot={
            <CreateButton label="도입 병원 생성">
              <ManageModuleSideSheet />
            </CreateButton>
          }
          secondarySlot={
            <CategoryButtons
              items={[{ label: '전체', value: '' }, ...productOptions]}
              queryKey="products"
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
