import { z } from 'zod';

const DEFAULT_VALUES = {
  smtp_host: '',
  smtp_port: null,
  smtp_secure: '',
  smtp_user: '',
  smtp_password: '',
  super_admin_password: '',
};

export const formSchema = z.object({
  smtp_host: z.string().min(1, { message: 'SMTP 호스트를 입력해주세요.' }).trim(),
  smtp_port: z.number().min(1, { message: 'SMTP 포트를 입력해주세요.' }),
  smtp_secure: z.string().min(1, { message: 'SMTP 보안을 입력해주세요.' }).trim(),
  smtp_user: z.string().min(1, { message: 'SMTP 아이디를 입력해주세요.' }).trim(),
  smtp_password: z.string().min(1, { message: 'SMTP 비밀번호를 입력해주세요.' }).trim(),
  super_admin_password: z.string().min(1, { message: '최고관리자 계정 비밀번호를 입력해주세요.' }),
});

export const getDefaultValues = () => DEFAULT_VALUES;
