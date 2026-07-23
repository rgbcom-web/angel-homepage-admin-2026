import { z } from 'zod';
import moment from 'moment';

const DEFAULT_VALUES = {
  disabled: false,
  start_date: '',
  end_date: '',
  department: 'test',
  business_place: 'test',
  title: 'test',
  until_filled: false,
  content: 'test',
};

const SCHEMA_OBJECT = {
  disabled: z.boolean().optional(),
  start_date: z
    .union([z.string(), z.date().transform((date) => moment(date).format('YYYY-MM-DD')), z.null()])
    .optional(),
  end_date: z
    .union([z.string(), z.date().transform((date) => moment(date).format('YYYY-MM-DD')), z.null()])
    .optional(),
  until_filled: z.boolean().optional(),
  department: z.string().min(1, { message: '부서를 입력해주세요.' }).trim(),
  business_place: z.string().min(1, { message: '사업장을 입력해주세요.' }).trim(),
  title: z.string().min(1, { message: '제목을 입력해주세요.' }).trim(),
  content: z.string().min(1, { message: '내용을 입력해주세요.' }).trim(),
};

export const writeSchema = z.object(SCHEMA_OBJECT);

export const getDefaultValues = () => DEFAULT_VALUES;
