# 뇌-AI-로봇 연동시스템 개발 자문단 구축 계획

소아 보행 재활 로봇 개발 자문단의 **포털 + 관리자 두 곳을 똑같이 복제**하고, **DB만 분리**한다.

DB 분리는 신규 Supabase 프로젝트가 아니라 **기존 프로젝트 안의 `bci` 스키마**로 한다. 무료 플랜은 조직당 활성 프로젝트가 2개로 제한돼 세 번째 프로젝트부터 유료다. 스키마 경계만으로 테이블은 완전히 갈라지고, 나중에 유료로 올리거나 프로젝트를 새로 만들면 `pg_dump --schema=bci` 로 그대로 떼어낼 수 있다.

| | 소아 (원본) | BCI (신규) |
| --- | --- | --- |
| 포털 | `www.angel-robotics.com/pediatric/login` | `www.angel-robotics.com/Adult_BCI/login` |
| 관리자 | `admin.angel-robotics.com` → 사이드바 "소아 보행 재활 로봇 개발 자문단" | 같은 관리자 → 사이드바 "뇌-AI-로봇 연동시스템 개발 자문단" |
| 포털 레포 | `angel-robotics-home-2025` | 같은 레포에 라우트 추가 |
| 관리자 레포 | `angel-robotics-admin-2025` | 같은 레포에 메뉴 추가 |
| DB | 기존 Supabase `public` 스키마 (홈페이지와 공용) | 같은 프로젝트 **`bci` 스키마** |
| 스토리지 | 기존 버킷 | 같은 프로젝트의 **새 버킷** (스토리지에는 스키마가 없음) |
| 메일 설정 | 기존 DB `settings_smtp` | 기존 DB 공용 (사유: 10번) |

도메인·Vercel 프로젝트는 신설하지 않는다. 포털도 관리자도 독립 앱이 아니라 기존 두 Next.js 앱에 얹힌 라우트 묶음이므로, 같은 앱에 두 번째 묶음을 추가하는 구조다.

---

## 복제 대상 규모

| | 파일 | LOC |
| --- | --- | --- |
| 포털 `src/app/pediatric/**` | 18 | |
| 포털 `src/features/pediatric-auth/**` | 14 | |
| 포털 `src/features/pediatric-portal/**` | 35 | |
| 포털 `src/app/api/pediatric/**` | 1 | |
| 포털 이미지 `public/images/pediatric/**` | 30 | — |
| **포털 합계** | **68 + 이미지 30** | **약 7,260** |
| 관리자 `src/app/(protected)/pediatric/**` | 7 | |
| 관리자 `src/features/pediatric-admin/**` | 13 | |
| **관리자 합계** | **20** | **약 4,870** |

---

## 네이밍 규칙

| 항목 | 소아 | BCI |
| --- | --- | --- |
| 포털 라우트 | `/pediatric` | `/Adult_BCI` |
| 관리자 라우트 | `/pediatric/*` | `/bci/*` |
| 폴더/모듈 | `pediatric-auth`, `pediatric-portal`, `pediatric-admin` | `bci-auth`, `bci-portal`, `bci-admin` |
| 상수 접두어 | `PEDIATRIC_*` | `BCI_*` |
| 세션 쿠키 | `pediatric_session` | `bci_session` |
| 세션 시크릿 | `PEDIATRIC_SESSION_SECRET` | `BCI_SESSION_SECRET` |
| DB 테이블 | `advisory_*` | **`advisory_*` 그대로** (DB가 달라 충돌 없음) |
| 알림메일 `table_id` | `advisory_members` | **`bci_members`** (수신자 설정은 기존 DB 공용이라 키가 겹치면 안 됨) |

치환 규칙: `pediatric` → `bci`, `Pediatric` → `Bci`, `PEDIATRIC` → `BCI`, 경로 문자열 `/pediatric` → `/Adult_BCI`, 이미지 경로 `/images/pediatric` → `/images/bci`.

---

## 1단계 · Supabase 준비 (직접 해주실 일)

> 대시보드 조작까지 포함한 단계별 안내서: [`docs/bci-supabase-setup.md`](bci-supabase-setup.md)

