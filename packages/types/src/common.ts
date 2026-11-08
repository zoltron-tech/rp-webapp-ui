import type { API_MESSAGE } from "./api-message";

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
  pennedBy?: { username: string; image?: string | null } | null;
}

export interface Tag {
  id: string;
  label: string;
  color: string;
}

/** A genre from the curated, read-only catalogue (users pick, never create). */
export interface Genre {
  id: number;
  label: string;
  color: string;
}

export type Hook<T, K> = (props: T) => K;

export type ErrorType = {
  message: API_MESSAGE.Error;
  /** Human-readable detail from the backend (e.g. tier limit reached), when available. */
  reason?: string;
  /**
   * The service's machine code off a 422 `{ "code": "..." }` (e.g.
   * `too_many_media` from the prompt, comment and reply saves), when it sent one.
   */
  code?: string;
};

export type DataType<T> = ErrorType | T | null;
