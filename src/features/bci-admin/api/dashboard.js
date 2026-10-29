'use server';

import { createBciAdminClient } from '@/service/db/supabase/bci-server';
import { BCI_TABLES } from '../constants';
import {
  format,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subDays,
  eachDayOfInterval,
  parseISO,
} from 'date-fns';

const MEMBERS = BCI_TABLES.members;
const LOGIN_LOGS = 'advisory_login_logs';

export async function getDashboardData({ from, to } = {}) {
  const rangeEnd = to ? endOfDay(parseISO(to)) : endOfDay(new Date());
  const rangeStart = from ? startOfDay(parseISO(from)) : startOfDay(subDays(rangeEnd, 30));

  const empty = {
    totalMembers: 0,
    pendingMembers: 0,
    todayLogins: 0,
    monthLogins: 0,
    recentLogins: [],
    dailyTrend: buildEmptyTrend(rangeStart, rangeEnd),
    range: {
      from: format(rangeStart, 'yyyy-MM-dd'),
      to: format(rangeEnd, 'yyyy-MM-dd'),
    },
    errors: {},
  };

  try {
    const supa = await createBciAdminClient();
    const todayStart = startOfDay(new Date()).toISOString();
    const todayEnd = endOfDay(new Date()).toISOString();
    const monthStart = startOfMonth(new Date()).toISOString();
    const monthEnd = endOfMonth(new Date()).toISOString();

    const [totalRes, pendingRes, todayRes, monthRes, recentRes, trendRes] = await Promise.all([
      countMembers(supa),
      countMembers(supa, { status: 'pending' }),
      countLogins(supa, todayStart, todayEnd),
      countLogins(supa, monthStart, monthEnd),
      getRecentLogins(supa, 5),
      getDailyTrend(supa, rangeStart, rangeEnd),
    ]);

    return {
      success: true,
      data: {
        totalMembers: totalRes.count,
        pendingMembers: pendingRes.count,
        todayLogins: todayRes.count,
        monthLogins: monthRes.count,
        recentLogins: recentRes.data,
        dailyTrend: trendRes.data,
        range: empty.range,
        errors: {
          members: totalRes.error || pendingRes.error || null,
          logins: todayRes.error || monthRes.error || recentRes.error || trendRes.error || null,
        },
      },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: { ...empty, errors: { message: error.message } },
    };
  }
}

async function countMembers(supa, filters = {}) {
  try {
    let query = supa.from(MEMBERS).select('*', { count: 'exact', head: true });
    Object.entries(filters).forEach(([k, v]) => {
      query = query.eq(k, v);
    });
    const { count, error } = await query;
    if (error) return { count: 0, error: error.message };
    return { count: count || 0, error: null };
  } catch (error) {
    return { count: 0, error: error.message };
  }
}

async function countLogins(supa, fromIso, toIso) {
  try {
    const { count, error } = await supa
      .from(LOGIN_LOGS)
      .select('*', { count: 'exact', head: true })
      .gte('logged_in_at', fromIso)
      .lte('logged_in_at', toIso);

    if (error) {
      // fallback: last_login_at on members
      return countMembersByLastLogin(supa, fromIso, toIso, error.message);
    }
    return { count: count || 0, error: null };
  } catch (error) {
    return { count: 0, error: error.message };
  }
}

async function countMembersByLastLogin(supa, fromIso, toIso, originalError) {
  try {
    const { count, error } = await supa
      .from(MEMBERS)
      .select('*', { count: 'exact', head: true })
      .gte('last_login_at', fromIso)
      .lte('last_login_at', toIso);

    if (error) return { count: 0, error: originalError || error.message };
    return { count: count || 0, error: null };
  } catch (error) {
    return { count: 0, error: originalError || error.message };
  }
}

async function getRecentLogins(supa, limit = 5) {
  try {
    const { data, error } = await supa
      .from(LOGIN_LOGS)
      .select(
        'id, logged_in_at, member:advisory_members(id, name, affiliation, title, login_id)',
      )
      .order('logged_in_at', { ascending: false })
      .limit(limit);

    if (error) {
      return getRecentByLastLogin(supa, limit, error.message);
    }

    return {
      data: (data || []).map((row) => ({
        id: row.id,
        name: row.member?.name || '-',
        affiliation: row.member?.affiliation || '-',
        title: row.member?.title || '',
        loggedInAt: row.logged_in_at,
      })),
      error: null,
    };
  } catch (error) {
    return { data: [], error: error.message };
  }
}

async function getRecentByLastLogin(supa, limit, originalError) {
  try {
    const { data, error } = await supa
      .from(MEMBERS)
      .select('id, name, affiliation, title, login_id, last_login_at')
      .not('last_login_at', 'is', null)
      .order('last_login_at', { ascending: false })
      .limit(limit);

    if (error) return { data: [], error: originalError || error.message };

    return {
      data: (data || []).map((row) => ({
        id: row.id,
        name: row.name,
        affiliation: row.affiliation,
        title: row.title,
        loggedInAt: row.last_login_at,
      })),
      error: null,
    };
  } catch (error) {
    return { data: [], error: originalError || error.message };
  }
}

async function getDailyTrend(supa, rangeStart, rangeEnd) {
  const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
  const base = days.map((d) => ({
    date: format(d, 'yyyy-MM-dd'),
    label: format(d, 'MM/dd'),
    count: 0,
  }));

  try {
    const { data, error } = await supa
      .from(LOGIN_LOGS)
      .select('logged_in_at')
      .gte('logged_in_at', rangeStart.toISOString())
      .lte('logged_in_at', rangeEnd.toISOString());

    if (error) {
      return { data: base, error: error.message };
    }

    const map = Object.fromEntries(base.map((d) => [d.date, 0]));
    (data || []).forEach((row) => {
      const key = format(new Date(row.logged_in_at), 'yyyy-MM-dd');
      if (map[key] !== undefined) map[key] += 1;
    });

    return {
      data: base.map((d) => ({ ...d, count: map[d.date] || 0 })),
      error: null,
    };
  } catch (error) {
    return { data: base, error: error.message };
  }
}

function buildEmptyTrend(rangeStart, rangeEnd) {
  return eachDayOfInterval({ start: rangeStart, end: rangeEnd }).map((d) => ({
    date: format(d, 'yyyy-MM-dd'),
    label: format(d, 'MM/dd'),
    count: 0,
  }));
}
