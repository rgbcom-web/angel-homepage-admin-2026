import { z } from 'zod';

const DEFAULT_VALUES = {
  question: '',
  answer: '',
  category_1: 1,
  category_2: null,
};

const SCHEMA_OBJECT = {
  question: z.string().min(1, { message: '질문을 입력해주세요.' }).trim(),
  answer: z.string().min(1, { message: '답변을 입력해주세요.' }).trim(),
  category_1: z.number().min(1, { message: '카테고리를 선택해주세요.' }),
  category_2: z.preprocess((val) => (val === '' ? null : val), z.number().nullable()),
};

export const writeSchema = z.object(SCHEMA_OBJECT);

export const getDefaultValues = () => DEFAULT_VALUES;
