'use server';

import { createHash, randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';
import { subDays } from 'date-fns';
import { createAdminClient } from '@/service/db/supabase/server';
import { setPagingIndexes } from '@/features/manage-modules/components/ui';
import { sendmail } from '@/service/api/mailer';
import {
  MEMBER_LIST_SELECT,
  MEMBER_STATUS_LABEL,
  PEDIATRIC_SITE_NAME,
  PEDIATRIC_TABLES,
} from '../constants';

const TABLE = PEDIATRIC_TABLES.members;
const LOGIN_LOGS = PEDIATRIC_TABLES.loginLogs;
const MEMBER_VIEWS = PEDIATRIC_TABLES.memberViews;

const CORE_SELECT =
  'id, login_id, email, name, birth_year, phone, affiliation, department, title, address, status, created_at, last_login_at';
const FULL_SELECT = MEMBER_LIST_SELECT;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getPediatricPortalOrigin() {
  const fromEnv =
    process.env.NEXT_PUBLIC_HOME_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_PEDIATRIC_SITE_URL;
  if (fromEnv) return String(fromEnv).replace(/\/$/, '');
  return 'https://angel-robotics.com';
}

function getApprovalMailBody({ name, loginId, loginUrl }) {
  return `
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>가입 승인 안내</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif; color: #333333; line-height: 1.5;">
  <div style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
    <div style="background-color: #f1f5f9; padding: 25px 30px;">
      <img src="https://angel-robotics.com/images/common/logo-angel.png" alt="엔젤로보틱스 로고" style="height: 24px; display: block;">
    </div>
    <div style="padding: 25px 30px 5px; border-bottom: 1px solid #e2e8f0;">
      <h1 style="margin: 0; color: #1e293b; font-size: 22px; font-weight: 700;">가입 승인 안내</h1>
      <p style="margin: 8px 0 0; color: #64748b; font-size: 14px;">${escapeHtml(PEDIATRIC_SITE_NAME)}</p>
    </div>
    <div style="padding: 20px 30px;">
      <p style="margin: 0 0 16px; font-size: 15px; color: #334155;">
        ${escapeHtml(name || loginId)}님, 가입 신청이 <strong>승인</strong>되었습니다.<br>
        아이디 <strong>${escapeHtml(loginId)}</strong> 로 아래 버튼을 통해 로그인할 수 있습니다.
      </p>
      <p style="margin: 0 0 20px; font-size: 13px; color: #64748b;">
        신청 시 등록한 비밀번호로 로그인해 주세요.
      </p>
      <a href="${escapeHtml(loginUrl)}" style="display: inline-block; background-color: #2563eb; color: white; font-weight: 600; text-decoration: none; padding: 12px 16px; border-radius: 6px; font-size: 14px;">
        포털 로그인
      </a>
    </div>
    <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 13px;">
      <p style="margin: 0;">© ANGEL ROBOTICS. 이 메일은 자동으로 발송되었습니다.</p>
    </div>
  </div>
</body>
</html>
  `;
}

async function sendMemberApprovalMail(member) {
  if (!member?.email) {
    return { success: false, message: '회원 이메일이 없습니다.' };
  }

  const loginUrl = `${getPediatricPortalOrigin()}/pediatric/login`;
  return sendmail(
    member.email,
    `[${PEDIATRIC_SITE_NAME}] 가입이 승인되었습니다`,
    getApprovalMailBody({
      name: member.name,
      loginId: member.login_id,
      loginUrl,
    }),
  );
}

async function runMembersQuery(buildQuery) {
  const first = await buildQuery(FULL_SELECT);
  if (!first.error) return first;

  const msg = first.error.message || '';
  if (
    msg.includes('does not exist') ||
    msg.includes('admin_memo') ||
    msg.includes('birth_date') ||
    msg.includes('admin_memo_updated')
  ) {
    return buildQuery(CORE_SELECT);
  }

  return first;
}

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(`${salt}:${password}`).digest('hex');
  return `${salt}:${hash}`;
}

function generateTempPassword() {
  const part = randomBytes(3).toString('hex');
  return `Tmp${part}!1a`;
}

function revalidateMembers() {
  revalidatePath('/pediatric/members');
  revalidatePath('/pediatric/dashboard');
}

