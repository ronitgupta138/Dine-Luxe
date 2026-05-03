"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePagination = parsePagination;
exports.buildPaginationMeta = buildPaginationMeta;
exports.paginate = paginate;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
/**
 * Parses page/limit from a query object, with safe defaults and cap enforcement.
 */
function parsePagination(query) {
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
function buildPaginationMeta(total, page, limit) {
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
function paginate(page, limit) {
    const offset = (page - 1) * limit;
    return {
        from: offset,
        to: offset + limit,
    };
}
//# sourceMappingURL=pagination.js.map