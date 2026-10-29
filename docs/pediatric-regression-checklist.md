# 머지 전 소아 자문단 회귀 검증 체크리스트

BCI 자문단 브랜치 2개를 머지하기 전에, **운영 중인 소아 보행 재활 로봇 개발 자문단**이 그대로 동작하는지 확인한다.

| 레포 | 브랜치 |
| --- | --- |
| `angel-robotics-admin-2025` | `feature/bci-advisory-admin` |
| `angel-robotics-home-2025` | `feature/bci-advisory-portal` |

---

## 왜 확인이 필요한가

`pediatric` 폴더는 `main` 과 바이트 단위로 동일하다. 그런데 **공용 파일 3종**을 고쳤고, 이건 머지되면 소아 쪽에도 적용된다.

| 파일 | 레포 | 소아에 미치는 영향 |
| --- | --- | --- |
| `src/middleware.js` | 포털 | **소아 포털 전체의 접근 제어.** 블록 복사 대신 헬퍼 하나를 공유하도록 리팩터링했다 |
| `src/shared/editor/CKEditor5/` 3개 | 관리자 | 소아 자료실 + 기존 6개 모듈의 본문 에디터. 업로드 대상을 옵션 prop 으로 받게 확장했다 |
| `next.config.mjs` | 포털 | `/adult_bci` 리다이렉트 추가 (소아 경로와 겹치지 않음) |

로직상 동작은 같다는 것까지 diff 로 확인했지만 **실행해보지 않았다.** 아래는 그걸 실제로 돌려보는 절차다.

> 검증은 **Preview 배포에서** 한다. 운영(`main`)에서 돌리면 지금 코드를 확인하는 것이라 의미가 없다.
> 다만 1회차는 운영에서 먼저 돌려 **기준(baseline)** 을 잡아 두면 비교가 쉽다.

---

## A. 빌드 — 가장 먼저

두 레포 모두 **한 번도 빌드해보지 않았다.** JSX 파일은 구문 검사에서도 빠져 있었다.

- [ ] 관리자 `yarn install && yarn build` 성공
- [ ] 포털 `yarn install && yarn build` 성공
- [ ] 관리자 `yarn lint` 통과 (커밋 `8b945eb` 가 lint 를 돌아가게 만들었다고 함)

여기서 깨지면 아래는 볼 필요가 없다.

---

## B. 포털 middleware — 위험도 1순위

소아 포털의 로그인 가드다. `guardAdvisoryPortal` 헬퍼로 합쳤으므로 경로별로 확인한다.

### 로그아웃 상태

| 접속 URL | 기대 동작 |
| --- | --- |
| `/pediatric` | `/pediatric/login?next=/pediatric` 로 리다이렉트 |
| `/pediatric/resources` | `/pediatric/login?next=/pediatric/resources` 로 리다이렉트 |
| `/pediatric/events/<id>` | 로그인으로 리다이렉트, `next` 에 원래 경로 |
| `/pediatric/login` | 200, 로그인 폼 표시 |
| `/pediatric/signup` | 200 |
| `/pediatric/forgot-password` | 200 |
| `/pediatric/reset-password` | 200 |
| `/pediatric/session/clear` | `/pediatric/login` 으로 리다이렉트 + 쿠키 삭제 |
| `/` | `/ko` 로 리다이렉트 |
| `/ko/company/newsroom` | 200 (자문단과 무관한 경로가 영향받지 않는지) |

- [ ] 위 10개 전부 기대대로

### 로그인 상태

- [ ] 로그인 성공 → 포털 홈 진입
- [ ] `/pediatric/login` 재접속 시 `/pediatric` 으로 리다이렉트
- [ ] `/pediatric/signup` 재접속 시 `/pediatric` 으로 리다이렉트
- [ ] 자료실 · 행사 · 설문 · 알림 · 내 정보 각 페이지 정상 진입
- [ ] 로그인 직후 이동하는 위치가 **머지 전과 같은지** (`next` 파라미터를 로그인 폼이 쓰지 않으므로 동작이 바뀌지 않았는지만 확인)
- [ ] 로그아웃 후 보호 경로 재접속 → 다시 로그인으로

### 두 포털 동시 사용

- [ ] 소아 로그인 상태에서 `/Adult_BCI` 접속 → BCI 로그인으로 리다이렉트 (소아 세션이 통하지 않을 것)
- [ ] 그 상태에서 `/pediatric` 는 여전히 로그인 유지

