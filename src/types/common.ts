export type WithMessage<T = {}> = T & {
  message: string;
};

export type WithToken<T = {}> = T & {
  token: string;
};