모두 **기존 프로젝트**(`yatcuzdvcerijtlzevvf`)에서 한다. 새 프로젝트는 만들지 않는다.

1. SQL Editor 에서 **[`sql/bci_schema.sql`](../sql/bci_schema.sql)** 실행 → `bci` 스키마 + 권한 + 테이블 7개 + 인덱스 + RLS.
2. **Project Settings → Data API → Exposed schemas 에 `bci` 추가.** 이걸 빠뜨리면 PostgREST 가 스키마를 못 봐서 모든 쿼리가 404 로 떨어진다. 1단계에서 가장 틀리기 쉬운 지점이다.
3. Storage → 버킷 **2개** 생성. 이름은 기존 버킷과 **반드시 다르게** — 같은 프로젝트라 이름이 겹치면 파일이 섞인다.
   - 첨부용 `bci-advisory` — **Public OFF** (자료실 PDF는 포털에서 다운로드 불가 · signed URL 전용)
   - 본문 이미지용 `bci-advisory-editor` — **Public ON**. CKEditor가 본문 HTML에 만료 없는 public URL을 박아 저장하므로 private이면 포털에서 이미지가 깨진다. 소아 자문단도 같은 구조(private 첨부 + public 본문)였다.
   - 정책은 기존 버킷 정책을 두 이름으로 복제. 필요한 건 에디터 버킷 insert(브라우저 anon 업로드)와 첨부 버킷 delete(업로드 실패 정리)뿐이고, 나머지 경로는 service_role이라 정책이 필요없다. 자세한 내역은 `sql/bci_schema.sql` 11번 주석.
4. Settings → API 에서 아래 3개 값 확보: `Project URL`, `anon key`, `service_role key`. 기존 프로젝트와 같은 값이지만 BCI 전용 환경변수로 등록한다(2단계).
5. 같은 프로젝트에서 **[`sql/bci_signup_alim_mail.sql`](../sql/bci_signup_alim_mail.sql)** 실행. 메일 설정은 `public` 스키마 공용이다(사유: 10번) — 이 스크립트만 `bci` 가 아니라 `public` 대상이다.

> `advisory_members` 는 원본 레포에 create 스크립트가 없어 코드에서 역산해 복원했다. `public.advisory_*` 가 같은 DB 에 있으니 SQL Editor 에서 바로 대조할 수 있다 — 컬럼이 다르면 운영 테이블 쪽을 기준으로 맞춘다.

데이터는 복사하지 않는다. 신규 자문단이므로 전 테이블 빈 상태로 시작하고, **소아 자문단 회원은 BCI 포털에 다시 가입해야 한다.**

---

## 2단계 · DB 분리 레이어 (두 레포 공통, 코드 작업의 출발점)

기존 `src/service/db/supabase/{server,client}.js` 는 **손대지 않는다.** 홈페이지·관리자 전체가 쓰는 공용 경로이므로 회귀 위험을 차단한다. 대신 BCI 전용 클라이언트를 새로 만든다.

```
src/service/db/supabase/bci-server.js   → createBciClient(), createBciAdminClient()
src/service/db/supabase/bci-client.js   → createBciBrowserClient()
```

신규 환경변수 (두 레포 동일):

```
BCI_SUPABASE_URL=
BCI_SUPABASE_ANON_KEY=
BCI_SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_BCI_SUPABASE_URL=
NEXT_PUBLIC_BCI_SUPABASE_ANON_KEY=
NEXT_PUBLIC_BCI_SUPABASE_STORAGE_BUCKET=   # 첨부 (private). 서버·브라우저가 같은 값을 봐야 하므로 공개 변수
NEXT_PUBLIC_BCI_SUPABASE_EDITOR_BUCKET=    # 본문 이미지 (public). 관리자 레포만 사용
BCI_SESSION_SECRET=            # openssl rand -base64 48 로 새로 생성
```

URL·키 4종은 **기존 프로젝트와 같은 값**을 넣는다. 그래도 전용 변수로 두는 이유는, 나중에 프로젝트를 떼어낼 때 값만 갈아끼우면 코드를 건드릴 필요가 없어서다.

