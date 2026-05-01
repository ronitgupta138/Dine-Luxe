export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    field?: string;
    errors?: Array<{ field: string; message: string }>;
  };
}

export function success<T>(
  data: T,
  message?: string,
  meta?: Record<string, unknown>,
): SuccessResponse<T> {
  return {
    success: true,
    data,
    ...(message !== undefined && { message }),
    ...(meta !== undefined && { meta }),
  };
}

export function error(
  code: string,
  message: string,
  field?: string,
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(field !== undefined && { field }),
    },
  };
}

export function validationError(
  errors: Array<{ field: string; message: string }>,
): ErrorResponse {
  return {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors,
    },
  };
}
