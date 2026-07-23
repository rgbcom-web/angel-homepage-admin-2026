'use client';

import { cn } from '@/shared/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/shadcn/components/ui/pagination';
import { useQueryString } from '@/shared/hooks/useQueryString';
import { validatePageParam, setPaginationData } from './pagination.utils';

export function ListPagination({ itemsPerPage, pagesPerBlock, listCount, buttons }) {
  const qs = useQueryString();
  const pageParam = validatePageParam(qs.get('page'));

  const { currentPage, prevPage, nextPage, paging } = setPaginationData({
    pageParam,
    listCount,
    itemsPerPage,
    pagesPerBlock,
  });

  return (
    <Pagination className={cn('sticky bottom-0 mt-4 justify-between gap-4 bg-white py-4')}>
      <PaginationContent className={cn('mr-auto')}>
        <PaginationItem>
          <PaginationPrevious onClick={() => qs.set({ page: prevPage })} />
        </PaginationItem>
        {paging.map((page) => (
          <PaginationItem key={`list-pagination-${page}`}>
            <PaginationLink onClick={() => qs.set({ page })} isActive={currentPage === page}>
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext onClick={() => qs.set({ page: nextPage })} />
        </PaginationItem>
      </PaginationContent>
      <div className={cn('flex items-center gap-2')}>{buttons}</div>
    </Pagination>
  );
}
