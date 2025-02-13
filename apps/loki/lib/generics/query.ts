export type Query<T> = {
  page: number;
  pageSize: number;
} & {
  [K in keyof T]?: T[K] | Partial<T[K]>;
};
