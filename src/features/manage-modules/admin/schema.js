import { z } from 'zod';

const DEFAULT_VALUES = {
  id: '',
  name: '',
  password: '',
};

const DEFAULT_OBJECT = {
  id: z.string().min(5, { message: '아이디는 최소 5자 이상이어야 합니다.' }).trim(),
  name: z.string().min(3, { message: '이름은 최소 3자 이상이어야 합니다.' }).trim(),
  password: z
    .string()
    .trim()
    .min(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
    .regex(/[a-zA-Z]/, { message: '비밀번호에는 영문자가 포함되어야 합니다.' })
    .regex(/[0-9]/, { message: '비밀번호에는 숫자가 포함되어야 합니다.' })
    .refine((value) => !/[?({}):"|\₩/><.,;'\[\]]/.test(value), {
      message: '비밀번호에 일부 특수문자는 사용할 수 없습니다.',
    }),
};

const UPDATE_OBJECT = {
  id: z.string().min(5, { message: '아이디는 최소 5자 이상이어야 합니다.' }).trim(),
  name: z.string().min(3, { message: '이름은 최소 3자 이상이어야 합니다.' }).trim(),
  password: z
    .union([
      z
        .string()
        .trim()
        .min(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
        .regex(/[a-zA-Z]/, { message: '비밀번호에는 영문자가 포함되어야 합니다.' })
        .regex(/[0-9]/, { message: '비밀번호에는 숫자가 포함되어야 합니다.' })
        .refine((value) => !/[?({}):"|\₩/><.,;'\[\]]/.test(value), {
          message: '비밀번호에 일부 특수문자는 사용할 수 없습니다.',
        }),
      z.string().trim().length(0), // 빈 문자열 허용
    ])
    .optional(), // 필드 자체가 없어도 됨
};

export const createSchema = z.object(DEFAULT_OBJECT);
export const updateSchema = z.object(UPDATE_OBJECT);

export const getDefaultValues = () => DEFAULT_VALUES;
