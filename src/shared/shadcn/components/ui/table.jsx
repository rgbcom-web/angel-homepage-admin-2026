import * as React from 'react';

import { cn } from '@/shared/lib/utils';
import { ChevronUp, ChevronDown } from 'lucide-react';

const Table = React.forwardRef(({ className, ...props }, ref) => (
  <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef(({ className, sticky, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      'relative bg-background-secondary',
      'before:absolute before:left-0 before:top-0 before:h-0 before:w-full before:border-t',
      'after:absolute after:bottom-0 after:left-0 after:h-0 after:w-full after:border-t',
      sticky && 'sticky top-[-1px] z-[20]',
      '[&_th]:font-medium',
      '[&_tr]:hover:bg-background-secondary',
      className,
    )}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn(className)} {...props} />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
      'has-[.list-empty]:hover:bg-transparent',
      className,
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-10 px-2 text-left align-middle font-medium text-muted-foreground [&>[role=checkbox]]:translate-y-[2px]',
      className,
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('px-2 py-3 align-middle [&>[role=checkbox]]:translate-y-[2px]', className)}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />
));
TableCaption.displayName = 'TableCaption';

const SortButton = React.forwardRef(({ className, column, onClick, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn('flex w-full items-center justify-between gap-2 px-0', className)}
    onClick={() => {
      if (column.getIsSorted() === 'desc') {
        column.clearSorting();
      } else {
        column.toggleSorting(column.getIsSorted() === 'asc');
      }
      onClick && onClick();
    }}
    {...props}
  >
    <span className={cn(column.getIsSorted() && 'font-bold text-primary')}>{children}</span>
    <div className="flex flex-col items-center gap-0">
      <ChevronUp
        className={cn('-mb-1 h-4 w-4', column.getIsSorted() === 'asc' && 'text-primary')}
      />
      <ChevronDown
        className={cn('-mt-0.5 h-4 w-4', column.getIsSorted() === 'desc' && 'text-primary')}
      />
    </div>
  </button>
));
SortButton.displayName = 'SortButton';

const TableEmpty = ({ children }) => {
  return (
    <div className="list-empty flex h-[250px] items-center justify-center border text-center text-lg text-muted-foreground">
      {children || '데이터가 없습니다.'}
    </div>
  );
};

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  SortButton,
  TableEmpty,
};
