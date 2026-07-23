'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/shared/shadcn/components/ui/button';
import { createMemberByAdmin } from '../api/members';

const initialState = { success: false, message: '' };
const inputClass = 'h-9 w-full rounded-md border bg-background px-3 text-sm';

export function MemberCreateForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(async (_prev, formData) => {
    const result = await createMemberByAdmin({
      login_id: formData.get('login_id'),
      password: formData.get('password'),
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      birth_year: formData.get('birth_year'),
      affiliation: formData.get('affiliation'),
      department: formData.get('department'),
      title: formData.get('title'),
      address: formData.get('address'),
      status: formData.get('status') || 'approved',
    });

    if (result.success) {
      toast.success('회원이 등록되었습니다.');
      setOpen(false);
      router.refresh();
      return { success: true, message: '' };
    }

    return { success: false, message: result.message || '등록에 실패했습니다.' };
  }, initialState);

  if (!open) {
    return (
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        회원 등록
      </Button>
    );
  }

  return (
    <form action={formAction} className="mb-6 space-y-3 rounded-lg border bg-muted/20 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">회원 직접 등록</p>
        <Button type="button" size="xs" variant="ghost" onClick={() => setOpen(false)}>
          닫기
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        <input name="login_id" required placeholder="아이디 (영문소문자+숫자 6~20)" className={inputClass} />
        <input
          name="password"
          type="password"
          required
          placeholder="비밀번호 (영문+숫자+특수문자 8~20)"
          className={inputClass}
        />
        <input name="name" required placeholder="이름" className={inputClass} />
        <input name="email" type="email" required placeholder="이메일" className={inputClass} />
        <input name="phone" required placeholder="전화번호 (숫자만)" className={inputClass} />
        <input name="birth_year" placeholder="생년 (YYYY)" className={inputClass} />
        <input name="affiliation" required placeholder="소속" className={inputClass} />
        <input name="department" required placeholder="과(부서)" className={inputClass} />
        <input name="title" required placeholder="직급" className={inputClass} />
        <select name="status" defaultValue="approved" className={inputClass}>
          <option value="approved">승인 완료</option>
          <option value="pending">승인 대기</option>
          <option value="inactive">비활성</option>
        </select>
      </div>
      <input name="address" placeholder="주소 (선택)" className={inputClass} />

      {state?.message && !state.success && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? '등록 중...' : '등록'}
      </Button>
    </form>
  );
}
