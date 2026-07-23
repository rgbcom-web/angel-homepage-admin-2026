'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/shadcn/components/ui/badge';
import { Button } from '@/shared/shadcn/components/ui/button';
import { Textarea } from '@/shared/shadcn/components/ui/textarea';
import { Input } from '@/shared/shadcn/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/shadcn/components/ui/dialog';
import { ConfirmDialog } from '@/features/components/dialogs/confirm-dialog';
import {
  deleteMember,
  getMemberDetail,
  resetMemberPassword,
  updateMemberMemo,
  updateMemberProfile,
  updateMemberStatus,
} from '../api/members';
import { MEMBER_STATUS_LABEL } from '../constants';
import { useAuth } from '@/features/auth/AuthSessionProvider';

function formatDate(value, withTime = false) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  if (withTime) {
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
  return date.toLocaleDateString('ko-KR');
}

function formatPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone || '-';
}

export function StatusBadge({ status }) {
  const variant =
    status === 'approved'
      ? 'positiveLight'
      : status === 'inactive' || status === 'rejected'
        ? 'destructive'
        : 'secondary';

  return <Badge variant={variant}>{MEMBER_STATUS_LABEL[status] || status}</Badge>;
}

export function MembersTable({ list }) {
  const [detailId, setDetailId] = useState(null);

  if (!list?.length) {
    return (
      <div className="rounded-lg border py-16 text-center text-sm text-muted-foreground">
        등록된 회원이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[1100px] text-sm">
          <thead className="border-b bg-muted/40 text-left">
            <tr>
              <th className="px-3 py-3 font-medium">이름</th>
              <th className="px-3 py-3 font-medium">소속</th>
              <th className="px-3 py-3 font-medium">과</th>
              <th className="px-3 py-3 font-medium">직급</th>
              <th className="px-3 py-3 font-medium">이메일</th>
              <th className="px-3 py-3 font-medium">가입일</th>
              <th className="px-3 py-3 font-medium">최근 로그인</th>
              <th className="px-3 py-3 font-medium">상태</th>
              <th className="px-3 py-3 font-medium">관리</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr
                key={item.id}
                className={cn(
                  'border-b last:border-b-0',
                  detailId === item.id && 'bg-primary/5',
                )}
              >
                <td className="px-3 py-3 font-medium">{item.name}</td>
                <td className="px-3 py-3">{item.affiliation || '-'}</td>
                <td className="px-3 py-3">{item.department || '-'}</td>
                <td className="px-3 py-3">{item.title || '-'}</td>
                <td className="px-3 py-3">{item.email}</td>
                <td className="px-3 py-3 text-muted-foreground">{formatDate(item.created_at)}</td>
                <td className="px-3 py-3 text-muted-foreground">
                  {formatDate(item.last_login_at, true)}
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-3 py-3">
                  <Button
                    size="xs"
                    variant={detailId === item.id ? 'default' : 'outline'}
                    onClick={() => setDetailId(item.id)}
                  >
                    상세보기
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detailId && (
        <MemberDetailPanel
          memberId={detailId}
          onClose={() => setDetailId(null)}
          onChanged={() => setDetailId(detailId)}
        />
      )}
    </div>
  );
}

