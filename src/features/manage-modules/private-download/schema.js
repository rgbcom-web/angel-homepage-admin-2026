import { z } from 'zod';
import { fileDataSchema, filesFieldSchema } from '@/shared/schema/schema';

const DEFAULT_VALUES = {
  disabled: false,
  title: '',
  thumbnail: null,
  files: {
    thumbnail: null,
  },
};

const SCHEMA_OBJECT = {
  disabled: z.boolean().default(false),
  title: z.string().min(1, { message: '제목을 입력해주세요.' }).trim(),
  thumbnail: fileDataSchema({ isArray: false }),
  files: filesFieldSchema({
    thumbnail: {
      isArray: false,
      size: 1,
      extentions: {
        value: ['jpg', 'png', 'gif'],
        message: '첨부파일은 이미지 파일만 가능합니다.',
      },
    },
  }),
};

export const writeSchema = z.object(SCHEMA_OBJECT);

export const getDefaultValues = () => DEFAULT_VALUES;
