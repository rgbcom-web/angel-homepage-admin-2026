import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  useDialog,
} from '@/shared/shadcn/components/ui/dialog';
import { Mail } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useAuth } from '@/features/auth/AuthSessionProvider';
import { AlimMailRecipientsForm } from '@/features/settings-module/alim-mail-recipients';

export function AlimMailRecipientsDialog() {
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
        <Mail />
        알림메일 수신자 설정
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>알림메일 수신자 설정</DialogTitle>
          <DialogDescription>
            각 인바운드 접수시 알림 메일을 받을 메일 주소를 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        <AlimMailRecipientsFormContainer />
      </DialogContent>
    </Dialog>
  );
}

function AlimMailRecipientsFormContainer() {
  const { setOpen } = useDialog();

  return <AlimMailRecipientsForm onSuccess={() => setOpen(false)} />;
}
