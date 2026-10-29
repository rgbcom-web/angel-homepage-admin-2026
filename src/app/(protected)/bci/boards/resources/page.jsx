import BciBoardPage from '@/features/bci-admin/boards/board-page';

export default async function Page({ searchParams }) {
  return <BciBoardPage boardKey="resources" searchParams={searchParams} />;
}
