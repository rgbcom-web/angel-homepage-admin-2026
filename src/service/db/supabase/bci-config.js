/**
 * 뇌-AI-로봇 연동시스템 개발 자문단 전용 Supabase 설정
 *
 * 소아 자문단·홈페이지와 **같은 Supabase 프로젝트의 다른 스키마**(`bci`)를 가리킵니다.
 * 무료 플랜은 조직당 활성 프로젝트가 2개로 제한돼 세 번째 프로젝트를 만들 수 없으므로,
 * DB 는 스키마로, 스토리지는 전용 버킷으로 분리합니다. (스토리지에는 스키마 개념이 없습니다)
 *
 * 기존 server.js / client.js 는 홈페이지 전체가 쓰는 공용 경로이므로 건드리지 않고 여기에 따로 둡니다.
 * URL·키가 지금은 기존 프로젝트와 같은 값이어도 반드시 BCI 전용 환경변수로 읽습니다.
 * 나중에 별도 프로젝트로 떼어낼 때 환경변수 값과 BCI_DB_SCHEMA 만 바꾸면 되기 때문입니다.
 *
 * 폴백을 두지 않습니다. 환경변수가 비었을 때 기존 DB·버킷으로 조용히 섞이는 대신 즉시 실패해야 합니다.
 *
 * ※ process.env 는 반드시 리터럴로 읽습니다. NEXT_PUBLIC_* 는 빌드 시 치환되므로
 *   process.env[name] 처럼 동적으로 접근하면 클라이언트 번들에서 값이 사라집니다.
 */

/**
 * BCI 테이블이 사는 스키마.
 *
 * 클라이언트 생성 시 db.schema 로 넘기므로 쿼리 코드는 스키마를 쓰지 않습니다.
 * (`.from('advisory_members')` 그대로 → bci.advisory_members)
 *
 * 테이블명이 소아 자문단과 동일하기 때문에 이 값이 유일한 분리 경계입니다.
 * 환경변수로 빼지 않습니다 — 비거나 오타가 나면 public 스키마의 소아 데이터가 열립니다.
 *
 * Supabase 대시보드에서 Project Settings → Data API → Exposed schemas 에
 * 이 스키마를 등록해야 PostgREST 가 접근할 수 있습니다. (미등록 시 전부 404)
 */
export const BCI_DB_SCHEMA = 'bci';

export function requireBciEnv(name, value) {
  if (!value) {
    throw new Error(
      `${name} 환경변수가 없습니다. 뇌-AI-로봇 연동시스템 개발 자문단은 별도 Supabase 스키마(${BCI_DB_SCHEMA})를 사용합니다.`,
    );
  }
  return value;
}

/**
 * 버킷을 둘로 나눕니다. 소아 자문단도 같은 구조였습니다 (private 첨부 + public 에디터 이미지).
 *
 *  1) 첨부 버킷 (private) — 자료실 PDF·행사 첨부.
 *     포털은 다운로드 없이 보안 뷰어로만 열람해야 하므로 서버가 signed URL 로만 내려줍니다.
 *
 *  2) 에디터 버킷 (public) — 자료실 본문(CKEditor)에 삽입되는 이미지.
 *     CKEditor 는 업로드 직후 getPublicUrl 결과를 본문 HTML 의 <img src> 에 박아서 저장합니다.
 *     그 URL 은 만료 없이 그대로 남으므로 버킷이 private 이면 포털에서 이미지가 깨집니다.
 *     그래서 본문 이미지만 public 버킷에 둡니다. (본문 이미지는 비공개 자료가 아닙니다)
 *
 * 둘 다 관리자 브라우저가 직접 업로드하므로 서버·클라이언트가 같은 값을 봐야 해서 공개 변수로 둡니다.
 * 기존 프로젝트를 공유하므로 두 이름 모두 기존 버킷과 **겹치면 안 됩니다.**
 *
 * 값이 비어 있을 수 있습니다. 모듈을 읽는 시점에 던지면 화면 전체가 뜨지 않으므로,
 * 최상위에서 읽는 쪽(게시판 서버액션·에디터 업로드 대상)은 비었을 때를 각자 처리합니다.
 */
export const BCI_STORAGE_BUCKET_ENV_NAME = 'NEXT_PUBLIC_BCI_SUPABASE_STORAGE_BUCKET';

export const BCI_STORAGE_BUCKET = process.env.NEXT_PUBLIC_BCI_SUPABASE_STORAGE_BUCKET;

export const BCI_EDITOR_BUCKET_ENV_NAME = 'NEXT_PUBLIC_BCI_SUPABASE_EDITOR_BUCKET';

export const BCI_EDITOR_BUCKET = process.env.NEXT_PUBLIC_BCI_SUPABASE_EDITOR_BUCKET;

/** 반드시 설정돼 있어야 하는 지점에서 사용 (없으면 throw) */
export function getBciStorageBucket() {
  return requireBciEnv(BCI_STORAGE_BUCKET_ENV_NAME, BCI_STORAGE_BUCKET);
}
