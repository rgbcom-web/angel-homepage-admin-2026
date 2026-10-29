# 1단계 · BCI 자문단 Supabase 준비

뇌-AI-로봇 연동시스템 개발 자문단은 **기존 Supabase 프로젝트 안의 `bci` 스키마**와 **전용 버킷 2개**를 씁니다. 새 프로젝트를 만들지 않습니다.

- 대상 프로젝트: 지금 홈페이지·소아 자문단이 쓰는 그 프로젝트
- 소요: 15~20분
- 끝나면 5단계(Vercel 환경변수)로 넘어갑니다

> 대시보드 메뉴 이름은 Supabase 버전에 따라 조금 다릅니다. 못 찾으면 Settings 안에서 "Exposed" 또는 "Data API" 로 검색하세요.

---

## 1. 스키마와 테이블 만들기

1. Supabase 대시보드 → **SQL Editor** → New query
2. [`sql/bci_schema.sql`](../sql/bci_schema.sql) 전체를 붙여넣고 **Run**

만들어지는 것: `bci` 스키마, 권한(grant), 테이블 7개, 인덱스, RLS 활성화.

**확인** — SQL Editor 에서

```sql
select table_name from information_schema.tables
where table_schema = 'bci' order by table_name;
```

7개가 나와야 합니다: `advisory_events`, `advisory_login_logs`, `advisory_member_views`, `advisory_members`, `advisory_notification_reads`, `advisory_resources`, `advisory_surveys`.

**확인** — `public` 쪽은 그대로여야 합니다. 소아 자문단 데이터가 줄거나 늘지 않았는지 보세요.

```sql
select count(*) from public.advisory_members;   -- 기존 숫자 그대로
select count(*) from bci.advisory_members;      -- 0
```

> 이 스크립트는 레포의 `sql/advisory_*.sql` 과 애플리케이션 코드에서 역산한 것입니다. `advisory_members` 는 원본에 create 스크립트가 없어 코드 기준으로 복원했습니다. 같은 DB 안에 원본이 있으니 컬럼을 직접 대조해 보고, 다르면 **운영 테이블 쪽을 기준으로** 맞추세요.
>
> ```sql
> select column_name, data_type from information_schema.columns
> where table_schema in ('public','bci') and table_name = 'advisory_members'
> order by table_schema, column_name;
> ```

---

## 2. Data API 에 `bci` 스키마 노출 ← 가장 틀리기 쉬운 지점

PostgREST(Supabase REST API)는 **노출 목록에 등록된 스키마만** 봅니다. SQL 권한을 줬어도 이 설정을 빠뜨리면 앱의 모든 쿼리가 실패합니다.

1. **Project Settings → Data API** (구버전은 Settings → API)
2. **Exposed schemas** 에 `bci` 추가 → Save
   - 기존 값(`public`, `graphql_public` 등)은 **지우지 말고** 뒤에 추가합니다
3. 저장하면 API 가 재시작됩니다. 몇 초 기다리세요

**확인** — anon 키는 공개 값이라 그대로 써도 됩니다. `<PROJECT_URL>` 과 `<ANON_KEY>` 를 넣어 실행하세요.

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  "<PROJECT_URL>/rest/v1/advisory_members?select=id&limit=1" \
  -H "apikey: <ANON_KEY>" -H "Accept-Profile: bci"
