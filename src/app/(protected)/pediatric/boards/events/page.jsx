import PediatricBoardPage from '@/features/pediatric-admin/boards/board-page';

export default async function Page({ searchParams }) {
  return <PediatricBoardPage boardKey="events" searchParams={searchParams} />;
}
