import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  useDialog,
} from '@/shared/shadcn/components/ui/dialog';
import { AtSign } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useAuth } from '@/features/auth/AuthSessionProvider';
import { SetSMTPForm } from '@/features/settings-module/smtp';

export function SMTPDialog() {
  const { user } = useAuth();

  if (!user.super_admin) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger
        className={cn(
          'relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0',
          'hover:bg-accent hover:text-accent-foreground',
        )}
      >
        <AtSign />
        SMTP 설정
      </DialogTrigger>
      <DialogContent className={{ content: cn('pb-0') }}>
        <DialogHeader>
          <DialogTitle>SMTP 설정</DialogTitle>
          <DialogDescription>
            SMTP 설정은 알림 메일 발송에 사용됩니다. <br />
            실제 발송에 사용될 정보와 이메일 계정, 비밀번호를 입력해주세요. <br />
            정보와 다를 경우 알림메일은 발송되지 않습니다.
          </DialogDescription>
        </DialogHeader>
        <SMTPFormContainer />
      </DialogContent>
    </Dialog>
  );
}

function SMTPFormContainer() {
  const { setOpen } = useDialog();

  return <SetSMTPForm onSuccess={() => setOpen(false)} />;
}
