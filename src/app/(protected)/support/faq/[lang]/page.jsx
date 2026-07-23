import { LANG_LIST } from '@/app/app-constants';
import { PageContainer, PageHeader, PageBody } from '@/shared/layouts/PageLayouts';
import {
  ListPagination,
  Searchbar,
  CategoryButtons,
  CreateButton,
} from '@/features/manage-modules/components/ui';
import { ManageModuleContextProvider } from '@/features/manage-modules/components/manage-modules.context';

import { List, ManageModuleSideSheet } from '@/features/manage-modules/faq';
import { getList, getCategories } from '@/features/manage-modules/faq/api';

export default async function Page({ params, searchParams }) {
  const { lang } = await params;
  const queryString = await searchParams;

  const configs = {
    tableName: `faq_${lang}`,
    categoryTableName: `faq_category`,
    itemsPerPage: 15,
    pagesPerBlock: 10,
  };

  const { categories } = await getCategories(configs.categoryTableName);

  const { data, count, error } = await getList(
    configs.tableName,
    queryString,
    configs.itemsPerPage,
  );

  const list = data.map((item) => ({
    ...item,
    category_1_name: categories.depth1.find((category) => category.id === item.category_1)?.[
      `name_${lang}`
    ],
    category_2_name: categories.depth2.find((category) => category.id === item.category_2)?.[
      `name_${lang}`
    ],
  }));

  return (
    <ManageModuleContextProvider tableName={configs.tableName} categories={categories}>
      <PageContainer>
        <PageHeader
          title={`FAQ 관리 (${LANG_LIST[lang]})`}
          primarySlot={
            <CreateButton label="FAQ 생성">
              <ManageModuleSideSheet />
            </CreateButton>
          }
          secondarySlot={
            <CategoryButtons
              items={[
                { label: '전체', value: '' },
                ...categories.depth1.map((item) => ({
                  label: item.name_ko,
                  value: item.id,
                })),
              ]}
              queryKey="category"
            />
          }
          thirdSlot={<Searchbar />}
        />
        <PageBody>
          <List list={list} total={count} />
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
