const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Parses page/limit from a query object, with safe defaults and cap enforcement.
 */
export function parsePagination(query: Record<string, string | undefined>): PaginationParams {
  const rawPage = parseInt(query.page ?? '', 10);
  const rawLimit = parseInt(query.limit ?? '', 10);

  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : DEFAULT_PAGE;
  const limit = Number.isFinite(rawLimit) && rawLimit >= 1 ? Math.min(rawLimit, MAX_LIMIT) : DEFAULT_LIMIT;
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Builds pagination metadata to include in API responses.
 */
export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const pages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
  };
}

export function paginate(page: number, limit: number) {
  const offset = (page - 1) * limit;
  return {
    from: offset,
    to: offset + limit,
  };
}
