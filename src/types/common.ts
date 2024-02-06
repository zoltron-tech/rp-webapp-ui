export type WithMessage<T = {}> = T & {
  message: string;
};

export type WithToken<T = {}> = T & {
  token: string;
};

export type MaybePromise<T> = T | Promise<T>;

export interface SearchResult {
  _tag: "SearchResult";
  username?: string;
  id?: string;
  firstName: string;
  lastName: string;
  image: string;
}