스키마 이름은 환경변수가 아니라 `bci-config.js` 의 상수 `BCI_DB_SCHEMA` 다. 환경변수로 두면 값이 비거나 오타가 났을 때 `public` 스키마의 소아 데이터가 그대로 열리기 때문에, 분리 경계는 코드에 박아 둔다. 세 클라이언트 모두 `db: { schema: BCI_DB_SCHEMA }` 로 생성하므로 쿼리 코드는 `.from('advisory_members')` 를 그대로 쓴다.

**폴백을 넣지 않는다.** 현재 소아 코드에는 `PEDIATRIC_SUPABASE_STORAGE_BUCKET || NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` 식 폴백이 있는데, BCI 쪽에 그대로 복제하면 환경변수 하나만 누락돼도 **기존 버킷·기존 DB로 조용히 섞인다.** 미설정 시 즉시 에러가 나야 한다. 같은 이유로 `BCI_SESSION_SECRET` 도 `SUPABASE_SERVICE_ROLE_KEY` 폴백을 제거한다.

---

## 3단계 · 관리자 복제 (`angel-robotics-admin-2025`)

관리자를 먼저 올리면 Preview 에서 데이터를 넣어 둘 수 있어 포털 검증이 쉬워진다.

```
src/app/(protected)/pediatric/**  →  src/app/(protected)/bci/**        (7)
src/features/pediatric-admin/**   →  src/features/bci-admin/**         (13)
```

| 파일 | 작업 |
| --- | --- |
| `features/bci-admin/constants.js` | `BCI_SITE_NAME = '뇌-AI-로봇 연동시스템 개발 자문단'`, `BCI_TABLES`, `BCI_BOARD_META` |
| `features/bci-admin/api/{members,boards,dashboard}.js` | `createAdminClient` → `createBciAdminClient`, `revalidatePath` 경로 `/bci/*` |
| `features/bci-admin/api/members.js` | 승인·거절 메일 본문 사이트명, 포털 로그인 링크 `/Adult_BCI/login` |
| `features/bci-admin/api/boards.js` | 버킷 상수 `NEXT_PUBLIC_BCI_SUPABASE_STORAGE_BUCKET` 단일화 (폴백 제거), 레거시 버킷 재시도 제거 |
| `features/bci-admin/boards/boards-ui.jsx` | signed URL 업로드에 쓰는 브라우저 클라이언트를 `createBciBrowserClient()` 로 |
| `src/features/side-navbar/menu-tree.js` | `super_admin` 전용 새 섹션 추가 (기존 소아 섹션 유지) |
| `src/app/(protected)/bci/layout.jsx` | `checkSession({ permission: super_admin, redirectUrl: '/' })` 유지 |

관리자 로그인(`admin` 테이블 · next-auth)은 **기존 DB 그대로**. 같은 최고관리자가 두 자문단을 관리하므로 계정을 쪼갤 이유가 없다.

### 주의: 공용 CKEditor

자료실 본문 에디터([src/shared/editor/CKEditor5](../src/shared/editor/CKEditor5))는 이미지 업로드 시 **브라우저 클라이언트와 버킷명을 하드코딩**하고 있어, 그대로 쓰면 BCI 자료실 이미지가 기존 프로젝트 버킷에 올라간다. `supabaseClient` / `bucket` 을 옵션 prop 으로 받도록 확장하고 **기본값은 현재 동작 그대로** 둔다(기존 관리자 9개 모듈이 쓰는 공용 컴포넌트이므로).

---

## 4단계 · 포털 복제 (`angel-robotics-home-2025`)

```
src/app/pediatric/**             →  src/app/Adult_BCI/**         (18)
src/app/api/pediatric/**         →  src/app/api/Adult_BCI/**     (1)
src/features/pediatric-auth/**   →  src/features/bci-auth/**     (14)
src/features/pediatric-portal/** →  src/features/bci-portal/**   (35)
public/images/pediatric/**       →  public/images/bci/**         (30)
```

