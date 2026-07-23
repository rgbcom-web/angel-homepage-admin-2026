import { z } from 'zod';
import moment from 'moment';
import { dateSchema, linkSchema, fileDataSchema, filesFieldSchema } from '@/shared/schema/schema';
import { NEWSROOM_CATEGORY_LIST } from '@/app/app-constants';

const DEFAULT_VALUES = {
  fixed: false,
  category: NEWSROOM_CATEGORY_LIST[0],
  published_at: moment().toDate(),
  tag: '',
  title: '',
  link: '',
  thumbnail: null,
  files: {
    thumbnail: null,
  },
};

const SCHEMA_OBJECT = {
  fixed: z.boolean().default(false),
  category: z.enum(NEWSROOM_CATEGORY_LIST, {
    message: '카테고리를 선택해주세요.',
  }),
  tag: z.string().min(1, { message: '태그를 입력해주세요.' }).trim(),
  title: z.string().min(1, { message: '제목을 입력해주세요.' }).trim(),
  link: linkSchema({ required: true }),
  published_at: dateSchema(),
  thumbnail: fileDataSchema(),
  files: filesFieldSchema({
    thumbnail: { isArray: false, size: 1, extentions: ['jpg', 'png', 'gif'] },
  }),
};

export const writeSchema = z.object(SCHEMA_OBJECT);

export const getDefaultValues = () => DEFAULT_VALUES;
