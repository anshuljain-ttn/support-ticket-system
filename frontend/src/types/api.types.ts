export type ApiErrorDetail = {
  field: string;
  message: string;
};

export type ApiError = {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
};

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  error: ApiError;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return record.success === false && typeof record.error === 'object' && record.error !== null;
}

export function isApiSuccessResponse<T>(value: ApiResponse<T>): value is ApiSuccessResponse<T> {
  return value.success === true;
}
