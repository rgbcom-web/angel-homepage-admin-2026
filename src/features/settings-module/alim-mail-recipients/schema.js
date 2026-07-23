import { z } from 'zod';

export const formSchema = z.object({
  email: z.array(z.string()).refine(
    (val) => {
      // 배열 요소 중 이메일 형식에 맞지 않는 항목이 있는 경우 오류 메세지 반환
      return val.every((email) => z.string().email().safeParse(email).success);
    },
    {
      message: '이메일 형식이 올바르지 않습니다.',
    },
  ),
});
