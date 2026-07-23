import { LANG_LIST } from '@/app/app-constants';
import { PageContainer, PageHeader, PageBody } from '@/shared/layouts/PageLayouts';
import {
  ListPagination,
  Searchbar,
  CreateButton,
  CategoryButtons,
} from '@/features/manage-modules/components/ui';
import { ManageModuleContextProvider } from '@/features/manage-modules/components/manage-modules.context';

import { List, ManageModuleSideSheet } from '@/features/manage-modules/recruit-angel-story';
import { getList } from '@/features/manage-modules/recruit-angel-story/api';
import { arrayToOptions } from '@/shared/lib/utils';
import { ANGEL_STORY_CATEGORY_LIST } from '@/app/app-constants';

const CATEGORIES = ANGEL_STORY_CATEGORY_LIST.filter((item) => item.fixed).map((item) => item.name);
CATEGORIES.push('기타');

export default async function Page({ params, searchParams }) {
  const { lang } = await params;
  const queryString = await searchParams;

  const configs = {
    tableName: `recruit_angel_story_${lang}`,
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
          title={`엔젤 스토리 관리 (${LANG_LIST[lang]})`}
          primarySlot={
            <CreateButton label="게시물 생성">
              <ManageModuleSideSheet />
            </CreateButton>
          }
          secondarySlot={
            <CategoryButtons
              items={arrayToOptions(CATEGORIES, true, (item) => item.toUpperCase())}
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
