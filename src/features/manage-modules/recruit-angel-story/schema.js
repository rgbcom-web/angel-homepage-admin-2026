import { z } from 'zod';
import moment from 'moment';
import { dateSchema, fileDataSchema, filesFieldSchema } from '@/shared/schema/schema';
import { ANGEL_STORY_COLOR_LIST, ANGEL_STORY_CATEGORY_LIST } from '@/app/app-constants';

const DEFAULT_VALUES = {
  fixed: false,
  published_at: moment().toDate(),
  category: { ...ANGEL_STORY_CATEGORY_LIST[0], isCustom: false },
  tag: '',
  title: '',
  content: '',
  thumbnail: null,
  attachments: null,
  files: {
    thumbnail: null,
    attachments: null,
  },
};

const SCHEMA_OBJECT = {
  fixed: z.boolean().default(false),
  published_at: dateSchema({ nullish: true }),
  category: z
    .object({
      name: z.string().trim(),
      color: z.enum(ANGEL_STORY_COLOR_LIST),
      isCustom: z.boolean().default(false),
    })
    .refine((data) => data.name.length > 0, {
      message: '카테고리를 선택해주세요.',
    }),
  tag: z.string().trim(),
  title: z.string().min(1, { message: '제목을 입력해주세요.' }).trim(),
  content: z.string().min(1, { message: '내용을 입력해주세요.' }).trim(),
  thumbnail: fileDataSchema(),
  attachments: fileDataSchema({ isArray: true }),
  files: filesFieldSchema({
    thumbnail: { isArray: false, size: 1, extentions: ['jpg', 'png', 'gif'] },
    attachments: {
      isArray: true,
      size: 10,
      extentions: {
        value: ['jpg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
        message: '첨부파일은 이미지, PDF, 문서, 엑셀, PPT 파일만 가능합니다.',
      },
    },
  }),
};

export const writeSchema = z.object(SCHEMA_OBJECT);

export const getDefaultValues = () => DEFAULT_VALUES;
