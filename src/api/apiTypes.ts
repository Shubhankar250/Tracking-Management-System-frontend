// src/api/apiTypes.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}