| 파일 | 작업 |
| --- | --- |
| `src/middleware.js` | `/Adult_BCI` 보호 블록 추가 (기존 `/pediatric` 블록 유지), `AUTH_PATHS`/`OPEN_PATHS` 별도 배열 |
| `features/bci-auth/session-cookie.js` | 쿠키명 `bci_session` |
| `features/bci-auth/session-token.js` | `BCI_SESSION_SECRET` 사용, 서비스롤 폴백 제거 |
| `features/bci-auth/{members-store,login-log,password-reset-store}.js` | `createBciAdminClient()` |
| `features/bci-auth/signup-notify.js` | `table_id = 'bci_members'`, 관리자 링크 `/bci/members?status=pending`, 메일 본문 사이트명 |
| `features/bci-auth/constants.js` | 데모 계정 시드(`DEMO_ACCOUNT`) 제거 |
| `features/bci-portal/site.js` | 사이트명·설명 교체 |
| `features/bci-portal/**/*-api.js` | BCI 클라이언트 + BCI 버킷 |
| `features/bci-portal/mock-data.js` | 사용처 확인 후 제거 |
| `app/api/Adult_BCI/resources/[id]/file/route.js` | BCI 서비스롤 + BCI 버킷, 레거시 버킷 폴백 제거 |
| `app/Adult_BCI/layout.jsx` | metadata 사이트명 |
| `next.config.mjs` | `/adult_bci`, `/adult-bci` → `/Adult_BCI` 리다이렉트 (라우트가 대소문자를 구분하므로 오타 404 방지). 이미지 도메인은 `remotePatterns: *.supabase.co` 가 이미 커버 |

### 브랜딩 콘텐츠

로고·배너(`greeting-banner.jpg`)·인사말·소개 문구는 BCI 용 콘텐츠를 받아 교체해야 한다. 받기 전까지는 소아 이미지를 그대로 두고 개발하고, 오픈 전 교체 항목으로 남긴다.

---

## 5단계 · Vercel 설정 + 배포

- 홈·관리자 **두 프로젝트 모두**에 7개 환경변수를 **Production / Preview / Development 전부** 등록. 포털도 서버 액션에서 서비스롤을 쓰므로 양쪽 다 필요하다.
- Preview 배포로 전체 검증 → main 머지.

---

## 검증 체크리스트

**기능**
- [ ] 가입 신청 → 관리자 알림메일 → 승인 → 승인 안내메일 → 로그인
- [ ] 비밀번호 찾기 메일 → 재설정 → 비밀번호 변경
- [ ] 자료실: 관리자 다중 첨부 업로드 → 포털 보안 뷰어 열람 → **다운로드/우클릭 저장 불가 확인**
- [ ] 행사: 이미지·PDF 첨부, 홈 공지 노출, 카테고리 3글자
- [ ] 설문: 구글폼 이동, 기간 종료 자동 표시
- [ ] 알림: 읽음 처리, 벨 카운트
- [ ] 대시보드: 접속·열람 로그 집계, 기간 필터
- [ ] 회원관리: 상태 탭, 검색, 관리자 메모, 엑셀 내보내기

**격리 — 가장 중요**
- [ ] BCI 에서 만든 회원·게시글이 `/pediatric` 포털과 소아 관리자 메뉴에 **보이지 않음** (반대 방향도)
- [ ] `bci.advisory_*` 에만 행이 생기고 `public.advisory_*` 는 그대로인지 SQL Editor 에서 직접 대조
- [ ] 파일이 새 버킷에만 올라가는지 (CKEditor 본문 이미지 포함)
- [ ] Exposed schemas 에서 `bci` 를 빼면 404 가 나는지 (스키마 경계가 실제로 작동하는지 확인)
- [ ] 두 포털 동시 로그인 가능, 한쪽 로그아웃이 다른 쪽에 영향 없음
- [ ] 환경변수를 하나 지웠을 때 기존 DB·버킷으로 폴백되지 않고 에러가 나는지

**회귀**
- [ ] 기존 홈페이지 문의·채용·다운로드 메일 발송 정상
- [ ] 기존 관리자 CKEditor 이미지 업로드 정상 (공용 컴포넌트 수정 영향)

---

## 리스크

