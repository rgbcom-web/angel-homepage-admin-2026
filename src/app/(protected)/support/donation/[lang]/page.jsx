import { LANG_LIST } from '@/app/app-constants';
import { PageContainer, PageHeader, PageBody } from '@/shared/layouts/PageLayouts';
import { ListPagination, Searchbar } from '@/features/manage-modules/components/ui';
import { ManageModuleContextProvider } from '@/features/manage-modules/components/manage-modules.context';

import { List } from '@/features/manage-modules/donation';
import { getList } from '@/features/manage-modules/donation/api';

export default async function Page({ params, searchParams }) {
  const { lang } = await params;
  const queryString = await searchParams;

  const configs = {
    tableName: `donation_${lang}`,
    answerTableName: `donation_answers_${lang}`,
    itemsPerPage: 15,
    pagesPerBlock: 10,
  };

  const { data, count, error } = await getList(
    configs.tableName,
    queryString,
    configs.itemsPerPage,
  );

  const list = data;

  return (
    <ManageModuleContextProvider
      tableName={configs.tableName}
      answerTableName={configs.answerTableName}
    >
      <PageContainer>
        <PageHeader
          title={`기부 문의 접수 내역 (${LANG_LIST[lang]})`}
          primarySlot={null}
          secondarySlot={null}
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
