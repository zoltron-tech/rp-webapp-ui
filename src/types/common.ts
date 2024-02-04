export type WithMessage<T = {}> = T & {
  message: string;
};

export type WithToken<T = {}> = T & {
  token: string;
};

export type MaybePromise<T> = T | Promise<T>;
