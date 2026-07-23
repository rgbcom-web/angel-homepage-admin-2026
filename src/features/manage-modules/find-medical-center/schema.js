import { z } from 'zod';

const DEFAULT_VALUES = {
  products: [],
  name: '',
  address: '',
  detail_address: '',
  sido: '',
  sigungu: '',
  tel: '',
};

const SCHEMA_OBJECT = {
  products: z.array(z.string()).min(1, { message: '도입제품을 선택해주세요.' }),
  name: z.string().min(1, { message: '병원명을 입력해주세요.' }).trim(),
  address: z.string().min(1, { message: '주소를 입력해주세요.' }).trim(),
  detail_address: z.union([z.string().trim(), z.null()]).optional(),
  sido: z.union([z.string().trim(), z.null()]).optional(),
  sigungu: z.union([z.string().trim(), z.null()]).optional(),
  tel: z.string().min(1, { message: '전화번호를 입력해주세요.' }).trim(),
};

export const writeSchema = z.object(SCHEMA_OBJECT);

export const getDefaultValues = () => DEFAULT_VALUES;
