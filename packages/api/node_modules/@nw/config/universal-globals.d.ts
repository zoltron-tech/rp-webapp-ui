/**
 * Globals that exist in every runtime we target — browser, Node, and React
 * Native — but are not part of the `ES2022` lib.
 *
 * Shared packages compile with `lib: ["ES2022"]` and no DOM on purpose: that is
 * what proves they are portable. But timers, `URL`, and `process.env` are not
 * DOM APIs, they are just not in the language lib either. Declaring them
 * narrowly here keeps the DOM out while letting portable code use what is
 * genuinely available everywhere.
 *
 * Deliberately NOT declared: `window`, `document`, `navigator`, `localStorage`,
 * and the Node-only surface (`fs`, `path`, `Buffer`). Reach for a platform
 * adapter instead — see `@nw/utils/platform`.
 */

declare function setTimeout(
  handler: (...args: unknown[]) => void,
  timeout?: number,
): number;
declare function clearTimeout(id: number | undefined): void;
declare function setInterval(
  handler: (...args: unknown[]) => void,
  timeout?: number,
): number;
declare function clearInterval(id: number | undefined): void;

declare class URL {
  constructor(url: string, base?: string);
  hash: string;
  host: string;
  hostname: string;
  href: string;
  readonly origin: string;
  password: string;
  pathname: string;
  port: string;
  protocol: string;
  search: string;
  readonly searchParams: URLSearchParams;
  username: string;
  toString(): string;
}

declare class URLSearchParams {
  constructor(
    init?: string | string[][] | Record<string, string> | URLSearchParams,
  );
  append(name: string, value: string): void;
  delete(name: string): void;
  get(name: string): string | null;
  getAll(name: string): string[];
  has(name: string): boolean;
  set(name: string, value: string): void;
  sort(): void;
  toString(): string;
  forEach(
    callback: (value: string, key: string, parent: URLSearchParams) => void,
  ): void;
}

declare const process: {
  env: Record<string, string | undefined>;
};

// ─── fetch ───────────────────────────────────────────────────────────────────
// Present in browsers, Node 18+, and React Native. Typed narrowly: only the
// surface shared code actually uses, so a DOM-only option cannot creep in.

type BodyInit = string | FormData | URLSearchParams | ArrayBuffer | Blob;

declare class Blob {
  readonly size: number;
  readonly type: string;
}

declare class FormData {
  append(name: string, value: string | Blob, fileName?: string): void;
  delete(name: string): void;
  get(name: string): string | Blob | null;
  getAll(name: string): (string | Blob)[];
  has(name: string): boolean;
  set(name: string, value: string | Blob, fileName?: string): void;
  forEach(
    callback: (value: string | Blob, key: string, parent: FormData) => void,
  ): void;
}

declare class Headers {
  constructor(init?: Record<string, string> | [string, string][] | Headers);
  append(name: string, value: string): void;
  delete(name: string): void;
  get(name: string): string | null;
  has(name: string): boolean;
  set(name: string, value: string): void;
  forEach(
    callback: (value: string, key: string, parent: Headers) => void,
  ): void;
}

interface RequestInit {
  body?: BodyInit;
  cache?: "default" | "no-store" | "reload" | "no-cache" | "force-cache";
  headers?: Record<string, string> | Headers;
  method?: string;
  signal?: unknown;
}

declare class Response {
  readonly headers: Headers;
  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  arrayBuffer(): Promise<ArrayBuffer>;
  blob(): Promise<Blob>;
  // biome-ignore lint/suspicious/noExplicitAny: the parsed shape is the caller's to assert
  json(): Promise<any>;
  text(): Promise<string>;
}

declare function fetch(input: string, init?: RequestInit): Promise<Response>;

declare const console: {
  debug(...data: unknown[]): void;
  error(...data: unknown[]): void;
  info(...data: unknown[]): void;
  log(...data: unknown[]): void;
  warn(...data: unknown[]): void;
};