---

## C. 관리자 CKEditor — 위험도 2순위

`customUploadAdapter` 의 인자 순서가 바뀌었고(`maxSize` 가 3번째 → 4번째), `uploadImage` 가 2번째 인자를 받게 됐다. 기존 호출부는 `uploadTarget` 을 넘기지 않으므로 기본값으로 떨어져야 한다.

### 소아 자료실

- [ ] `/pediatric/boards/resources` → **자료 등록** 열기
- [ ] 본문 툴바의 이미지 버튼으로 **이미지 삽입 → 업로드 성공**
- [ ] 에디터 안에 이미지가 바로 보임
- [ ] 저장 후 목록·상세에서 본문 이미지가 깨지지 않음
- [ ] **업로드된 파일이 `angel_robotics_home` 버킷에 들어갔는지** (BCI 버킷이 아니어야 한다)
  ```sql
  select name, created_at from storage.objects
  where bucket_id = 'angel_robotics_home'
  order by created_at desc limit 5;
  ```
- [ ] 2MB 초과 이미지 → "2MB 이하의 이미지를 업로드 해주세요" 안내가 그대로 뜸 (`maxSize` 기본값 확인)
- [ ] PDF 첨부 등록 → 포털에서 보안 뷰어로 열람, 다운로드 불가

### 나머지 에디터 사용 모듈 — 최소 2개

전부 같은 컴포넌트를 쓰므로 하나만 확인해도 대부분 커버되지만, 안전하게 2개를 본다.

- [ ] `/popup/ko` — 본문 이미지 업로드
- [ ] `/ir/notice/ko` — 본문 이미지 업로드

(나머지: `/support/faq/ko`, `/recruit/faq/ko`, `/recruit/recruit-notice/ko`, `/recruit/angel-story/ko`)

### 사이드바

- [ ] 최고관리자 계정에서 **소아 자문단 섹션이 그대로** 보이고 하위 5개 메뉴 진입 정상
- [ ] 일반 관리자 계정에서 소아·BCI 섹션이 **둘 다 안 보임** (`super_admin` 조건)

---

## D. 데이터 격리

소아 데이터가 BCI 쪽으로 새거나, BCI 데이터가 소아에 보이지 않아야 한다.

- [ ] BCI 관리자에서 회원·게시글을 하나씩 만든 뒤, 소아 관리자 목록과 소아 포털에 **보이지 않음**
- [ ] 반대로 소아 데이터가 BCI 쪽에 보이지 않음
- [ ] 행이 들어간 위치 확인
  ```sql
  select 'public' as 스키마, count(*) from public.advisory_resources
  union all
  select 'bci', count(*) from bci.advisory_resources;
  ```
- [ ] 파일이 올라간 버킷 확인
  ```sql
  select bucket_id, count(*) from storage.objects group by bucket_id order by bucket_id;
  ```

---

## E. 머지 후 운영 스모크

- [ ] `https://www.angel-robotics.com/pediatric/login` 200, 로그인 폼
- [ ] 실제 계정으로 로그인 → 자료실 열람
- [ ] `https://www.angel-robotics.com/ko` 및 뉴스룸·다운로드 200
- [ ] 관리자 로그인 → 소아 대시보드 수치가 머지 전과 동일
- [ ] 문의·채용 등 메일 발송 경로 1건 확인 (공용 `mailer.js` 를 BCI 와 같이 쓴다)

---

## 이번 변경과 무관한 기존 문제

검증 중에 마주칠 수 있어 적어 둔다. **머지 때문에 생긴 게 아니다.**

- `angel_robotics_pediatric` 버킷의 허용 MIME 이 `image/jpeg, image/png, application/pdf` 세 개뿐인데, 자료 등록 화면은 "PDF 또는 이미지(png/jpg/gif/webp)" 를 안내하고 코드도 gif·webp 를 통과시킨다. → **소아 자료실에 gif/webp 첨부를 올리면 스토리지에서 거부된다.** 지금도 그렇다.
  고치려면 버킷 설정에 `image/gif, image/webp` 를 추가하면 된다. 이번 작업 범위 밖이라 건드리지 않았다.

---

## 통과 기준

A 와 B 는 **전부** 통과해야 머지한다. C 에서 소아 자료실 이미지 업로드가 실패하면 CKEditor 변경을 되돌리고(기존 모듈은 `uploadTarget` 을 안 쓰므로 원복해도 BCI 쪽만 영향) 다시 본다.
