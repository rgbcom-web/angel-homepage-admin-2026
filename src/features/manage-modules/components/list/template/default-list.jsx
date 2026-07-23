'use client';

import { cn } from '@/shared/lib/utils';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  SortButton,
  TableEmpty,
} from '@/shared/shadcn/components/ui/table';
import { useState, useCallback, memo } from 'react';

import { SheetProvider, useSheet } from '@/features/components/sheet';

export const DefaultList = memo(function DefaultList({
  columns,
  data = [],
  cellBorder = false,
  onRowClick,
  headerTop = '118px',
  total,
  sheet,
}) {
  const [sorting, setSorting] = useState([]);

  const table = useReactTable({
    data,
    columns: columns.map((_col) => ({
      ..._col,
      header: ({ column }) => {
        if (_col.sortable) {
          return <SortButton column={column}>{_col.header}</SortButton>;
        }

        return _col.header;
      },
    })),
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <>
      <span className={cn('mb-2 block text-sm font-bold text-muted-foreground')}>
        Total ({total})
      </span>
      <Table>
        <TableHeader sticky style={{ top: headerTop }}>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      header.column.columnDef.width,
                      header.column.id === 'num' && 'w-[90px] text-center',
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, i) => (
              <SheetProvider key={row.id}>
                <Row row={row} cellBorder={cellBorder} table={table} onRowClick={onRowClick} />
                {sheet}
              </SheetProvider>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <TableEmpty />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
});

function Row({ row, cellBorder = true, table, onRowClick }) {
  const { setSheetOpen, setSheetData } = useSheet();

  const handleRowClick = useCallback(
    (row, e) => {
      setSheetOpen(true);
      setSheetData({ id: row.original.id });
      onRowClick?.(row, e);
    },
    [onRowClick],
  );

  return (
    <TableRow
      data-state={row.getIsSelected() && 'selected'}
      onClick={(e) => handleRowClick(row, e)}
      className={cn('hover:bg-gray-50 hover:text-primary-dark', onRowClick && 'cursor-pointer')}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          className={cn(
            cell.column.columnDef.className,
            cell.column.columnDef.width,
            cell.column.id === 'num' && 'text-center',
            cellBorder && 'border-r last:border-r-0',
            '[&:has(button)]:py-1.5',
          )}
        >
          <div className={cn('line-clamp-1')}>
            {cell.column.id === 'num'
              ? table.getRowModel().rows.length - i
              : flexRender(cell.column.columnDef.cell, cell.getContext())}
          </div>
        </TableCell>
      ))}
    </TableRow>
  );
}
