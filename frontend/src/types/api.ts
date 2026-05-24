export interface ApiErrorResponse {
  error: string;
  message: string;
  stack?: string;
}

export interface PaginatedResponse<T> {
  runId: string;
  page: number;
  limit: number;
  total: number;
  items: T[];
}
