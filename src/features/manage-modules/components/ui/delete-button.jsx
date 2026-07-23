'use client';

import { Button } from '@/shared/shadcn/components/ui/button';
import { ConfirmDialog } from '@/features/components/dialogs/confirm-dialog';
import { toast } from 'sonner';

import { deleteItem } from '../api';
import { usePathname } from 'next/navigation';
import { useManageModuleContext } from '@/features/manage-modules/components/manage-modules.context';

export function DeleteButton({
  id,
  successMessage = '게시글이 삭제되었습니다.',
  dialogTitle = '게시글 삭제',
  dialogDescription = `정말 게시글을 삭제하시겠습니까?`,
  deleteFunction,
}) {
  const pathname = usePathname();
  const { tableName } = useManageModuleContext();

  const handleDelete = async () => {
    const { success, errors } = deleteFunction
      ? await deleteFunction(id, tableName, pathname)
      : await deleteItem(id, tableName, pathname);

    if (!success) {
      toast.error(errors.message);
      return;
    }

    toast.success(successMessage);
  };

  return (
    <ConfirmDialog
      button={
        <Button variant="destructiveLight" size="xs">
          삭제
        </Button>
      }
      title={dialogTitle}
      description={dialogDescription}
      onActionClick={handleDelete}
    />
  );
}
