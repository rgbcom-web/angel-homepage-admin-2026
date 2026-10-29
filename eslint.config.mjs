import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/**
 * eslint-config-next 15.1.2 의 파서 래퍼(eslint-config-next/parser.js)는
 * `{ parse, parseForESLint }` 만 내보내고 `meta.name` 이 없습니다.
 * ESLint 9 는 flat config 를 직렬화할 때 이름 없는 객체를 펼쳐 보려 하다가
 * 함수를 만나 `Cannot serialize key "parse" in parser` 로 중단됩니다.
 *
 * 이름이 있으면 참조로 직렬화하므로(eslint/lib/config/config.js 의 getObjectId),
 * 이름 없는 파서에만 meta.name 을 채워 줍니다.
 * 상위 패키지가 flat config 를 정식 지원하면 이 보정은 지워도 됩니다.
 */
function withParserName(config) {
  const parser = config.languageOptions?.parser;
  if (!parser || parser.name || parser.meta?.name) return config;

  return {
    ...config,
    languageOptions: {
      ...config.languageOptions,
      parser: { ...parser, meta: { ...parser.meta, name: "next/babel-eslint-parser" } },
    },
  };
}

const eslintConfig = compat.extends("next/core-web-vitals").map(withParserName);

export default eslintConfig;
