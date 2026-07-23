import { z } from 'zod';
import moment from 'moment';
import { dateSchema, linkSchema, fileDataSchema, filesFieldSchema } from '@/shared/schema/schema';
import { NEWSROOM_CATEGORY_LIST } from '@/app/app-constants';

const DEFAULT_VALUES = {
  published_at: moment().toDate(),
  title: '',
  attachments: null,
  files: {
    attachments: null,
  },
};

const SCHEMA_OBJECT = {
  published_at: dateSchema(),
  title: z.string().min(1, { message: '제목을 입력해주세요.' }).trim(),
  attachments: fileDataSchema({ isArray: true }),
  files: filesFieldSchema({
    attachments: {
      isArray: true,
      size: 20,
      extentions: {
        value: ['jpg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
        message: '첨부파일은 이미지, PDF, 문서, 엑셀, PPT 파일만 가능합니다.',
      },
    },
  }),
};

export const writeSchema = z.object(SCHEMA_OBJECT);

export const getDefaultValues = () => DEFAULT_VALUES;
