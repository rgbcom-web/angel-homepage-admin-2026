export function validatePageParam(param) {
  const page = Number(param || 1);
  return page;
}

export function setPagingIndexes(page, itemsPerPage) {
  const currentPage = validatePageParam(page);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = currentPage * itemsPerPage - 1;

  return { startIndex, endIndex };
}

export function setPaginationData({ pageParam, listCount, itemsPerPage, pagesPerBlock }) {
  const pageTotal = Math.ceil(listCount / itemsPerPage) || 1;
  const currentBlock = Math.ceil(pageParam / pagesPerBlock);
  const prevPage = pageParam - 1 < 1 ? 1 : pageParam - 1;
  const nextPage = pageParam + 1 > pageTotal ? pageTotal : pageParam + 1;
  const paging = Array.from(
    { length: pagesPerBlock },
    (_, i) => (currentBlock - 1) * pagesPerBlock + i + 1,
  ).filter((page) => page <= pageTotal);

  return {
    currentPage: pageParam,
    prevPage,
    nextPage,
    paging,
  };
}
