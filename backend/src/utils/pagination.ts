export function getPagination(
  page = 1,
  limit = 20,
  maxLimit = 100,
): { page: number; limit: number; skip: number } {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), maxLimit);
  const skip = (safePage - 1) * safeLimit;

  return {
    page: safePage,
    limit: safeLimit,
    skip,
  };
}

export function getTotalPages(total: number, limit: number): number {
  return total === 0 ? 0 : Math.ceil(total / limit);
}
