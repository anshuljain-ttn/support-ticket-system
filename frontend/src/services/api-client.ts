import axios, { type AxiosError, isAxiosError } from 'axios';

import type { ApiError, ApiErrorDetail, ApiResponse } from '@/types/api.types';
import { isApiErrorResponse } from '@/types/api.types';

const DEFAULT_API_URL = 'http://localhost:4000';

function getApiBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!configuredUrl) {
    return DEFAULT_API_URL;
  }

  return configuredUrl.replace(/\/$/, '');
}

export class ApiClientError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly details?: ApiErrorDetail[];

  constructor(code: string, message: string, statusCode: number, details?: ApiErrorDetail[]) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  static fromApiError(error: ApiError, statusCode: number): ApiClientError {
    return new ApiClientError(error.code, error.message, statusCode, error.details);
  }
}

export function parseApiError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) {
    return error;
  }

  if (isAxiosError(error)) {
    return parseAxiosError(error);
  }

  if (error instanceof Error) {
    return new ApiClientError('CLIENT_ERROR', error.message, 0);
  }

  return new ApiClientError('UNKNOWN_ERROR', 'An unexpected error occurred', 0);
}

function parseAxiosError(error: AxiosError): ApiClientError {
  const statusCode = error.response?.status ?? 0;
  const responseData: unknown = error.response?.data;

  if (isApiErrorResponse(responseData)) {
    return ApiClientError.fromApiError(responseData.error, statusCode);
  }

  if (error.code === 'ECONNABORTED') {
    return new ApiClientError('REQUEST_TIMEOUT', 'Request timed out', statusCode);
  }

  if (!error.response) {
    return new ApiClientError('NETWORK_ERROR', 'Unable to reach the API server', statusCode);
  }

  return new ApiClientError(
    'HTTP_ERROR',
    error.message || `Request failed with status ${statusCode}`,
    statusCode,
  );
}

export function unwrapApiResponse<T>(body: ApiResponse<T>): T {
  if (!body.success) {
    throw ApiClientError.fromApiError(body.error, 400);
  }

  return body.data;
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30_000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(parseApiError(error)),
);

if (process.env.NODE_ENV === 'development') {
  apiClient.interceptors.request.use((config) => {
    const method = config.method?.toUpperCase() ?? 'GET';
    const url = config.url ?? '/';
    console.debug(`[api] ${method} ${url}`);
    return config;
  });
}

export const apiBaseUrl = getApiBaseUrl();
