import Link from 'next/link';
import { createAdminClient } from '@/service/db/supabase/server';
import { Button } from '@/shared/shadcn/components/ui/button';
import { Badge } from '@/shared/shadcn/components/ui/badge';

function getSurveyAdminStatus(item) {
  if (!item?.end_date) return 'ended';
  const end = new Date(`${item.end_date}T23:59:59`);
  return end >= new Date() ? 'ongoing' : 'ended';
}

export default async function Page({ params }) {
  const { id } = await params;
  const supa = await createAdminClient();
  const { data: survey, error } = await supa
    .from('advisory_surveys')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !survey) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">설문을 찾을 수 없습니다.</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/pediatric/boards/surveys">목록으로</Link>
        </Button>
      </div>
    );
  }

  const status = getSurveyAdminStatus(survey);
  const formUrl = String(survey.google_form_url || '').trim();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/pediatric/boards/surveys">목록으로</Link>
        </Button>
        {formUrl && (
          <Button asChild size="sm">
            <a href={formUrl} target="_blank" rel="noopener noreferrer">
              구글폼 열기
            </a>
          </Button>
        )}
      </div>

      <div className="space-y-3 rounded-lg border p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={status === 'ongoing' ? 'positiveLight' : 'secondary'}>
            {status === 'ongoing' ? '진행 중' : '종료'}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {survey.start_date}
            {survey.end_date ? ` ~ ${survey.end_date}` : ''}
          </span>
        </div>
        <h1 className="text-2xl font-semibold">{survey.title}</h1>
        {survey.description && (
          <p className="text-sm text-muted-foreground">{survey.description}</p>
        )}
        <div className="border-t pt-4 text-sm">
          <p className="mb-1 font-medium">구글폼 URL</p>
          {formUrl ? (
            <a
              href={formUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-blue-600 hover:underline">
              {formUrl}
            </a>
          ) : (
            <p className="text-muted-foreground">등록된 URL이 없습니다.</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          응답 결과는 구글폼(응답 시트)에서 확인하세요. 포털에서는 설문을 직접 수집하지 않습니다.
        </p>
      </div>
    </div>
  );
}