function applySearchFilter(query, search, searchField) {
  if (!search) return query;
  const field = ['name', 'login_id', 'affiliation', 'email'].includes(searchField)
    ? searchField
    : null;

  if (field) {
    return query.ilike(field, `%${search}%`);
  }

  return query.or(
    `login_id.ilike.%${search}%,name.ilike.%${search}%,email.ilike.%${search}%,affiliation.ilike.%${search}%`,
  );
}

export async function getMemberStatusCounts() {
  try {
    const supa = await createAdminClient();
    const statuses = ['pending', 'approved', 'rejected', 'inactive'];

    const [totalRes, ...statusResults] = await Promise.all([
      supa.from(TABLE).select('*', { count: 'exact', head: true }),
      ...statuses.map((status) =>
        supa.from(TABLE).select('*', { count: 'exact', head: true }).eq('status', status),
      ),
    ]);

    if (totalRes.error) throw totalRes.error;

    const counts = { '': totalRes.count || 0 };
    statuses.forEach((status, i) => {
      counts[status] = statusResults[i].error ? 0 : statusResults[i].count || 0;
    });

    return { counts };
  } catch (error) {
    console.error(error);
    return { counts: { '': 0, pending: 0, approved: 0, rejected: 0, inactive: 0 } };
  }
}

export async function getMembers(searchParams = {}, itemsPerPage = 10) {
  try {
    const { search, searchField, page, status } = searchParams;
    const { startIndex, endIndex } = setPagingIndexes(page, itemsPerPage);
    const supa = await createAdminClient();

    const { data, count, error } = await runMembersQuery((selectCols) => {
      let query = supa
        .from(TABLE)
        .select(selectCols, { count: 'exact' })
        .range(startIndex, endIndex)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      query = applySearchFilter(query, search, searchField);
      return query;
    });

    if (error) throw error;

    const list = (data || []).map((item, i) => ({
      ...item,
      no: count - startIndex - i,
    }));

    return { data: list, count: count || 0 };
  } catch (error) {
    console.error(error);
    return {
      data: [],
      count: 0,
      errors: { message: error.message || '회원 목록을 불러오지 못했습니다.' },
    };
  }
}

export async function getMembersForExport(searchParams = {}) {
  try {
    const { search, searchField, status } = searchParams;
    const supa = await createAdminClient();

    const { data, error } = await runMembersQuery((selectCols) => {
      let query = supa
        .from(TABLE)
        .select(selectCols)
        .order('created_at', { ascending: false })
        .limit(5000);

      if (status) {
        query = query.eq('status', status);
      }

      query = applySearchFilter(query, search, searchField);
      return query;
    });

    if (error) throw error;

    return { data: data || [] };
  } catch (error) {
    console.error(error);
    return { data: [], errors: { message: error.message || '내보내기 데이터를 불러오지 못했습니다.' } };
  }
}

export async function getMemberDetail(id) {
  try {
    if (!id) return { data: null, errors: { message: '회원 ID가 없습니다.' } };

    const supa = await createAdminClient();
    const { data: member, error } = await runMembersQuery((selectCols) =>
      supa.from(TABLE).select(selectCols).eq('id', id).single(),
    );

    if (error) throw error;

    const since = subDays(new Date(), 30).toISOString();
    const activity = await getMemberActivity(supa, id, since);

    return { data: { ...member, activity } };
  } catch (error) {
    console.error(error);
    return {
      data: null,
      errors: { message: error.message || '회원 상세를 불러오지 못했습니다.' },
    };
  }
}

async function getMemberActivity(supa, memberId, sinceIso) {
  const empty = { loginCount: 0, resourceViews: 0, eventViews: 0 };

  try {
    const [loginRes, resourceRes, eventRes] = await Promise.all([
      supa
        .from(LOGIN_LOGS)
        .select('*', { count: 'exact', head: true })
        .eq('member_id', memberId)
        .gte('logged_in_at', sinceIso),
      countViews(supa, memberId, 'resource', sinceIso),
      countViews(supa, memberId, 'event', sinceIso),
    ]);

    return {
      loginCount: loginRes.error ? 0 : loginRes.count || 0,
      resourceViews: resourceRes,
      eventViews: eventRes,
    };
  } catch {
    return empty;
  }
}

