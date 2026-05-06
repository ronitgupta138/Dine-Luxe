export interface SuccessResponse<T = unknown> {
    success: true;
    data: T;
    message?: string;
    meta?: unknown;
}
export interface ErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        field?: string;
        errors?: Array<{
            field: string;
            message: string;
        }>;
    };
}
export declare function success<T>(data: T, messageOrMeta?: string | unknown, meta?: unknown): SuccessResponse<T>;
export declare function error(codeOrMessage: string, message?: string, field?: string): ErrorResponse;
export declare function validationError(errors: Array<{
    field: string;
    message: string;
}>): ErrorResponse;
//# sourceMappingURL=response.d.ts.map