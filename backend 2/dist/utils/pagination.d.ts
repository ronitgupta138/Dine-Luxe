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
export declare function parsePagination(query: Record<string, string | undefined>): PaginationParams;
/**
 * Builds pagination metadata to include in API responses.
 */
export declare function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta;
export declare function paginate(page: number, limit: number): {
    from: number;
    to: number;
};
//# sourceMappingURL=pagination.d.ts.map