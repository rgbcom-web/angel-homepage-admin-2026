'use client';

import { lazy, Suspense, useActionState, useRef, useState, useTransition } from 'react';
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
  prepareResourceUploads,
  toggleBoardFlag,
  updateBoardItem,
} from '@/features/pediatric-admin/api/boards';
import { createClient as createBrowserSupabase } from '@/service/db/supabase/client';
import { toast } from 'sonner';

const Editor = lazy(() => import('@/shared/editor/CKEditor5'));

const initialState = { success: false, message: '' };
const inputClass = 'h-9 w-full rounded-md border bg-background px-3 text-sm';
const RESOURCE_EDITOR_TABLE = 'advisory_resources';

function stripHtml(value = '') {
  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function ResourceDescriptionField({ defaultValue = '' }) {
  const [value, setValue] = useState(defaultValue || '');

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">본문 (선택)</label>
      <input type="hidden" name="description" value={value} />
      <div className="ck-toolbar-static overflow-hidden rounded-md border bg-background">
        <Suspense
          fallback={
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              에디터 불러오는 중…
            </div>
          }>
          <Editor
            tableName={RESOURCE_EDITOR_TABLE}
            field={{
              value,
              onChange: (next) => setValue(typeof next === 'string' ? next : ''),
            }}
          />
        </Suspense>
      </div>
      <p className="text-xs text-muted-foreground">
        툴바의 이미지 버튼으로 본문에 이미지를 넣을 수 있습니다. PDF 등 열람용 파일은 아래 첨부
        파일에 등록하세요.
      </p>
    </div>
  );
}

/** PDF 등은 Vercel Server Action 본문 제한을 피하려고 브라우저→Storage 직접 업로드 */
async function uploadResourceFilesFromClient(selectedFiles) {
  const files = Array.from(selectedFiles || []).filter((file) => file && file.size);
  if (!files.length) {
    return { success: false, message: '첨부 파일을 추가해 주세요.' };
  }

  const prep = await prepareResourceUploads(
    files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type || '',
    })),
  );
  if (!prep.success) {
    return { success: false, message: prep.message || '업로드 준비에 실패했습니다.' };
  }

  const supabase = createBrowserSupabase();
  const uploaded = [];

  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const item = prep.prepared[i];
    const { error } = await supabase.storage
      .from(item.bucket)
      .uploadToSignedUrl(item.path, item.token, file, {
        contentType: file.type || undefined,
      });

    if (error) {
      console.error('[uploadResourceFilesFromClient]', error);
      // 이미 올라간 파일 정리 (orphan 방지)
      const byBucket = uploaded.reduce((acc, entry) => {
        const bucket = entry.bucket || item.bucket;
        if (!acc[bucket]) acc[bucket] = [];
        acc[bucket].push(entry.path);
        return acc;
      }, {});
      await Promise.all(
        Object.entries(byBucket).map(([bucket, paths]) =>
          supabase.storage.from(bucket).remove(paths),
        ),
      );
      return {
        success: false,
        message: error.message || `"${file.name}" 업로드에 실패했습니다.`,
      };
    }

    uploaded.push({
      path: item.path,
      name: item.name,
      type: item.type,
      bucket: item.bucket,
    });
  }

  return { success: true, files: uploaded };
}

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

function normalizeClientResourceFiles(item) {
  if (!item) return [];
  if (Array.isArray(item.files) && item.files.length) {
    return item.files.filter((file) => file?.path);
  }
  if (typeof item.files === 'string') {
    try {
      const parsed = JSON.parse(item.files);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed.filter((file) => file?.path);
      }
    } catch {
      /* ignore */
    }
  }
  if (item.file_path) {
    return [
      {
        path: item.file_path,
        name: item.file_name || 'attachment',
        type: item.file_type || 'pdf',
      },
    ];
  }
  return [];
}

