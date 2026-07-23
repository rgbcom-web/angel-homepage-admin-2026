import { cn } from '@/shared/lib/utils';

export function PageContainer({ children }) {
  return <main className="relative z-[0] w-full">{children}</main>;
}

export function PageHeader({ className, title, primarySlot, secondarySlot, thirdSlot, ...props }) {
  return (
    <div
      className={cn(
        'sticky top-0 z-[50] w-full space-y-4 border-b bg-background px-content-padding-x py-4',
        className,
      )}
      {...props}
    >
      <div className={cn('flex justify-between gap-4')}>
        <h1 className="text-2xl font-medium">{title}</h1>
        {primarySlot && <div className="flex items-center gap-2">{primarySlot}</div>}
      </div>
      {(secondarySlot || thirdSlot) && (
        <div className={cn('flex justify-between gap-4')}>
          {secondarySlot && <div>{secondarySlot}</div>}
          {thirdSlot && <div className="ml-auto">{thirdSlot}</div>}
        </div>
      )}
    </div>
  );
}

export function PageBody({ children }) {
  return <div className="px-content-padding-x py-content-padding-x">{children}</div>;
}
