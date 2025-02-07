export type ActionResult<T> =
  | {
      error: {
        message: string;
      };
      success?: undefined;
    }
  | {
      success: {
        data: T;
        message: string;
      };
      error?: undefined;
    };
