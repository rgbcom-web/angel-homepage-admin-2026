'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/shadcn/components/ui/alert-dialog';
import { Loader } from 'lucide-react';

export function ConfirmDialog({ button, title, description, onActionClick }) {
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);

  const onDialogActionClick = async (e) => {
    e.preventDefault();

    setPending(true);

    if (onActionClick) {
      await onActionClick();
    }

    setPending(false);
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{button}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>아니오</AlertDialogCancel>
          <AlertDialogAction onClick={onDialogActionClick} disabled={pending}>
            {pending ? <Loader className="animate-spin" /> : '네'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
