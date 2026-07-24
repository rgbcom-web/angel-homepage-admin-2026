'use client';

import { useActionState, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/shared/shadcn/components/ui/badge';
import { Button } from '@/shared/shadcn/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/shadcn/components/ui/dialog';
import { SideSheet, useSheet } from '@/features/components/sheet';
import {
  createBoardItem,
  deleteBoardItem,
  getResourceViewUrl,
  toggleBoardFlag,
  updateBoardItem,
} from '@/features/pediatric-admin/api/boards';
import { toast } from 'sonner';

const initialState = { success: false, message: '' };
const inputClass = 'h-9 w-full rounded-md border bg-background px-3 text-sm';

function normalizeClientEventImages(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((item) => item?.path || item?.url);
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((item) => item?.path || item?.url) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function isEventPdfAttachment(item) {
  if (!item) return false;
  if (item.type === 'pdf') return true;
  const name = String(item.name || item.path || '').toLowerCase();
  return name.endsWith('.pdf');
}

const CREATE_TITLES = {
  resources: '자료 등록',
  events: '행사 등록',
  surveys: '설문 등록',
};

/** 다른 게시판과 동일: CreateButton + SideSheet */
export function BoardCreateSideSheet({ boardKey }) {
  return (
    <SideSheet
      title={CREATE_TITLES[boardKey] || '게시글 생성'}
      body={<BoardCreateForm boardKey={boardKey} />}
      size="md"
    />
  );
}

function BoardCreateForm({ boardKey }) {
  if (boardKey === 'events') {
    return <EventCreateForm />;
  }
  if (boardKey === 'surveys') {
    return <SurveyCreateForm />;
  }
  if (boardKey === 'resources') {
    return <ResourceCreateForm />;
  }

  return null;
}

function ResourceCreateForm() {
  const router = useRouter();
  const { setSheetOpen } = useSheet();
  const [fileName, setFileName] = useState('');
  const [state, formAction, pending] = useActionState(async (_prev, formData) => {
    const result = await createBoardItem('resources', formData);
    if (result.success) {
      toast.success('자료가 등록되었습니다.');
      setFileName('');
      setSheetOpen(false);
      router.refresh();
      return { success: true, message: '' };
    }
    return result;
  }, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <p className="text-xs text-muted-foreground">
        업로드된 파일은 포털에서 다운로드되지 않으며, 보안 뷰어로만 열람됩니다.
      </p>
      <input name="title" required placeholder="제목" className={inputClass} />
      <textarea
        name="description"
        rows={2}
        placeholder="설명 (선택)"
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
      />

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="resource-file">
          첨부 파일 <span className="text-destructive">*</span>
        </label>
        <input
          id="resource-file"
          name="file"
          type="file"
          required
          accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,application/pdf,image/*"
          className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
          onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
        />
        <p className="text-xs text-muted-foreground">
          PDF 또는 이미지(png/jpg/gif/webp), 최대 50MB
          {fileName ? ` · 선택: ${fileName}` : ''}
        </p>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_notice" />
          자료실 상단 공지
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="show_in_notice" />
          홈 공지사항 노출
        </label>
      </div>
      {state?.message && !state.success && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? '업로드 중...' : '등록'}
      </Button>
    </form>
  );
}

function EventCreateForm() {
  const router = useRouter();
  const { setSheetOpen } = useSheet();
  const [imageNames, setImageNames] = useState([]);
  const [state, formAction, pending] = useActionState(async (_prev, formData) => {
    const result = await createBoardItem('events', formData);
    if (result.success) {
      toast.success('행사가 등록되었습니다.');
      setImageNames([]);
      setSheetOpen(false);
      router.refresh();
      return { success: true, message: '' };
    }
    return result;
  }, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        <input name="title" required placeholder="제목 (예: WCNR 2026)" className={inputClass} />
        <input
          name="category"
          required
          maxLength={3}
          placeholder="카테고리 최대 3글자 (학회/워크샵/행사)"
          className={inputClass}
        />
      </div>
      <input
        name="subtitle"
        placeholder="부제 (영문/풀네임)"
        className={inputClass}
      />
      <input name="location" required placeholder="장소" className={inputClass} />
      <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        <label className="space-y-1 text-xs text-muted-foreground">
          시작일
          <input name="start_date" type="date" required className={inputClass} />
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          종료일
          <input name="end_date" type="date" required className={inputClass} />
        </label>
      </div>
      <textarea
        name="description"
        rows={3}
        placeholder="상세 설명"
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
      />
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="event-images">
          첨부 파일 (선택)
        </label>
        <input
          id="event-images"
          name="images"
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,application/pdf,image/*"
          className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
          onChange={(e) =>
            setImageNames(Array.from(e.target.files || []).map((file) => file.name))
          }
        />
        <p className="text-xs text-muted-foreground">
          PDF 또는 이미지(png/jpg/gif/webp), 각 50MB · 포털 상세에서 바로 표시됩니다
          {imageNames.length ? ` · ${imageNames.length}개 선택` : ''}
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="show_in_notice" />
        홈 공지사항 노출
      </label>
      {state?.message && !state.success && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? '등록 중...' : '행사 등록'}
      </Button>
    </form>
  );
}

function SurveyCreateForm() {
  const router = useRouter();
  const { setSheetOpen } = useSheet();
  const [state, formAction, pending] = useActionState(async (_prev, formData) => {
    const result = await createBoardItem('surveys', formData);
    if (result.success) {
      toast.success('설문이 등록되었습니다.');
      setSheetOpen(false);
      router.refresh();
      return { success: true, message: '' };
    }
    return result;
  }, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input name="title" required placeholder="제목" className={inputClass} />
      <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        <label className="space-y-1 text-xs text-muted-foreground">
          설문 시작일
          <input name="start_date" type="date" required className={inputClass} />
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          설문 종료일
          <input name="end_date" type="date" required className={inputClass} />
        </label>
      </div>
      <label className="space-y-1 text-xs text-muted-foreground">
        구글폼 URL
        <input
          name="google_form_url"
          type="url"
          required
          placeholder="https://docs.google.com/forms/..."
          className={inputClass}
        />
      </label>
      <textarea
        name="description"
        rows={2}
        placeholder="설문 설명 (선택)"
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
      />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="show_in_notice" />
        홈 공지사항 노출
      </label>
      {state?.message && !state.success && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? '등록 중...' : '설문 등록'}
      </Button>
    </form>
  );
}

export function BoardsTable({ boardKey, list }) {
  if (boardKey === 'events') {
    return <EventsTable list={list} />;
  }
  if (boardKey === 'surveys') {
    return <SurveysTable list={list} />;
  }

  if (!list?.length) {
    return (
      <div className="rounded-lg border py-16 text-center text-sm text-muted-foreground">
        등록된 게시글이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="border-b bg-muted/40 text-left">
          <tr>
            <th className="px-3 py-3 font-medium">번호</th>
            <th className="px-3 py-3 font-medium">제목</th>
            <th className="px-3 py-3 font-medium">파일</th>
            <th className="px-3 py-3 font-medium">상단 공지</th>
            <th className="px-3 py-3 font-medium">홈 공지</th>
            <th className="px-3 py-3 font-medium">조회수</th>
            <th className="px-3 py-3 font-medium">등록일</th>
            <th className="px-3 py-3 font-medium">메뉴</th>
          </tr>
        </thead>
        <tbody>
          {list.map((item) => (
            <tr key={item.id} className="border-b last:border-b-0">
              <td className="px-3 py-3 text-muted-foreground">{item.no}</td>
              <td className="px-3 py-3">
                <div className="font-medium">{item.title}</div>
                {item.description && (
                  <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {item.description}
                  </div>
                )}
              </td>
              <td className="px-3 py-3">
                {item.file_name ? (
                  <div>
                    <Badge variant="secondary" className="mb-1">
                      {item.file_type === 'image' ? '이미지' : 'PDF'}
                    </Badge>
                    <div className="max-w-[180px] truncate text-xs text-muted-foreground">
                      {item.file_name}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">미등록</span>
                )}
              </td>
              <td className="px-3 py-3">
                <FlagToggle
                  boardKey={boardKey}
                  id={item.id}
                  field="is_notice"
                  value={Boolean(item.is_notice)}
                />
              </td>
              <td className="px-3 py-3">
                <FlagToggle
                  boardKey={boardKey}
                  id={item.id}
                  field="show_in_notice"
                  value={Boolean(item.show_in_notice)}
                />
              </td>
              <td className="px-3 py-3">{item.views ?? 0}</td>
              <td className="px-3 py-3 text-muted-foreground">
                {item.created_at ? new Date(item.created_at).toLocaleDateString('ko-KR') : '-'}
              </td>
              <td className="px-3 py-3">
                <div className="flex flex-wrap items-center gap-1">
                  <ResourceViewButton item={item} />
                  <ResourceEditButton item={item} />
                  <DeleteBoardButton boardKey={boardKey} id={item.id} title={item.title} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EventsTable({ list }) {
  if (!list?.length) {
    return (
      <div className="rounded-lg border py-16 text-center text-sm text-muted-foreground">
        등록된 행사가 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[1000px] text-sm">
        <thead className="border-b bg-muted/40 text-left">
          <tr>
            <th className="px-3 py-3 font-medium">번호</th>
            <th className="px-3 py-3 font-medium">카테고리</th>
            <th className="px-3 py-3 font-medium">제목</th>
            <th className="px-3 py-3 font-medium">기간</th>
            <th className="px-3 py-3 font-medium">장소</th>
            <th className="px-3 py-3 font-medium">홈 공지</th>
            <th className="px-3 py-3 font-medium">메뉴</th>
          </tr>
        </thead>
        <tbody>
          {list.map((item) => (
            <tr key={item.id} className="border-b last:border-b-0">
              <td className="px-3 py-3 text-muted-foreground">{item.no}</td>
              <td className="px-3 py-3">
                <Badge variant="secondary">{String(item.category || '').slice(0, 3)}</Badge>
              </td>
              <td className="px-3 py-3">
                <div className="font-medium">{item.title}</div>
                {item.subtitle && (
                  <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {item.subtitle}
                  </div>
                )}
              </td>
              <td className="px-3 py-3 text-muted-foreground">
                {item.start_date}
                {item.end_date && item.end_date !== item.start_date ? ` ~ ${item.end_date}` : ''}
              </td>
              <td className="px-3 py-3">{item.location || '-'}</td>
              <td className="px-3 py-3">
                <FlagToggle
                  boardKey="events"
                  id={item.id}
                  field="show_in_notice"
                  value={Boolean(item.show_in_notice)}
                />
              </td>
              <td className="px-3 py-3">
                <div className="flex flex-wrap items-center gap-1">
                  <EventEditButton item={item} />
                  <DeleteBoardButton boardKey="events" id={item.id} title={item.title} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getSurveyAdminStatus(item) {
  if (!item?.end_date) return 'ended';
  const end = new Date(`${item.end_date}T23:59:59`);
  return end >= new Date() ? 'ongoing' : 'ended';
}

function SurveysTable({ list }) {
  if (!list?.length) {
    return (
      <div className="rounded-lg border py-16 text-center text-sm text-muted-foreground">
        등록된 설문이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="border-b bg-muted/40 text-left">
          <tr>
            <th className="px-3 py-3 font-medium">번호</th>
            <th className="px-3 py-3 font-medium">제목</th>
            <th className="px-3 py-3 font-medium">구글폼</th>
            <th className="px-3 py-3 font-medium">설문 기간</th>
            <th className="px-3 py-3 font-medium">상태</th>
            <th className="px-3 py-3 font-medium">홈 공지</th>
            <th className="px-3 py-3 font-medium">메뉴</th>
          </tr>
        </thead>
        <tbody>
          {list.map((item) => {
            const status = getSurveyAdminStatus(item);
            const formUrl = String(item.google_form_url || '').trim();
            return (
              <tr key={item.id} className="border-b last:border-b-0">
                <td className="px-3 py-3 text-muted-foreground">{item.no}</td>
                <td className="px-3 py-3">
                  <Link
                    href={`/pediatric/boards/surveys/${item.id}`}
                    className="font-medium hover:underline">
                    {item.title}
                  </Link>
                  {item.description && (
                    <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  )}
                </td>
                <td className="px-3 py-3">
                  {formUrl ? (
                    <a
                      href={formUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="line-clamp-1 max-w-[220px] text-xs text-blue-600 hover:underline">
                      {formUrl}
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">미등록</span>
                  )}
                </td>
                <td className="px-3 py-3 text-muted-foreground">
                  {item.start_date}
                  {item.end_date ? ` ~ ${item.end_date}` : ''}
                </td>
                <td className="px-3 py-3">
                  <Badge variant={status === 'ongoing' ? 'positiveLight' : 'secondary'}>
                    {status === 'ongoing' ? '진행 중' : '종료'}
                  </Badge>
                </td>
                <td className="px-3 py-3">
                  <FlagToggle
                    boardKey="surveys"
                    id={item.id}
                    field="show_in_notice"
                    value={Boolean(item.show_in_notice)}
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap items-center gap-1">
                    <Button asChild size="xs" variant="outline">
                      <Link href={`/pediatric/boards/surveys/${item.id}`}>상세</Link>
                    </Button>
                    <SurveyEditButton item={item} />
                    {formUrl && (
                      <Button asChild size="xs" variant="outline">
                        <a href={formUrl} target="_blank" rel="noopener noreferrer">
                          폼 열기
                        </a>
                      </Button>
                    )}
                    <DeleteBoardButton boardKey="surveys" id={item.id} title={item.title} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FlagToggle({ boardKey, id, field, value }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await toggleBoardFlag(boardKey, id, field, !value);
          if (!result.success) {
            toast.error(result.message || '변경 실패');
            return;
          }
          router.refresh();
        });
      }}
    >
      <Badge variant={value ? 'positiveLight' : 'secondary'}>{value ? 'ON' : 'OFF'}</Badge>
    </button>
  );
}

function DeleteBoardButton({ boardKey, id, title }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="xs"
      variant="ghostDestructive"
      disabled={pending}
      onClick={() => {
        if (!confirm(`"${title}" 을(를) 삭제할까요?`)) return;
        startTransition(async () => {
          const result = await deleteBoardItem(boardKey, id);
          if (!result.success) {
            toast.error(result.message || '삭제 실패');
            return;
          }
          toast.success('삭제되었습니다.');
          router.refresh();
        });
      }}
    >
      삭제
    </Button>
  );
}

function ResourceViewButton({ item }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState(null);

  const openViewer = async () => {
    setLoading(true);
    setOpen(true);
    const result = await getResourceViewUrl(item.id);
    setLoading(false);
    if (!result.success) {
      toast.error(result.message || '열람에 실패했습니다.');
      setOpen(false);
      return;
    }
    setView(result);
  };

  return (
    <>
      <Button
        size="xs"
        variant="outline"
        disabled={!item.file_name || loading}
        onClick={openViewer}>
        열람
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setView(null);
        }}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="pr-8">{view?.title || item.title}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            관리자 미리보기입니다. 포털 회원에게는 다운로드가 제공되지 않으며 뷰어 열람만 가능합니다.
          </p>
          {loading || !view ? (
            <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
              불러오는 중...
            </div>
          ) : view.fileType === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={view.url}
              alt={view.fileName || item.title}
              className="mx-auto max-h-[70vh] w-auto max-w-full object-contain"
            />
          ) : (
            <iframe
              title={view.fileName || item.title}
              src={view.url}
              className="h-[70vh] w-full rounded-md border bg-white"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ResourceEditButton({ item }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [state, formAction, pending] = useActionState(async (_prev, formData) => {
    const result = await updateBoardItem('resources', item.id, formData);
    if (result.success) {
      toast.success('자료가 수정되었습니다.');
      setOpen(false);
      setFileName('');
      router.refresh();
      return { success: true, message: '' };
    }
    return result;
  }, initialState);

  return (
    <>
      <Button size="xs" variant="outline" onClick={() => setOpen(true)}>
        수정
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>자료 수정</DialogTitle>
          </DialogHeader>
          <form action={formAction} className="space-y-3">
            <input
              name="title"
              required
              defaultValue={item.title || ''}
              placeholder="제목"
              className={inputClass}
            />
            <textarea
              name="description"
              rows={2}
              defaultValue={item.description || ''}
              placeholder="설명 (선택)"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium">첨부 파일 교체 (선택)</label>
              <input
                name="file"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,application/pdf,image/*"
                className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
                onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
              />
              <p className="text-xs text-muted-foreground">
                현재: {item.file_name || '미등록'}
                {fileName ? ` · 새 파일: ${fileName}` : ' · 비우면 기존 파일 유지'}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="is_notice" defaultChecked={Boolean(item.is_notice)} />
                자료실 상단 공지
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="show_in_notice"
                  defaultChecked={Boolean(item.show_in_notice)}
                />
                홈 공지사항 노출
              </label>
            </div>
            {state?.message && !state.success && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                취소
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? '저장 중...' : '저장'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function EventEditButton({ item }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [imageNames, setImageNames] = useState([]);
  const [keptImages, setKeptImages] = useState(() => normalizeClientEventImages(item.images));
  const [state, formAction, pending] = useActionState(async (_prev, formData) => {
    const result = await updateBoardItem('events', item.id, formData);
    if (result.success) {
      toast.success('행사가 수정되었습니다.');
      setImageNames([]);
      setOpen(false);
      router.refresh();
      return { success: true, message: '' };
    }
    return result;
  }, initialState);

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setKeptImages(normalizeClientEventImages(item.images));
      setImageNames([]);
    }
  };

  return (
    <>
      <Button size="xs" variant="outline" onClick={() => handleOpenChange(true)}>
        수정
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>행사 수정</DialogTitle>
          </DialogHeader>
          <form action={formAction} className="space-y-3">
            <input type="hidden" name="manage_images" value="1" />
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              <input
                name="title"
                required
                defaultValue={item.title || ''}
                placeholder="제목"
                className={inputClass}
              />
              <input
                name="category"
                required
                maxLength={3}
                defaultValue={item.category || ''}
                placeholder="카테고리 최대 3글자"
                className={inputClass}
              />
            </div>
            <input
              name="subtitle"
              defaultValue={item.subtitle || ''}
              placeholder="부제"
              className={inputClass}
            />
            <input
              name="location"
              required
              defaultValue={item.location || ''}
              placeholder="장소"
              className={inputClass}
            />
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              <label className="space-y-1 text-xs text-muted-foreground">
                시작일
                <input
                  name="start_date"
                  type="date"
                  required
                  defaultValue={item.start_date || ''}
                  className={inputClass}
                />
              </label>
              <label className="space-y-1 text-xs text-muted-foreground">
                종료일
                <input
                  name="end_date"
                  type="date"
                  required
                  defaultValue={item.end_date || item.start_date || ''}
                  className={inputClass}
                />
              </label>
            </div>
            <textarea
              name="description"
              rows={3}
              defaultValue={item.description || ''}
              placeholder="상세 설명"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium">첨부 파일</label>
              {keptImages.length > 0 ? (
                <ul className="space-y-2 rounded-md border bg-muted/30 p-2">
                  {keptImages.map((img) => {
                    const isPdf = isEventPdfAttachment(img);
                    return (
                    <li
                      key={img.path || img.url}
                      className="flex items-center gap-2 rounded-md bg-background px-2 py-1.5"
                    >
                      {isPdf ? (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-semibold text-muted-foreground">
                          PDF
                        </div>
                      ) : img.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img.url}
                          alt=""
                          className="h-11 w-11 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-muted text-[10px] text-muted-foreground">
                          IMG
                        </div>
                      )}
                      <span className="min-w-0 flex-1 truncate text-xs">
                        {img.name || (isPdf ? 'document.pdf' : 'image')}
                      </span>
                      <input
                        type="hidden"
                        name="keep_images"
                        value={JSON.stringify({
                          path: img.path || '',
                          name: img.name || '',
                          url: img.url || '',
                          bucket: img.bucket || '',
                          type: img.type || (isPdf ? 'pdf' : 'image'),
                        })}
                      />
                      <Button
                        type="button"
                        size="xs"
                        variant="ghost"
                        className="shrink-0 text-destructive hover:text-destructive"
                        onClick={() =>
                          setKeptImages((prev) =>
                            prev.filter((itemImg) =>
                              img.path
                                ? itemImg.path !== img.path
                                : itemImg.url !== img.url,
                            ),
                          )
                        }
                      >
                        삭제
                      </Button>
                    </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">등록된 첨부 파일이 없습니다.</p>
              )}
              <input
                name="images"
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,application/pdf,image/*"
                className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
                onChange={(e) =>
                  setImageNames(Array.from(e.target.files || []).map((file) => file.name))
                }
              />
              <p className="text-xs text-muted-foreground">
                유지 {keptImages.length}개 · PDF/이미지 각 50MB
                {imageNames.length
                  ? ` · 추가 업로드 ${imageNames.length}개`
                  : ' · 새 파일은 기존에 추가됩니다'}
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="show_in_notice"
                defaultChecked={Boolean(item.show_in_notice)}
              />
              홈 공지사항 노출
            </label>
            {state?.message && !state.success && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                취소
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? '저장 중...' : '저장'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SurveyEditButton({ item }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(async (_prev, formData) => {
    const result = await updateBoardItem('surveys', item.id, formData);
    if (result.success) {
      toast.success('설문이 수정되었습니다.');
      setOpen(false);
      router.refresh();
      return { success: true, message: '' };
    }
    return result;
  }, initialState);

  return (
    <>
      <Button size="xs" variant="outline" onClick={() => setOpen(true)}>
        수정
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>설문 수정</DialogTitle>
          </DialogHeader>
          <form action={formAction} className="space-y-3">
            <input
              name="title"
              required
              defaultValue={item.title || ''}
              placeholder="제목"
              className={inputClass}
            />
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              <label className="space-y-1 text-xs text-muted-foreground">
                설문 시작일
                <input
                  name="start_date"
                  type="date"
                  required
                  defaultValue={item.start_date || ''}
                  className={inputClass}
                />
              </label>
              <label className="space-y-1 text-xs text-muted-foreground">
                설문 종료일
                <input
                  name="end_date"
                  type="date"
                  required
                  defaultValue={item.end_date || item.start_date || ''}
                  className={inputClass}
                />
              </label>
            </div>
            <label className="space-y-1 text-xs text-muted-foreground">
              구글폼 URL
              <input
                name="google_form_url"
                type="url"
                required
                defaultValue={item.google_form_url || ''}
                placeholder="https://docs.google.com/forms/..."
                className={inputClass}
              />
            </label>
            <textarea
              name="description"
              rows={2}
              defaultValue={item.description || ''}
              placeholder="설문 설명 (선택)"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="show_in_notice"
                defaultChecked={Boolean(item.show_in_notice)}
              />
              홈 공지사항 노출
            </label>
            {state?.message && !state.success && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                취소
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? '저장 중...' : '저장'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