function isEventPdfAttachment(item) {
  if (!item) return false;
  if (item.type === 'pdf') return true;
  const name = String(item.name || item.path || '').toLowerCase();
  return name.endsWith('.pdf');
}

function isResourcePdfAttachment(item) {
  return isEventPdfAttachment(item);
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
      size={boardKey === 'resources' ? 'lg' : 'md'}
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

function syncFilesToInput(input, files) {
  if (!input || typeof DataTransfer === 'undefined') return;
  const dt = new DataTransfer();
  for (const file of files || []) {
    if (file && typeof file !== 'string' && file.size) dt.items.add(file);
  }
  input.files = dt.files;
}

function ResourceCreateForm() {
  const router = useRouter();
  const { setSheetOpen } = useSheet();
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [state, formAction, pending] = useActionState(async (_prev, formData) => {
    try {
      if (!selectedFiles.length) {
        return { success: false, message: '첨부 파일을 추가해 주세요.' };
      }

      const uploaded = await uploadResourceFilesFromClient(selectedFiles);
      if (!uploaded.success) {
        return { success: false, message: uploaded.message };
      }

      formData.delete('files');
      formData.set('uploaded_files', JSON.stringify(uploaded.files));

      const result = await createBoardItem('resources', formData);
      if (result.success) {
        toast.success('자료가 등록되었습니다.');
        setSelectedFiles([]);
        setSheetOpen(false);
        router.refresh();
        return { success: true, message: '' };
      }
      return result;
    } catch (error) {
      console.error('[ResourceCreateForm]', error);
      return {
        success: false,
        message: error?.message || '등록 중 오류가 발생했습니다.',
      };
    }
  }, initialState);

  const addFiles = (fileList) => {
    const next = Array.from(fileList || []).filter((file) => file && file.size);
    if (!next.length) return;
    setSelectedFiles((prev) => {
      const existing = new Set(prev.map((file) => `${file.name}:${file.size}:${file.lastModified}`));
      const merged = [...prev];
      for (const file of next) {
        const key = `${file.name}:${file.size}:${file.lastModified}`;
        if (!existing.has(key)) merged.push(file);
      }
      syncFilesToInput(fileInputRef.current, merged);
      return merged;
    });
  };

  return (
    <form
      action={formAction}
      className="space-y-3"
      onSubmit={() => syncFilesToInput(fileInputRef.current, selectedFiles)}>
      <p className="text-xs text-muted-foreground">
        업로드된 파일은 포털에서 다운로드되지 않으며, 보안 뷰어로만 열람됩니다.
      </p>
      <input name="title" required placeholder="제목" className={inputClass} />
      <ResourceDescriptionField />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-medium">
            첨부 파일 <span className="text-destructive">*</span>
          </label>
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}>
            파일 추가
          </Button>
        </div>
        <input
          ref={fileInputRef}
          name="files"
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,application/pdf,image/*"
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
          }}
        />
        {selectedFiles.length > 0 ? (
          <ul className="space-y-2 rounded-md border bg-muted/30 p-2">
            {selectedFiles.map((file, index) => (
              <li
                key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                className="flex items-center gap-2 rounded-md bg-background px-2 py-1.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-semibold text-muted-foreground">
                  {/\.pdf$/i.test(file.name) ? 'PDF' : 'IMG'}
                </div>
                <span className="min-w-0 flex-1 truncate text-xs">{file.name}</span>
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  className="shrink-0 text-destructive hover:text-destructive"
                  onClick={() =>
                    setSelectedFiles((prev) => {
                      const next = prev.filter((_, i) => i !== index);
                      syncFilesToInput(fileInputRef.current, next);
                      return next;
                    })
                  }>
                  삭제
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-md border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
            아직 추가된 파일이 없습니다. <strong>파일 추가</strong>를 눌러 주세요.
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          PDF 또는 이미지(png/jpg/gif/webp), 각 최대 50MB · 여러 번 추가 가능
          {selectedFiles.length ? ` · 현재 ${selectedFiles.length}개` : ''}
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
        URL
        <input
          name="google_form_url"
          type="text"
          required
          placeholder="URL을 입력해 주세요"
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
                    {stripHtml(item.description)}
                  </div>
                )}
              </td>
              <td className="px-3 py-3">
                {(() => {
                  const files = normalizeClientResourceFiles(item);
                  if (!files.length) {
                    return <span className="text-xs text-muted-foreground">미등록</span>;
                  }
                  const first = files[0];
                  return (
                    <div>
                      <Badge variant="secondary" className="mb-1">
                        {files.length > 1
                          ? `${files.length}개`
                          : first.type === 'image'
                            ? '이미지'
                            : 'PDF'}
                      </Badge>
                      <div className="max-w-[180px] truncate text-xs text-muted-foreground">
                        {first.name || item.file_name}
                        {files.length > 1 ? ` 외 ${files.length - 1}개` : ''}
                      </div>
                    </div>
                  );
                })()}
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
  const [activeIndex, setActiveIndex] = useState(0);
  const files = normalizeClientResourceFiles(item);

  const openViewer = async (index = 0) => {
    setLoading(true);
    setOpen(true);
    setActiveIndex(index);
    const result = await getResourceViewUrl(item.id, index);
    setLoading(false);
    if (!result.success) {
      toast.error(result.message || '열람에 실패했습니다.');
      setOpen(false);
      return;
    }
    setView(result);
    setActiveIndex(result.index ?? index);
  };

  const switchFile = async (index) => {
    if (index === activeIndex && view?.url) return;
    setLoading(true);
    const result = await getResourceViewUrl(item.id, index);
    setLoading(false);
    if (!result.success) {
      toast.error(result.message || '열람에 실패했습니다.');
      return;
    }
    setView(result);
    setActiveIndex(result.index ?? index);
  };

  return (
    <>
      <Button
        size="xs"
        variant="outline"
        disabled={!files.length || loading}
        onClick={() => openViewer(0)}>
        열람
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setView(null);
            setActiveIndex(0);
          }
        }}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="pr-8">{view?.title || item.title}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            관리자 미리보기입니다. 포털 회원에게는 다운로드가 제공되지 않으며 뷰어 열람만 가능합니다.
          </p>
          {(view?.files || files).length > 1 && (
            <ul className="flex max-h-28 flex-col gap-1 overflow-y-auto rounded-md border bg-muted/20 p-2">
              {(view?.files || files).map((file, index) => (
                <li key={file.path || `${file.name}-${index}`}>
                  <button
                    type="button"
                    className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs ${
                      index === activeIndex
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => switchFile(index)}
                    disabled={loading}>
                    <span className="shrink-0 font-semibold">
                      {isResourcePdfAttachment(file) ? 'PDF' : 'IMG'}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{file.name || `첨부 ${index + 1}`}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
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
  const fileInputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [newFiles, setNewFiles] = useState([]);
  const [keptFiles, setKeptFiles] = useState(() => normalizeClientResourceFiles(item));
  const [state, formAction, pending] = useActionState(async (_prev, formData) => {
    try {
      if (newFiles.length) {
        const uploaded = await uploadResourceFilesFromClient(newFiles);
        if (!uploaded.success) {
          return { success: false, message: uploaded.message };
        }
        formData.delete('files');
        formData.set('uploaded_files', JSON.stringify(uploaded.files));
      }

      const result = await updateBoardItem('resources', item.id, formData);
      if (result.success) {
        toast.success('자료가 수정되었습니다.');
        setOpen(false);
        setNewFiles([]);
        router.refresh();
        return { success: true, message: '' };
      }
      return result;
    } catch (error) {
      console.error('[ResourceEditButton]', error);
      return {
        success: false,
        message: error?.message || '수정 중 오류가 발생했습니다.',
      };
    }
  }, initialState);

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setKeptFiles(normalizeClientResourceFiles(item));
      setNewFiles([]);
      syncFilesToInput(fileInputRef.current, []);
    }
  };

  const addFiles = (fileList) => {
    const next = Array.from(fileList || []).filter((file) => file && file.size);
    if (!next.length) return;
    setNewFiles((prev) => {
      const existing = new Set(prev.map((file) => `${file.name}:${file.size}:${file.lastModified}`));
      const merged = [...prev];
      for (const file of next) {
        const key = `${file.name}:${file.size}:${file.lastModified}`;
        if (!existing.has(key)) merged.push(file);
      }
      syncFilesToInput(fileInputRef.current, merged);
      return merged;
    });
  };

  return (
    <>
      <Button size="xs" variant="outline" onClick={() => handleOpenChange(true)}>
        수정
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>자료 수정</DialogTitle>
          </DialogHeader>
          <form
            action={formAction}
            className="space-y-3"
            onSubmit={() => syncFilesToInput(fileInputRef.current, newFiles)}>
            <input type="hidden" name="manage_files" value="1" />
            <input
              name="title"
              required
              defaultValue={item.title || ''}
              placeholder="제목"
              className={inputClass}
            />
            <ResourceDescriptionField defaultValue={item.description || ''} />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium">첨부 파일</label>
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}>
                  파일 추가
                </Button>
              </div>
              {keptFiles.length > 0 ? (
                <ul className="space-y-2 rounded-md border bg-muted/30 p-2">
                  {keptFiles.map((file) => {
                    const isPdf = isResourcePdfAttachment(file);
                    return (
                      <li
                        key={file.path}
                        className="flex items-center gap-2 rounded-md bg-background px-2 py-1.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-semibold text-muted-foreground">
                          {isPdf ? 'PDF' : 'IMG'}
                        </div>
                        <span className="min-w-0 flex-1 truncate text-xs">
                          {file.name || (isPdf ? 'document.pdf' : 'image')}
                        </span>
                        <input
                          type="hidden"
                          name="keep_files"
                          value={JSON.stringify({
                            path: file.path || '',
                            name: file.name || '',
                            type: file.type || (isPdf ? 'pdf' : 'image'),
                            bucket: file.bucket || '',
                          })}
                        />
                        <Button
                          type="button"
                          size="xs"
                          variant="ghost"
                          className="shrink-0 text-destructive hover:text-destructive"
                          onClick={() =>
                            setKeptFiles((prev) => prev.filter((f) => f.path !== file.path))
                          }>
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
                ref={fileInputRef}
                name="files"
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,application/pdf,image/*"
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files);
                }}
              />
              {newFiles.length > 0 && (
                <ul className="space-y-2 rounded-md border border-dashed bg-background p-2">
                  {newFiles.map((file, index) => (
                    <li
                      key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                      className="flex items-center gap-2 rounded-md bg-muted/30 px-2 py-1.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-semibold text-muted-foreground">
                        {/\.pdf$/i.test(file.name) ? 'PDF' : 'IMG'}
                      </div>
                      <span className="min-w-0 flex-1 truncate text-xs">
                        (새 파일) {file.name}
                      </span>
                      <Button
                        type="button"
                        size="xs"
                        variant="ghost"
                        className="shrink-0 text-destructive hover:text-destructive"
                        onClick={() =>
                          setNewFiles((prev) => {
                            const next = prev.filter((_, i) => i !== index);
                            syncFilesToInput(fileInputRef.current, next);
                            return next;
                          })
                        }>
                        삭제
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-muted-foreground">
                유지 {keptFiles.length}개 · 추가 예정 {newFiles.length}개 · PDF/이미지 각 50MB
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
              URL
              <input
                name="google_form_url"
                type="text"
                required
                defaultValue={item.google_form_url || ''}
                placeholder="URL을 입력해 주세요"
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
