import { z } from 'zod';
import { fileDataSchema, filesFieldSchema } from '@/shared/schema/schema';

const DEFAULT_VALUES = {
  disabled: false,
  title: '',
  thumbnail: null,
  attachment: null,
  files: {
    thumbnail: null,
    attachment: null,
  },
};

const SCHEMA_OBJECT = {
  disabled: z.boolean().default(false),
  category_id: z.number().min(1, { message: '카테고리를 선택해주세요.' }),
  title: z.string().min(1, { message: '제목을 입력해주세요.' }).trim(),
  thumbnail: fileDataSchema({ isArray: false }),
  attachment: fileDataSchema({ isArray: false }),
  files: filesFieldSchema({
    thumbnail: {
      isArray: false,
      size: 1,
      extentions: {
        value: ['jpg', 'png', 'gif'],
        message: '첨부파일은 이미지 파일만 가능합니다.',
      },
    },
    attachment: {
      isArray: false,
      size: 30,
      extentions: {
        value: ['pdf'],
        message: '첨부파일은 PDF 파일만 가능합니다.',
      },
    },
  }),
};

export const writeSchema = z.object(SCHEMA_OBJECT);

export const getDefaultValues = () => DEFAULT_VALUES;
