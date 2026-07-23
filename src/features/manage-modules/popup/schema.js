import { z } from 'zod';
import moment from 'moment';

const DEFAULT_VALUES = {
  title: '',
  content: '',
  disabled: false,
  always_display: false,
  start_date: moment().format('YYYY-MM-DD'),
  end_date: moment().add(7, 'days').format('YYYY-MM-DD'),
  width: 500,
  left: 150,
  top: 150,
  z_index: 0,
};

const SCHEMA_OBJECT = {
  title: z.string().min(1, { message: '제목을 입력해주세요.' }).trim(),
  content: z.string().min(1, { message: '내용을 입력해주세요.' }).trim(),
  disabled: z.boolean().optional(),
  always_display: z.boolean().optional(),
  start_date: z
    .union([z.string(), z.date().transform((date) => moment(date).format('YYYY-MM-DD')), z.null()])
    .optional(),
  end_date: z
    .union([z.string(), z.date().transform((date) => moment(date).format('YYYY-MM-DD')), z.null()])
    .optional(),
  width: z.number().min(300, { message: '너비는 300px 이상으로 설정하세요.' }),
  left: z.number().min(0, { message: '왼쪽 위치는 0px 이상으로 설정하세요.' }),
  top: z.number().min(0, { message: '위쪽 위치는 0px 이상으로 설정하세요.' }),
  z_index: z.number().min(0, { message: '순서는 0 이상으로 설정하세요.' }),
};

export const writeSchema = z.object(SCHEMA_OBJECT);

export const getDefaultValues = () => DEFAULT_VALUES;
