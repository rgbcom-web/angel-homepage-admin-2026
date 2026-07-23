'use client';

import { cn } from '@/shared/lib/utils';
import { useForm } from 'react-hook-form';
import { Form, FieldBlock, FormSubmit } from '@/shared/shadcn/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Textarea } from '@/shared/shadcn/components/ui/textarea';
import { ConfirmDialog } from '@/features/components/dialogs/confirm-dialog';
import { useDetail } from './detail.context';
import { setFieldErrors } from '@/shared/lib/validation.utils';
import { sendAndCreateAnswer } from './api/answer';
import { toast } from 'sonner';
import { useParams, usePathname } from 'next/navigation';
import { useManageModuleContext } from '../components/manage-modules.context';
import { TableEmpty } from '@/shared/shadcn/components/ui/table';
import moment from 'moment';
import { Badge } from '@/shared/shadcn/components/ui/badge';

export function DetailAnswer() {
  return (
    <div className={cn('space-y-8')}>
      <AnswerForm />
      <AnswerList />
    </div>
  );
}

function AnswerForm() {
  const { lang } = useParams();
  const pathname = usePathname();
  const { tableName, answerTableName } = useManageModuleContext();
  const { data: contactDetail, fetchData } = useDetail();

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      answer: '',
      userName: contactDetail?.name,
      mailTo: contactDetail?.email,
      contactId: contactDetail?.id,
    },
    resolver: zodResolver(
      z.object({
        answer: z.string().min(1, { message: '답변을 입력해주세요.' }),
        mailTo: z.string().email({ message: '이메일 형식이 올바르지 않습니다.' }),
        userName: z.string().min(1, { message: '이름값이 없습니다.' }),
        contactId: z.number().int().positive({ message: '문의 ID값이 없습니다.' }),
      }),
    ),
  });

  const onSubmit = async (data) => {
    const { success, errors } = await sendAndCreateAnswer(
      data,
      lang,
      tableName,
      answerTableName,
      pathname,
    );

    if (!success) {
      setFieldErrors(form, errors);
      toast.error(errors.message);
      return;
    }

    fetchData();
    toast.success('답변이 발송되었습니다.');
    form.reset();
  };

  return (
    <div>
      <Form {...form}>
        <form action={form.handleSubmit(onSubmit)} className={cn('space-y-4')}>
          <FieldBlock
            control={form.control}
            name="answer"
            render={({ field }) => <Textarea {...field} className={cn('min-h-[300px] bg-white')} />}
          />
          <ConfirmDialog
            button={<FormSubmit className={cn('w-full')}>답변 발송</FormSubmit>}
            title="답변 발송"
            description="답변을 발송하시겠습니까?"
            onActionClick={form.handleSubmit(onSubmit)}
          />
        </form>
      </Form>
    </div>
  );
}

function AnswerList() {
  const { data: contactDetail } = useDetail();
  const { answerList } = contactDetail || {};

  return (
    <div className="space-y-4">
      {answerList?.map((answer) => (
        <div key={answer.id} className="rounded-lg border bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <Badge variant="secondary">
              {moment(answer.created_at).format('YYYY-MM-DD HH:mm')}
            </Badge>
          </div>
          <div className="whitespace-pre-wrap text-gray-800">{answer.answer}</div>
        </div>
      ))}
      {answerList?.length === 0 && <TableEmpty>발송된 답변이 없습니다.</TableEmpty>}
    </div>
  );
}

export default AnswerList;
