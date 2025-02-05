export type ApiErrorResult<T> =
  | { code: string; message: string; status: number }
  | { data: T; status: 200 };