async function countViews(supa, memberId, contentType, sinceIso) {
  try {
    const { count, error } = await supa
      .from(MEMBER_VIEWS)
      .select('*', { count: 'exact', head: true })
      .eq('member_id', memberId)
      .eq('content_type', contentType)
      .gte('viewed_at', sinceIso);

    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}

export async function updateMemberStatus(id, status) {
  try {
    if (!['pending', 'approved', 'rejected', 'inactive'].includes(status)) {
      return { success: false, message: '잘못된 상태입니다.' };
    }

    const supa = await createAdminClient();
    const { data: existing, error: findError } = await supa
      .from(TABLE)
      .select('id, email, name, login_id, status')
      .eq('id', id)
      .single();

    if (findError) throw findError;
    if (!existing) {
      return { success: false, message: '회원을 찾을 수 없습니다.' };
    }

    const previousStatus = existing.status;
    const { error } = await supa.from(TABLE).update({ status }).eq('id', id);
    if (error) throw error;

    revalidateMembers();

    // 승인으로 바뀔 때만 안내 메일 (이미 승인된 회원 재저장은 제외)
    if (status === 'approved' && previousStatus !== 'approved') {
      const mailResult = await sendMemberApprovalMail(existing);
      if (!mailResult?.success) {
        console.error('[updateMemberStatus] approval mail failed', mailResult);
        return {
          success: true,
          message: '승인되었습니다. 다만 안내 메일 발송에 실패했습니다.',
          mailSent: false,
        };
      }
      return {
        success: true,
        message: '승인되었습니다. 회원에게 안내 메일을 발송했습니다.',
        mailSent: true,
      };
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message || '상태 변경에 실패했습니다.' };
  }
}

export async function updateMemberProfile(id, payload) {
  try {
    const allowed = [
      'name',
      'email',
      'phone',
      'birth_year',
      'birth_date',
      'affiliation',
      'department',
      'title',
      'address',
    ];

    const updates = {};
    for (const key of allowed) {
      if (payload[key] !== undefined) {
        updates[key] = String(payload[key] ?? '').trim();
      }
    }

    if (updates.birth_date && !updates.birth_year) {
      updates.birth_year = updates.birth_date.slice(0, 4);
    }

    if (updates.email) {
      updates.email = updates.email.toLowerCase();
    }

    const supa = await createAdminClient();
    // birth_date 컬럼이 없을 수 있어 실패 시 birth_year만 저장
    let { data, error } = await supa
      .from(TABLE)
      .update(updates)
      .eq('id', id)
      .select(CORE_SELECT)
      .single();

    if (error && updates.birth_date && String(error.message || '').includes('birth_date')) {
      const { birth_date, ...withoutBirthDate } = updates;
      const retry = await supa
        .from(TABLE)
        .update(withoutBirthDate)
        .eq('id', id)
        .select(CORE_SELECT)
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw error;

    revalidateMembers();
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message || '회원 정보 수정에 실패했습니다.' };
  }
}

export async function updateMemberMemo(id, memo, adminName = '관리자') {
  try {
    const supa = await createAdminClient();
    const { data, error } = await supa
      .from(TABLE)
      .update({
        admin_memo: String(memo ?? ''),
        admin_memo_updated_at: new Date().toISOString(),
        admin_memo_updated_by: adminName || '관리자',
      })
      .eq('id', id)
      .select(CORE_SELECT)
      .single();

    if (error) {
      if (String(error.message || '').includes('admin_memo')) {
        return {
          success: false,
          message: 'admin_memo 컬럼이 없습니다. sql/advisory_members_admin.sql 을 실행해 주세요.',
        };
      }
      throw error;
    }

    revalidateMembers();
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message || '메모 저장에 실패했습니다.' };
  }
}