| 리스크 | 대응 |
| --- | --- |
| `advisory_members` create 스크립트 부재 | 코드 역산본을 `sql/bci_schema.sql` 로 작성해 둠. 운영 DB 덤프로 대조 권장 |
| 환경변수 폴백으로 데이터가 섞임 | BCI 경로 폴백 전면 제거, 미설정 시 즉시 에러 |
| 공용 CKEditor 수정으로 기존 관리자 회귀 | 옵션 prop + 기본값 유지, 기존 모듈 1개 이상 수동 확인 |
| 코드 중복 약 12,000 LOC | 이후 버그 수정을 두 곳에 반영해야 함. "똑같이 복제" 요청대로 복제하되, 공통화 후보(보안 뷰어 · 세션 토큰 · 게시판 테이블 UI)는 메모로 남기고 운영 안정화 후 검토 |
| 소아 회원 재가입 필요 | DB 분리의 귀결. 사전 공지 필요 |
| 스키마 지정 누락 시 소아 데이터 노출 | 클라이언트 3곳에서 `db.schema` 고정, 스키마명은 환경변수가 아닌 코드 상수 |
| 쿼터·복구 단위 공유 | DB 500MB · 스토리지 1GB · 전송량이 홈페이지와 합산. 자료실 PDF 가 쌓이므로 스토리지를 주기적으로 확인. 특정 시점 복구는 양쪽이 함께 롤백된다 |
| 키 유출 범위 공유 | 프로젝트가 같아 `service_role` 키 하나가 `public` 과 `bci` 양쪽에 모두 닿는다. 별도 프로젝트였다면 키가 갈렸을 부분으로, 스키마 분리로는 막을 수 없다. 키는 Vercel 환경변수에만 두고 레포에 넣지 않는다 |
| 라우트 대소문자 | `/Adult_BCI` 정확히 일치해야 동작 → 소문자 리다이렉트 추가 |

---

## 10. 메일 설정을 기존 DB 공용으로 두는 이유

`settings_smtp` 는 자문단 전용이 아니라 **회사 전체가 쓰는 단일 행 인프라 설정**이고, `src/service/api/mailer.js` 가 이 한 행을 읽어 문의·채용·다운로드 요청 메일까지 전부 보낸다. `bci` 스키마로 복제하면,

- `mailer.js` / `send-alim-mail.js` 가 모듈마다 스키마를 분기해야 한다 → 기존 사이트의 **모든 메일 경로**가 회귀 위험권에 들어간다
- SMTP 비밀번호 변경 시 두 곳을 고쳐야 하고, 한쪽을 놓치면 BCI 메일만 조용히 끊긴다
- 관리자 `설정 → SMTP / 알림메일 수신자` 화면이 `NEXT_PUBLIC_SMTP_TABLE_NAME` 기준 단일 스키마에 묶여 있어 설정 UI 까지 복제해야 한다

DB 분리의 실질 목적은 **회원 개인정보와 게시판 데이터의 격리**이고 SMTP 계정은 그 범주가 아니다. 발신 명의는 `sendmail(..., { senderName })` 로 메일마다 지정할 수 있어, 공용 SMTP 를 쓰면서도 "뇌-AI-로봇 연동시스템 개발 자문단" 명의 발송이 된다.

나중에 BCI 를 별도 프로젝트로 떼어내거나 DB 소유권을 다른 기관에 넘길 계획이 있다면 복제가 맞다. 그 경우 추가 작업은 테이블 2개 복제 + 메일 함수 2개 파라미터화로, 반일 정도다.

---

## 확인이 필요한 항목

1. **BCI 포털 콘텐츠** — 인사말, 배너 이미지, 메뉴 구성이 소아와 동일한가? (동일 전제로 계획)
2. **가입 필드** — 소아와 동일(소속·진료과·직위·주소 등) 전제. 성인 BCI 자문단에 불필요하거나 추가할 항목이 있으면 스키마와 폼을 함께 수정
3. **알림메일 수신자** — 소아와 같은 담당자인가
4. `angel-homepage-home-2026` 레포는 pediatric 코드가 2025 와 **완전히 동일**하다. 이 레포도 쓰이는 중이면 같은 변경을 반영해야 함
