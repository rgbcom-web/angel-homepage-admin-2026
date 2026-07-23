'use client';

import { Toaster as Sonner } from 'sonner';

const Toaster = ({ position = 'bottom-center', ...props }) => {
  return (
    <Sonner
      theme={'light'}
      className="toaster group font-['Pretendard']"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
        closeButton: false,
        duration: 3000,
      }}
      position={position}
      richColors
      style={{
        '--offset': '20px',
      }}
      {...props}
    />
  );
};

export { Toaster };
