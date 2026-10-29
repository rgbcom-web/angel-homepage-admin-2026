import { Suspense } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { PageContainer, PageBody } from '@/shared/layouts/PageLayouts';
import { getDashboardData } from '@/features/bci-admin/api/dashboard';
import {
  AccessTrendChart,
  DashboardStatCards,
} from '@/features/bci-admin/dashboard/dashboard-widgets';
import { DashboardDateRange } from '@/features/bci-admin/dashboard/date-range';
import { BCI_SITE_NAME } from '@/features/bci-admin/constants';

export default async function BciDashboardPage({ searchParams }) {
  const query = await searchParams;
  const { data } = await getDashboardData({ from: query.from, to: query.to });

  return (
    <PageContainer>
      <div className="sticky top-0 z-50 border-b bg-background px-content-padding-x py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-medium">대시보드</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {BCI_SITE_NAME}의 주요 현황을 한눈에 확인할 수 있습니다.
            </p>
          </div>
          <Suspense fallback={<div className="h-10 w-64 rounded-lg border bg-muted/30" />}>
            <DashboardDateRange from={data.range.from} to={data.range.to} />
          </Suspense>
        </div>
      </div>

      <PageBody>
        {(data.errors?.members || data.errors?.logins || data.errors?.message) && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <p className="font-medium">일부 데이터를 불러오지 못했습니다.</p>
            {data.errors?.members && <p className="mt-1">회원: {data.errors.members}</p>}
            {data.errors?.logins && (
              <p className="mt-1">
                접속 로그: {data.errors.logins}
                <br />
                `sql/bci_schema.sql` 을 실행한 뒤, 포털에 한 번 로그인하면 집계가
                쌓입니다.
              </p>
            )}
            {data.errors?.message && <p className="mt-1">{data.errors.message}</p>}
          </div>
        )}

        <DashboardStatCards stats={data} />

        <section className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900">최근 접속 회원</h2>
            <Link
              href="/bci/members?status=approved"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              전체 보기 &gt;
            </Link>
          </div>

          {data.recentLogins.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">최근 접속 기록이 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="px-2 py-3 font-medium">이름</th>
                    <th className="px-2 py-3 font-medium">소속</th>
                    <th className="px-2 py-3 font-medium">최근 접속일시</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentLogins.map((row) => (
                    <tr key={`${row.id}-${row.loggedInAt}`} className="border-b last:border-b-0">
                      <td className="px-2 py-3 font-medium text-slate-900">
                        {row.name}
                        {row.title ? ` ${row.title}` : ''}
                      </td>
                      <td className="px-2 py-3 text-slate-600">{row.affiliation}</td>
                      <td className="px-2 py-3 text-slate-500">
                        {row.loggedInAt
                          ? format(new Date(row.loggedInAt), 'yyyy-MM-dd HH:mm')
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            일자별 접속 추이 ({data.range.from} ~ {data.range.to})
          </h2>
          <AccessTrendChart data={data.dailyTrend} />
        </section>
      </PageBody>
    </PageContainer>
  );
}