```

- `200` → 스키마가 노출됐습니다. (RLS 때문에 본문은 빈 배열 `[]` 입니다 — 정상)
- `406` (본문에 `PGRST106`, "The schema must be one of the following: public, graphql_public") → 노출 설정이 아직 반영되지 않았습니다

`Accept-Profile: bci` 헤더가 핵심입니다. 앱 코드에서는 `bci-config.js` 의 `BCI_DB_SCHEMA` 가 `db: { schema: "bci" }` 로 전달되어 이 헤더를 자동으로 붙입니다.

설정은 맞는데 계속 406 이면 스키마 캐시를 강제로 다시 읽히세요.

```sql
notify pgrst, 'reload schema';
```

---

## 3. 스토리지 버킷 2개 만들기

DB 는 스키마로 나눴지만 스토리지에는 스키마 개념이 없어 **버킷**으로 나눕니다. 소아 자문단도 같은 구조(private 첨부 + public 본문 이미지)입니다.

**Storage → Buckets → New bucket** 에서 두 개를 만듭니다.

| 용도 | 이름(예시) | Public | 환경변수 |
| --- | --- | --- | --- |
| 자료실 PDF · 행사 첨부 | `bci-advisory` | **OFF** | `NEXT_PUBLIC_BCI_SUPABASE_STORAGE_BUCKET` |
| 자료실 본문 CKEditor 이미지 | `bci-advisory-editor` | **ON** | `NEXT_PUBLIC_BCI_SUPABASE_EDITOR_BUCKET` |

왜 둘로 나누는지:

- **첨부는 private 이어야 합니다.** 자료실 PDF 는 포털에서 다운로드가 막혀 있고 보안 뷰어로만 열람합니다. 서버가 그때그때 signed URL 을 만들어 내려줍니다. 버킷이 public 이면 URL 만 알면 누구나 받을 수 있어 그 전제가 깨집니다.
- **본문 이미지는 public 이어야 합니다.** CKEditor 는 이미지를 올린 직후 `getPublicUrl` 결과를 본문 HTML 의 `<img src>` 에 그대로 박아서 저장합니다. 그 URL 은 만료가 없으므로, private 버킷에 올리면 포털에서 본문 이미지가 전부 깨집니다.

**이름이 기존 버킷(`angel_robotics_home` 등)과 겹치면 안 됩니다.** 같은 프로젝트라 이름이 같으면 파일이 기존 자료와 그대로 섞입니다. 코드에 폴백을 두지 않았으니, 환경변수가 비어 있으면 섞이는 대신 화면에 오류가 납니다.

### 정책(Policies)

기존 버킷 정책을 그대로 복제하지 마세요. 필요한 건 **정책 하나뿐**입니다.

| 동작 | 어떤 키로 | 필요한 정책 |
| --- | --- | --- |
| 자료실 PDF 업로드 | 서버가 service_role 로 signed upload URL 발급 → 브라우저가 그 **토큰**으로 업로드 | 없음 (토큰 자체가 인증) |
| 행사 첨부 업로드·삭제, 열람 URL 발급, 자료실 다운로드 | 전부 서버 service_role | 없음 (RLS 우회) |
| 본문 이미지 업로드 | 브라우저가 **anon** 키로 직접 업로드 | 에디터 버킷에 **insert** ← 유일하게 필요 |
| 본문 이미지 조회 | 공개 URL | 없음 (public 버킷) |
| 업로드 실패 시 정리 | 브라우저가 **anon** 키로 remove | **두지 않습니다** (아래 참고) |

에디터 버킷 insert 정책. 버킷 이름을 다르게 지었다면 `bucket_id` 를 바꾸세요.

```sql
create policy "bci editor image upload"
on storage.objects for insert to anon, authenticated
with check (
  bucket_id = 'bci-advisory-editor'
  and name like 'advisory_resources/editor/%'
);
```

경로까지 묶는 이유는, 버킷 전체에 insert 를 열면 공개 키를 가진 누구나 아무 경로에나 파일을 올릴 수 있기 때문입니다. CKEditor 가 쓰는 경로는 `advisory_resources/editor/` 하나뿐입니다.

**첨부 버킷에는 anon delete 정책을 두지 않습니다.** 다중 첨부 업로드가 중간에 실패하면 브라우저가 이미 올라간 파일을 지우려 시도하는데, 이걸 허용하려면 공개 키로 삭제가 가능해져 버립니다. 정책이 없으면 그 삭제만 조용히 무시되고(코드가 결과를 확인하지 않습니다) 고아 파일이 남을 뿐, 업로드·열람 기능은 정상입니다. 드물게 생기는 고아 파일 몇 개보다 공개 삭제 권한이 없는 쪽이 낫습니다.

**확인** — 버킷 생성 직후

```sql
select id, public from storage.buckets where id like 'bci%';
```

첨부 버킷은 `public = false`, 에디터 버킷은 `public = true` 여야 합니다.

---

## 4. 가입 알림메일 수신자 추가

메일 설정(`settings_smtp`·`settings_alim_mail_recipients`)은 회사 공용이라 `public` 스키마에 그대로 둡니다. 수신자 행 하나만 추가합니다.

1. SQL Editor → [`sql/bci_signup_alim_mail.sql`](../sql/bci_signup_alim_mail.sql) 실행
2. **실행 전에 수신 이메일을 담당자로 바꾸세요.** 지금은 소아 자문단과 같은 주소로 들어 있습니다

`table_id` 는 `bci_members` 입니다. 포털 코드(`bci-auth/signup-notify.js`)의 `BCI_SIGNUP_ALIM_TABLE_ID` 와 같아야 하고, 소아 자문단 행(`advisory_members`)과 겹치면 안 됩니다.

**확인**

```sql
select table_id, table_title, email from public.settings_alim_mail_recipients
where table_id in ('advisory_members', 'bci_members');
```

두 행이 각각 보여야 합니다.

---

## 5. Vercel 에 넣을 값 모으기

**Project Settings → API** 에서:

| 값 | 환경변수 |
| --- | --- |
| Project URL | `BCI_SUPABASE_URL`, `NEXT_PUBLIC_BCI_SUPABASE_URL` |
| anon public key | `BCI_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_BCI_SUPABASE_ANON_KEY` |
| service_role key | `BCI_SUPABASE_SERVICE_ROLE_KEY` |

지금은 기존 프로젝트와 **같은 값**입니다. 그래도 전용 변수로 두는 이유는 나중에 별도 프로젝트로 떼어낼 때 값만 갈아끼우면 코드를 건드릴 필요가 없어서입니다.

추가로 직접 만들 값:

```bash
openssl rand -base64 48
```

→ `BCI_SESSION_SECRET`. **소아 자문단 키와 반드시 달라야 합니다.** 같은 키로 서명하면 쿠키 이름만 다르고 서명이 같아져서, 한쪽 세션 토큰이 다른 쪽에서도 검증을 통과합니다.

**Vercel 에 넣는 것은 비밀값뿐입니다.**

| 변수 | 관리자 | 포털 | 비고 |
| --- | :---: | :---: | --- |
| `BCI_SUPABASE_SERVICE_ROLE_KEY` | ○ | ○ | RLS 를 우회하는 전권 키 |
| `BCI_SESSION_SECRET` | | ○ | 포털 세션 쿠키 서명. 소아 자문단 키와 반드시 다르게 |

Type 은 **Secret**, Environments 는 Production 과 Preview 둘 다 지정하세요.

나머지(`BCI_SUPABASE_URL`, `NEXT_PUBLIC_BCI_SUPABASE_URL`, `NEXT_PUBLIC_BCI_SUPABASE_ANON_KEY`, 버킷 이름 2개)는 **두 레포의 `.env` 에 커밋돼 있어 Vercel 에 넣지 않습니다.** URL 과 anon 키는 어차피 브라우저 번들로 나가는 공개값이고, Vercel 은 환경마다 변수를 따로 저장해서 같은 값을 반복 입력해야 하는 데다 한쪽을 빠뜨리면 그 환경만 조용히 깨지기 때문입니다. `.env` 에 두면 Production·Preview·로컬이 한 번에 맞습니다.

> **변수를 추가·수정해도 이미 만들어진 배포에는 반영되지 않습니다.** Vercel 은 빌드 시점의 환경변수를 그 배포에 묶습니다. **Promote 는 재빌드가 아니라서** 기존 빌드를 승격해도 옛 환경변수가 그대로 따라옵니다. 변수를 바꾼 뒤에는 반드시 **새 빌드**를 만드세요 (커밋 푸시 또는 Redeploy, 이때 Build Cache 재사용은 해제).

---

## 체크리스트

- [ ] `sql/bci_schema.sql` 실행 → `bci` 스키마에 테이블 7개
- [ ] `public.advisory_*` 건수 변화 없음
- [ ] Exposed schemas 에 `bci` 추가 → curl 이 `200`
- [ ] 첨부 버킷 생성 (Public OFF)
- [ ] 에디터 버킷 생성 (Public ON)
- [ ] 에디터 버킷 insert 정책 / 첨부 버킷 delete 정책
- [ ] `sql/bci_signup_alim_mail.sql` 실행 (수신 이메일 확인 후)
- [ ] URL · 키 2종 · 버킷명 2개 확보, `BCI_SESSION_SECRET` 새로 생성
- [ ] 두 레포 Vercel 환경변수 등록

---

## 막히면

| 증상 | 원인 |
| --- | --- |
| 모든 BCI 쿼리가 `PGRST106` (HTTP 406) | Exposed schemas 에 `bci` 미등록, 또는 스키마 캐시 미반영 (`notify pgrst, 'reload schema'`) |
| `BCI_SUPABASE_URL 환경변수가 없습니다` | Vercel 환경변수 미등록. 폴백을 제거했으므로 기존 DB 로 넘어가지 않고 에러가 납니다 (의도된 동작) |
| `스토리지 버킷 설정(...)이 없습니다` | 버킷 환경변수 미등록 |
| 자료실 본문 이미지가 깨짐 | 에디터 버킷이 private, 또는 `NEXT_PUBLIC_BCI_SUPABASE_EDITOR_BUCKET` 미등록 |
| 본문 이미지 업로드가 실패 | 에디터 버킷에 anon insert 정책 없음 |
| 자료실 PDF 열람이 404 | 첨부 버킷 이름 불일치(관리자/포털 값이 다름), 또는 파일이 다른 버킷에 올라감 |
| 소아 포털 로그인이 BCI 포털에도 통함 | `BCI_SESSION_SECRET` 이 소아 쪽 키와 같음 |
| BCI 화면에 소아 자문단 데이터가 보임 | `db: { schema: "bci" }` 가 빠진 클라이언트를 쓰고 있음 — `bci-server.js` / `bci-client.js` 경유인지 확인 |
