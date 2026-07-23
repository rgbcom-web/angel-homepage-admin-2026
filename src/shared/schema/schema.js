import { z } from 'zod';
import moment from 'moment';

/**
 * 날짜 데이터를 유닉스 타임스탬프로 변환하는 스키마
 * @returns {z.ZodDate} 유닉스 타임스탬프 형식의 날짜 스키마
 */
export const dateSchema = (options) => {
  const { nullish = false } = options ?? {};

  let stringSchema = z.string().transform((dateString) => moment(dateString).toDate());
  let dateSchema = z.date().transform((date) => moment(date).toDate());

  if (nullish) {
    stringSchema = stringSchema.nullish();
    dateSchema = dateSchema.nullish();
  }

  return z.union([stringSchema, dateSchema]);
};

/**
 * 링크 데이터에 대한 스키마를 생성합니다.
 * @param {Object} option - 옵션 객체
 * @param {boolean} [option.required=true] - 필수 여부
 * @returns {z.ZodString} 링크 데이터 스키마
 */
export const linkSchema = ({ required = false } = {}) => {
  let schema = z.string();

  if (required) {
    schema = schema.min(1, { message: 'URL을 입력해주세요.' });
  }

  schema = schema.url({ message: '프로토콜(http, https)을 포함한 유효한 URL을 입력해주세요.' });
  schema = schema.trim();

  return schema;
};

/**
 * 파일 데이터에 대한 스키마를 생성합니다.
 * (DB에 저장되는 업로드된 파일 데이터 스키마)
 *
 * @param {Object} option - 옵션 객체
 * @param {boolean} [option.isArray=false] - 배열 여부
 * @returns {z.ZodUnion} 파일 데이터 스키마
 */
export function fileDataSchema(option) {
  const { isArray = false } = option || {};

  let schema;

  if (isArray) {
    schema = z.array(
      z.union([
        z.object({
          originalName: z.string(),
          filePath: z.string(),
          deleted: z.boolean().optional(),
        }),
        z.null(),
      ]),
    );
  } else {
    schema = z.union([
      z.object({
        originalName: z.string(),
        filePath: z.string(),
        deleted: z.boolean().optional(),
      }),
      z.null(),
    ]);
  }

  return z.union([schema, z.null()]);
}

/**
 * 파일 필드에 대한 스키마를 생성합니다.
 * (파일 업로드 필드에 대한 스키마)
 *
 * @param {Object} fields - 각 필드에 대한 설정 객체
 * @param {boolean} [fields.isArray] - 필드가 배열인지 여부
 * @param {Object|number} [fields.size] - 파일 크기 제한 설정
 * @param {number} [fields.size.value] - 파일 크기 제한 값 (MB 단위)
 * @param {string} [fields.size.message] - 파일 크기 제한 초과 시 표시할 메시지
 * @param {Array|string} [fields.extentions] - 허용할 파일 확장자 목록
 * @param {Array} [fields.extentions.value] - 허용할 파일 확장자 배열
 * @param {string} [fields.extentions.message] - 잘못된 확장자 업로드 시 표시할 메시지
 * @returns {z.ZodObject} 파일 필드 스키마
 */
export function filesFieldSchema(fields) {
  const schemaObject = {};

  Object.entries(fields).forEach(([key, field]) => {
    const { isArray, size, extentions } = field;

    let fileSchema = z.instanceof(File);

    if (size) {
      const sizeValue = typeof size === 'object' ? size.value : size;
      const sizeMessage =
        typeof size === 'object'
          ? size.message
          : `파일 크기는 ${sizeValue}MB 이하로 업로드해주세요.`;
      const sizeCheck = (file) => file === null || file.size <= sizeValue * 1024 * 1024;
      fileSchema = fileSchema.refine(sizeCheck, { message: sizeMessage });
    }

    if (extentions) {
      const extentionsValue = Array.isArray(extentions) ? extentions : extentions.value;
      const extensionMessage = Array.isArray(extentions)
        ? `${extentionsValue.join(', ')} 확장자만 업로드 할 수 있습니다.`
        : extentions.message;
      const extensionCheck = (file) =>
        file === null || extentionsValue.includes(file.name.split('.').pop().toLowerCase());
      fileSchema = fileSchema.refine(extensionCheck, { message: extensionMessage });
    }

    if (isArray) {
      schemaObject[key] = z.union([
        z.array(z.union([fileSchema, z.null()])),
        z.null(),
        z.undefined(),
      ]);
    } else {
      schemaObject[key] = z.union([fileSchema, z.null(), z.undefined()]);
    }
  });

  return z.object(schemaObject).optional();
}