export async function resetMemberPassword(id) {
  try {
    const supa = await createAdminClient();
    const { data: member, error: findError } = await supa
      .from(TABLE)
      .select('id, email, name, login_id')
      .eq('id', id)
      .single();

    if (findError) throw findError;
    if (!member?.email) {
      return { success: false, message: '회원 이메일이 없습니다.' };
    }

    const tempPassword = generateTempPassword();
    const { error: updateError } = await supa
      .from(TABLE)
      .update({ password_hash: hashPassword(tempPassword) })
      .eq('id', id);

    if (updateError) throw updateError;

    const mailResult = await sendmail(
      member.email,
      `[${PEDIATRIC_SITE_NAME}] 비밀번호가 초기화되었습니다`,
      `
        <p>${member.name || member.login_id}님,</p>
        <p>관리자에 의해 비밀번호가 초기화되었습니다.</p>
        <p>임시 비밀번호: <strong>${tempPassword}</strong></p>
        <p>로그인 후 반드시 비밀번호를 변경해 주세요.</p>
      `,
    );

    if (!mailResult?.success) {
      return {
        success: false,
        message: mailResult?.error || '비밀번호는 변경되었으나 메일 발송에 실패했습니다.',
        tempPassword,
      };
    }

    revalidateMembers();
    return { success: true, message: '임시 비밀번호를 회원 이메일로 발송했습니다.' };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message || '비밀번호 초기화에 실패했습니다.' };
  }
}

export async function deleteMember(id) {
  try {
    const supa = await createAdminClient();
    const { error } = await supa.from(TABLE).delete().eq('id', id);
    if (error) throw error;

    revalidateMembers();
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message || '회원 삭제에 실패했습니다.' };
  }
}

const LOGIN_ID_REGEX = /^[a-z0-9]{6,20}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 관리자가 회원 직접 등록 (기본 승인 완료) */
export async function createMemberByAdmin(payload) {
  try {
    const loginId = String(payload.login_id || '')
      .trim()
      .toLowerCase();
    const email = String(payload.email || '')
      .trim()
      .toLowerCase();
    const password = String(payload.password || '');
    const name = String(payload.name || '').trim();
    const birthYear = String(payload.birth_year || '').trim();
    const phone = String(payload.phone || '').replace(/\D/g, '');
    const affiliation = String(payload.affiliation || '').trim();
    const department = String(payload.department || '').trim();
    const title = String(payload.title || '').trim();
    const address = String(payload.address || '').trim();
    const status = ['pending', 'approved', 'inactive'].includes(payload.status)
      ? payload.status
      : 'approved';

    if (!LOGIN_ID_REGEX.test(loginId)) {
      return { success: false, message: '아이디는 영문 소문자·숫자 6~20자여야 합니다.' };
    }
    if (!PASSWORD_REGEX.test(password)) {
      return {
        success: false,
        message: '비밀번호는 영문·숫자·특수문자 조합 8~20자여야 합니다.',
      };
    }
    if (!name) return { success: false, message: '이름을 입력해 주세요.' };
    if (!EMAIL_REGEX.test(email)) return { success: false, message: '올바른 이메일이 아닙니다.' };
    if (!phone) return { success: false, message: '전화번호를 입력해 주세요.' };
    if (!affiliation || !department || !title) {
      return { success: false, message: '소속·과·직급을 입력해 주세요.' };
    }

    const supa = await createAdminClient();

    const { data: dupId } = await supa
      .from(TABLE)
      .select('id')
      .eq('login_id', loginId)
      .maybeSingle();
    if (dupId) return { success: false, message: '이미 사용 중인 아이디입니다.' };

    const { data: dupEmail } = await supa
      .from(TABLE)
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (dupEmail) return { success: false, message: '이미 등록된 이메일입니다.' };

    const insertPayload = {
      login_id: loginId,
      email,
      password_hash: hashPassword(password),
      name,
      birth_year: birthYear || '',
      phone,
      affiliation,
      department,
      title,
      address,
      status,
    };

    if (birthYear) {
      insertPayload.birth_date = `${birthYear}-01-01`;
    }

    let { data, error } = await supa.from(TABLE).insert(insertPayload).select(CORE_SELECT).single();

    if (error && String(error.message || '').includes('birth_date')) {
      const { birth_date: _bd, ...withoutBirthDate } = insertPayload;
      ({ data, error } = await supa
        .from(TABLE)
        .insert(withoutBirthDate)
        .select(CORE_SELECT)
        .single());
    }

    if (error) throw error;

    revalidateMembers();
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message || '회원 등록에 실패했습니다.' };
  }
}

export async function getMemberStatusLabel(status) {
  return MEMBER_STATUS_LABEL[status] || status;
}
