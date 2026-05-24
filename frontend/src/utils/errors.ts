import axios from 'axios';
import type { ApiErrorResponse } from '@/types/api';

export type AppErrorKind =
  | 'invalid_file'
  | 'network'
  | 'validation'
  | 'server'
  | 'unknown';

export interface AppError {
  kind: AppErrorKind;
  message: string;
  details?: string;
}

export function parseApiError(error: unknown): AppError {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return {
        kind: 'network',
        message: 'Unable to reach the server. Check your connection and API URL.',
        details: error.message,
      };
    }

    const status = error.response.status;
    const data = error.response.data as ApiErrorResponse | undefined;
    const message = data?.message ?? error.message;

    if (status === 400) {
      return {
        kind: 'validation',
        message: message || 'Request validation failed.',
        details: data?.error,
      };
    }

    if (status >= 500) {
      return {
        kind: 'server',
        message: message || 'Server error. Please try again later.',
        details: data?.error,
      };
    }

    return {
      kind: 'unknown',
      message: message || `Request failed (${status}).`,
      details: data?.error,
    };
  }

  if (error instanceof Error) {
    return { kind: 'unknown', message: error.message };
  }

  return { kind: 'unknown', message: 'An unexpected error occurred.' };
}
