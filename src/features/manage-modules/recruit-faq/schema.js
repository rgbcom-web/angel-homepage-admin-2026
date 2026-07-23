import { z } from 'zod';

const DEFAULT_VALUES = {
  question: '',
  answer: '',
};

const SCHEMA_OBJECT = {
  question: z.string().min(1, { message: '질문을 입력해주세요.' }).trim(),
  answer: z.string().min(1, { message: '답변을 입력해주세요.' }).trim(),
};

export const writeSchema = z.object(SCHEMA_OBJECT);

export const getDefaultValues = () => DEFAULT_VALUES;
