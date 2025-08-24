export type With<A extends string | number | symbol, T = {}, K = string> = T & {
  [key in A]: K;
};

export type WithMessage<T = {}> = With<"message", T>;

export type WithToken<T = {}> = With<"token", T>;

export type MaybePromise<T> = T | Promise<T>;

export interface SearchResult {
  username?: string;
  id?: string;
  name?: string;
  firstName: string;
  lastName: string;
  image: string;
}

export interface Tag {
  id: string;
  label: string;
  color: string;
}

export type Hook<T, K> = (props: T) => K;