function MemberDetailPanel({ memberId, onClose, onChanged }) {
  const router = useRouter();
  const { user } = useAuth();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [memoEditing, setMemoEditing] = useState(false);
  const [memo, setMemo] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const load = async () => {
    setLoading(true);
    const { data, errors } = await getMemberDetail(memberId);
    if (errors?.message) {
      toast.error(errors.message);
      setDetail(null);
    } else {
      setDetail(data);
      setMemo(data?.admin_memo || '');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [memberId]);

  const refresh = () => {
    load();
    onChanged?.();
    router.refresh();
  };

  if (loading) {
    return (
      <div className="rounded-xl border bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
        회원 상세 정보를 불러오는 중...
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="rounded-xl border px-6 py-12 text-center text-sm text-muted-foreground">
        회원 정보를 찾을 수 없습니다.
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    );
  }

  const activity = detail.activity || { loginCount: 0, resourceViews: 0, eventViews: 0 };
  const birthDisplay =
    detail.birth_date || (detail.birth_year ? `${detail.birth_year}-01-01` : '-');

  const runStatus = (status, successMessage) => {
    startTransition(async () => {
      const result = await updateMemberStatus(detail.id, status);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(successMessage);
      refresh();
    });
  };

  const saveMemo = () => {
    startTransition(async () => {
      const result = await updateMemberMemo(detail.id, memo, user?.name || '관리자');
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success('메모가 저장되었습니다.');
      setMemoEditing(false);
      refresh();
    });
  };

  const handleResetPassword = async () => {
    const result = await resetMemberPassword(detail.id);
    if (!result.success) {
      toast.error(result.message);
      if (result.tempPassword) {
        toast.message(`임시 비밀번호: ${result.tempPassword}`);
      }
      return;
    }
    toast.success(result.message);
  };

  const handleDelete = async () => {
    const result = await deleteMember(detail.id);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success('회원이 삭제되었습니다.');
    onClose();
    router.refresh();
  };

  return (
    <section className="rounded-xl border bg-background shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="text-lg font-semibold">회원 상세 정보</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          닫기
        </Button>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[1.1fr_1.2fr_220px]">
        {/* 프로필 */}
        <div className="space-y-3 text-sm">
          <ProfileRow label="이름" value={detail.name} />
          <ProfileRow label="ID" value={detail.login_id} />
          <ProfileRow label="생년월일" value={birthDisplay} />
          <ProfileRow label="이메일" value={detail.email} />
          <ProfileRow label="전화번호" value={formatPhone(detail.phone)} />
          <ProfileRow label="소속" value={detail.affiliation} />
          <ProfileRow label="과" value={detail.department} />
          <ProfileRow label="직급" value={detail.title} />
          <ProfileRow label="주소" value={detail.address || '-'} />
          <ProfileRow label="가입일" value={formatDate(detail.created_at)} />
          <ProfileRow label="최근 로그인" value={formatDate(detail.last_login_at, true)} />
          <div className="flex gap-3 border-b border-dashed py-2 last:border-b-0">
            <span className="w-24 shrink-0 text-muted-foreground">상태</span>
            <StatusBadge status={detail.status} />
          </div>
        </div>

        {/* 활동 + 메모 */}
        <div className="space-y-5">
          <div>
            <h3 className="mb-3 text-sm font-semibold">활동 정보 (최근 30일)</h3>
            <div className="grid grid-cols-3 gap-3">
              <ActivityCard label="로그인 횟수" value={`${activity.loginCount}회`} />
              <ActivityCard label="자료 열람" value={`${activity.resourceViews}건`} />
              <ActivityCard label="행사 조회" value={`${activity.eventViews}건`} />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">관리자 메모</h3>
              {!memoEditing && (
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  className="gap-1"
                  onClick={() => setMemoEditing(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  수정
                </Button>
              )}
            </div>
            {memoEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  rows={4}
                  placeholder="관리자 메모를 입력하세요."
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setMemo(detail.admin_memo || '');
                      setMemoEditing(false);
                    }}
                  >
                    취소
                  </Button>
                  <Button type="button" size="sm" disabled={pending} onClick={saveMemo}>
                    저장
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border bg-muted/20 px-4 py-3">
                <p className="min-h-[60px] whitespace-pre-wrap text-sm text-foreground">
                  {detail.admin_memo || '등록된 메모가 없습니다.'}
                </p>
                {detail.admin_memo_updated_at && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    최종 수정일: {formatDate(detail.admin_memo_updated_at, true)} (
                    {detail.admin_memo_updated_by || '관리자'})
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 액션 */}
        <div className="flex flex-col gap-2">
          {detail.status === 'pending' && (
            <>
              <Button disabled={pending} onClick={() => runStatus('approved', '승인되었습니다.')}>
                승인
              </Button>
              <Button
                variant="destructiveOutline"
                disabled={pending}
                onClick={() => runStatus('rejected', '거절 처리되었습니다.')}
              >
                거절
              </Button>
            </>
          )}

          <Button onClick={() => setEditOpen(true)}>회원 정보 수정</Button>

          <ConfirmDialog
            title="비밀번호 초기화"
            description="임시 비밀번호를 생성하여 회원 이메일로 발송합니다. 계속할까요?"
            onActionClick={handleResetPassword}
            button={
              <Button variant="outline" className="w-full">
                비밀번호 초기화
              </Button>
            }
          />

          {detail.status !== 'inactive' && detail.status !== 'pending' && (
            <ConfirmDialog
              title="회원 비활성화"
              description="비활성화하면 포털 로그인이 제한됩니다. 계속할까요?"
              onActionClick={async () => {
                const result = await updateMemberStatus(detail.id, 'inactive');
                if (!result.success) {
                  toast.error(result.message);
                  return;
                }
                toast.success('회원이 비활성화되었습니다.');
                refresh();
              }}
              button={
                <Button variant="destructiveOutline" className="w-full">
                  회원 비활성화
                </Button>
              }
            />
          )}

          {detail.status === 'inactive' && (
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => runStatus('approved', '회원이 다시 활성화되었습니다.')}
            >
              회원 활성화
            </Button>
          )}

          <ConfirmDialog
            title="회원 삭제"
            description="회원 데이터와 접속 로그가 삭제됩니다. 이 작업은 되돌릴 수 없습니다."
            onActionClick={handleDelete}
            button={
              <Button variant="destructiveOutline" className="w-full">
                회원 삭제
              </Button>
            }
          />
        </div>
      </div>

      <MemberEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        member={detail}
        onSaved={refresh}
      />
    </section>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex gap-3 border-b border-dashed py-2 last:border-b-0">
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 break-words font-medium">{value || '-'}</span>
    </div>
  );
}

function ActivityCard({ label, value }) {
  return (
    <div className="rounded-lg border bg-muted/10 px-3 py-4 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function MemberEditDialog({ open, onOpenChange, member, onSaved }) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({});

  useEffect(() => {
    if (!open || !member) return;
    setForm({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      birth_date: member.birth_date || (member.birth_year ? `${member.birth_year}-01-01` : ''),
      affiliation: member.affiliation || '',
      department: member.department || '',
      title: member.title || '',
      address: member.address || '',
    });
  }, [open, member]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = (e) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateMemberProfile(member.id, form);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success('회원 정보가 수정되었습니다.');
      onOpenChange(false);
      onSaved?.();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>회원 정보 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          {[
            ['name', '이름'],
            ['email', '이메일'],
            ['phone', '전화번호'],
            ['birth_date', '생년월일'],
            ['affiliation', '소속'],
            ['department', '과'],
            ['title', '직급'],
            ['address', '주소'],
          ].map(([key, label]) => (
            <div key={key} className="grid gap-1.5">
              <label className="text-sm font-medium" htmlFor={`edit-${key}`}>
                {label}
              </label>
              <Input
                id={`edit-${key}`}
                value={form[key] || ''}
                onChange={(e) => setField(key, e.target.value)}
                type={key === 'birth_date' ? 'date' : 'text'}
              />
            </div>
          ))}
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
