'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/utils';

export function AccessTrendChart({ data = [] }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const update = () => setWidth(el.clientWidth);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const height = 220;
  const padding = { top: 24, right: 16, bottom: 32, left: 36 };
  const innerW = Math.max(0, width - padding.left - padding.right);
  const innerH = height - padding.top - padding.bottom;

  const max = Math.max(10, ...data.map((d) => d.count));
  const yTicks = [0, Math.round(max / 2), max];

  const points = data.map((d, i) => {
    const x = data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW;
    const y = innerH - (d.count / max) * innerH;
    return { ...d, x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${innerH} L ${points[0].x} ${innerH} Z`
      : '';

  // 너비에 맞춰 x축 라벨 개수 조절
  const labelCount = Math.max(4, Math.floor(innerW / 72));
  const labelStep = Math.max(1, Math.ceil(data.length / labelCount));

  return (
    <div ref={containerRef} className="w-full">
      {width > 0 && (
        <svg width={width} height={height} className="block">
          <g transform={`translate(${padding.left}, ${padding.top})`}>
            {yTicks.map((tick) => {
              const y = innerH - (tick / max) * innerH;
              return (
                <g key={tick}>
                  <line
                    x1={0}
                    x2={innerW}
                    y1={y}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeWidth="1"
                    strokeDasharray="3 5"
                  />
                  <text x={-8} y={y + 4} textAnchor="end" fill="#94A3B8" fontSize="13">
                    {tick}
                  </text>
                </g>
              );
            })}

            {areaPath && <path d={areaPath} fill="rgba(37, 99, 235, 0.1)" />}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#2563EB"
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {points.map((p) => (
              <g key={p.date}>
                <circle cx={p.x} cy={p.y} r="2.5" fill="#2563EB" />
                {p.count > 0 && (
                  <text
                    x={p.x}
                    y={p.y - 8}
                    textAnchor="middle"
                    fill="#475569"
                    fontSize="12"
                    fontWeight="500"
                  >
                    {p.count}
                  </text>
                )}
              </g>
            ))}

            {points.map((p, i) =>
              i % labelStep === 0 || i === points.length - 1 ? (
                <text
                  key={`label-${p.date}`}
                  x={p.x}
                  y={innerH + 20}
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="13"
                >
                  {p.label}
                </text>
              ) : null,
            )}
          </g>
        </svg>
      )}
    </div>
  );
}

export function DashboardStatCards({ stats }) {
  const cards = [
    {
      label: '전체 회원',
      value: stats.totalMembers,
      desc: '등록된 전체 회원 수',
      iconBg: 'bg-blue-50 text-blue-600',
      icon: UsersIcon,
    },
    {
      label: '승인 대기',
      value: stats.pendingMembers,
      desc: '승인 대기 중인 회원 수',
      iconBg: 'bg-amber-50 text-amber-600',
      icon: ClockIcon,
      href: '/bci/members?status=pending',
    },
    {
      label: '오늘 접속',
      value: stats.todayLogins,
      desc: '오늘 로그인한 회원 수',
      iconBg: 'bg-emerald-50 text-emerald-600',
      icon: CheckIcon,
    },
    {
      label: '이번달 접속',
      value: stats.monthLogins,
      desc: '이번달 로그인한 회원 수',
      iconBg: 'bg-violet-50 text-violet-600',
      icon: CalendarIcon,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
      {cards.map((card) => {
        const Icon = card.icon;
        const Wrapper = card.href ? 'a' : 'div';
        return (
          <Wrapper
            key={card.label}
            href={card.href}
            className={cn(
              'rounded-xl border bg-white p-5 shadow-sm',
              card.href && 'transition-shadow hover:shadow-md',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {card.value}
                  <span className="ml-1 text-base font-medium text-slate-500">명</span>
                </p>
                <p className="mt-2 text-xs text-slate-400">{card.desc}</p>
              </div>
              <span className={cn('inline-flex h-10 w-10 items-center justify-center rounded-full', card.iconBg)}>
                <Icon />
              </span>
            </div>
          </Wrapper>
        );
      })}
    </div>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  );
}
