'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@/shared/lib/utils';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Logo } from '@/shared/SVG';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/shared/shadcn/components/ui/card';
import {
  Form,
  FormItem,
  FormControl,
  FormMessage,
  FormField,
  FormLabel,
  FormSubmit,
} from '@/shared/shadcn/components/ui/form';
import { Input } from '@/shared/shadcn/components/ui/input';

const formSchema = z.object({
  id: z.string().min(1, {
    message: '아이디를 입력해주세요.',
  }),
  password: z.string().min(1, {
    message: '비밀번호를 입력해주세요.',
  }),
});

export default function LogInForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const result = await signIn('credentials', {
        id: data.id,
        password: data.password,
        redirect: false,
      });

      if (result.status !== 200) {
        setError(result.error);
      } else {
        router.push('/'); // 로그인 후 리다이렉트할 페이지
        router.refresh();
      }
    } catch (error) {
      setError('로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className={cn('relative w-[350px] max-w-full border-none')}>
          <CardHeader className="text-center">
            <div
              className={cn(
                'flex aspect-square size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground',
                'mx-auto mb-2',
              )}
            >
              <Logo className={cn('size-6')} />
            </div>
            <CardTitle className="text-xl">Welcome back!</CardTitle>
            <CardDescription>아이디와 비밀번호로 로그인하세요.</CardDescription>
          </CardHeader>
          <CardContent className={cn('space-y-3')}>
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem className={cn('space-y-1')}>
                  <FormLabel>아이디</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="" autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className={cn('space-y-1')}>
                  <FormLabel>비밀번호</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          {error && <div className="mb-4 text-center text-sm text-red-500">{error}</div>}
          <CardFooter>
            <FormSubmit className={cn('w-full')}>로그인</FormSubmit>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
