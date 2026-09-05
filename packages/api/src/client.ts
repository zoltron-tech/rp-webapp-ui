import { API_MESSAGE } from "@nw/types";
import type { DataType, ErrorType } from "@nw/types/common";

/**
 * How a 404 should be reported.
 *
 * These are not interchangeable — the existing actions mean different things by
 * "not found", and flattening them would change behaviour at a hundred call
 * sites. `empty-array` is right for a list endpoint, `null` for "we genuinely do
 * not know" (see `getViewedGuides`, where a guess would auto-open a guide
 * nobody asked for), and `error` for anything a caller should treat as failure.
 */
export type NotFoundBehaviour = "error" | "null" | "empty-array";

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Serialised as JSON unless it is already a string or FormData. */
  body?: unknown;
  /** Label for the debug log line. Defaults to `METHOD path`. */
  label?: string;
  /** Defaults to `"error"`. */
  notFound?: NotFoundBehaviour;
  /**
   * Wrap the whole call in try/catch and report a thrown network error as
   * `{ message: API_MESSAGE.Error }` rather than letting it propagate.
   */
  catchErrors?: boolean;
  /** Send no auth header even when a token is available. */
  anonymous?: boolean;
  /**
   * Refuse to send the request at all without a token.
   *
   * Overrides the client-level default. The call short-circuits to a 401 —
   * no network round trip, and no redirect: the caller decides what an
   * unauthenticated result means for its screen.
   */
  requireAuth?: boolean;
  /** Override or suppress (`false`) the JSON content type. */
  contentType?: string | false;
  /** Extra headers, merged last. */
  headers?: Record<string, string>;
  /**
   * On failure, read the response body for a backend validation message and
   * surface it as `ErrorType.reason`.
   *
   * Some endpoints reject with a human-readable explanation the UI shows
   * verbatim — "you have reached your storyboard limit" and the like. Without
   * this the caller only sees a generic error.
   */
  withReason?: boolean;
}

export interface ApiConfig {
  /** Service root, no trailing slash. */
  baseUrl: string;
  /**
   * The bearer token, or null/undefined when signed out.
   *
   * Kept deliberately dumb: it returns a token or it does not. Anything that
   * redirects, clears a cookie, or otherwise touches the framework belongs in
   * the app that supplies this function, not in here.
   */
  getToken: () => string | null | undefined | Promise<string | null | undefined>;
  /** Header the token travels in. */
  authHeaderName: string;
  /**
   * Default for {@link RequestOptions.requireAuth}. A client built with this
   * on never issues an unauthenticated request.
   */
  requireAuth?: boolean;
  /** Called with every response status, for the app's own logger. */
  log?: (label: string, status: number) => void;
  /** Called on any 401, before the result is returned. */
  onUnauthorized?: () => void;
  /**
   * Send cookies on every request.
   *
   * Required on web now that the session lives in httpOnly cookies the browser
   * attaches itself — without it the API sees an anonymous request. Native has
   * no cookie jar and leaves this off, which is why it is a flag rather than a
   * constant.
   */
  withCredentials?: boolean;
  /**
   * Try to renew an expired session, once, and say whether it worked.
   *
   * This is the seam that makes a 15-minute access token invisible. When a
   * request comes back 401 the client calls this and, if it succeeds, replays
   * the original request exactly once. Supplying it is what turns on that
   * behaviour; a client without it treats every 401 as final.
   *
   * The implementation must be single-flight — see `createRefreshCoordinator`.
   */
  refreshSession?: () => Promise<boolean>;
}

/**
 * Collapses concurrent refreshes into one.
 *
 * The app fires many requests at once — a page load kicks off the profile, the
 * unread counts and the feed together. When the access token has just expired
 * they all 401 at the same moment, and without this each would start its own
 * rotation. That is not merely wasteful: rotation is single-use by design, so
 * the second request would present a token the first had already spent, which
 * user-service reads as *reuse* and answers by revoking the whole session
 * family. Racing refreshes would log the user out.
 *
 * So: the first caller performs the rotation, everyone who arrives while it is
 * in flight awaits the same promise, and the slot is cleared once it settles.
 */
export const createRefreshCoordinator = (
  refresh: () => Promise<boolean>,
): (() => Promise<boolean>) => {
  let inFlight: Promise<boolean> | null = null;

  return () => {
    if (inFlight) return inFlight;

    inFlight = refresh().finally(() => {
      inFlight = null;
    });

    return inFlight;
  };
};

const errorResult = (): ErrorType => ({ message: API_MESSAGE.Error });

/** Backend validation errors (e.g. tier limit reached) come back as `{ message: string }`. */
const parseErrorReason = (rawText: string): string | undefined => {
  try {
    const parsed = JSON.parse(rawText);
    return typeof parsed?.message === "string" ? parsed.message : undefined;
  } catch {
    return undefined;
  }
};

/**
 * What a caller gets when it required a token and there wasn't one.
 *
 * Built by hand rather than with `new Response(...)`: the constructor is not
 * reliably present across every runtime this package targets, and only these
 * few members are ever read. It looks exactly like a real 401 to every code
 * path below, so nothing has to special-case "we didn't even try".
 */
const unauthorizedResponse = (): Response =>
  ({
    headers: {
      forEach: () => {},
      get: () => null,
      has: () => false,
    },
    json: async () => null,
    ok: false,
    status: 401,
    statusText: "Unauthorized",
    text: async () => "",
    url: "",
  }) as unknown as Response;

export interface ApiClient {
  /**
   * A request that resolves to the parsed body or `{ message }` — never `null`.
   *
   * This is the common case, and keeping `null` out of it matters: most call
   * sites do `if ("message" in result) … else use(result)`, which only
   * type-checks when there is no third possibility.
   */
  request<T>(path: string, options?: RequestOptions): Promise<T | ErrorType>;
  /**
   * The same, for endpoints where "nothing" is a real answer distinct from
   * failure — use with `notFound: "null"`.
   */
  requestNullable<T>(
    path: string,
    options?: RequestOptions,
  ): Promise<DataType<T>>;
  /**
   * The raw response, for the handful of calls that need the status or an
   * empty body rather than a parsed payload.
   */
  raw(path: string, options?: RequestOptions): Promise<Response>;
  /** The configured service root, for callers that must build a URL by hand. */
  readonly baseUrl: string;
  /**
   * The auth header's name, for the few endpoints that carry a token which did
   * not come from the session — a verification or password-reset link.
   */
  readonly authHeaderName: string;
}

export const createApiClient = (config: ApiConfig): ApiClient => {
  const buildHeaders = (
    options: RequestOptions,
    token: string | null | undefined,
  ): Record<string, string> => {
    const headers: Record<string, string> = {};

    // FormData must set its own multipart boundary — naming a content type
    // here would corrupt the upload.
    const isFormData =
      typeof FormData !== "undefined" && options.body instanceof FormData;
    if (options.contentType !== false && !isFormData) {
      headers["Content-Type"] = options.contentType ?? "application/json";
    }

    if (token) headers[config.authHeaderName] = token;

    return { ...headers, ...options.headers };
  };

  const raw = async (
    path: string,
    options: RequestOptions = {},
  ): Promise<Response> => {
    const method = options.method ?? "GET";
    const label = options.label ?? `${method} ${path}`;

    // A body that is a stream or FormData can only be sent once, so it is built
    // here and reused by both the first attempt and the post-refresh retry.
    const body =
      options.body === undefined
        ? undefined
        : typeof options.body === "string" ||
            (typeof FormData !== "undefined" && options.body instanceof FormData)
          ? (options.body as BodyInit)
          : JSON.stringify(options.body);

    const attempt = async (): Promise<Response | "no-token"> => {
      const token = options.anonymous ? null : await config.getToken();

      // Stop before the network when the caller said a session is mandatory
      // *and* nothing can supply one. With cookie sessions there is no token to
      // read, so `refreshSession` being present means "the browser may well be
      // carrying a session" and the request is worth making.
      const requireAuth = options.requireAuth ?? config.requireAuth ?? false;
      if (requireAuth && !token && !config.refreshSession) return "no-token";

      return fetch(`${config.baseUrl}${path}`, {
        body,
        cache: "no-store",
        // The session is two httpOnly cookies; omitting this sends the request
        // signed out. Same-origin would not do — the app and the API are
        // different origins on the same site.
        credentials: config.withCredentials ? "include" : "same-origin",
        headers: buildHeaders(options, token),
        method,
      });
    };

    const first = await attempt();
    if (first === "no-token") {
      // Deliberately not a redirect — the shared client has no idea what screen
      // it is on, and a native app has nowhere to redirect to anyway.
      config.log?.(label, 401);
      config.onUnauthorized?.();
      return unauthorizedResponse();
    }

    // The access token expires every fifteen minutes, so a 401 here is the
    // ordinary case rather than an error: renew and replay. Anonymous calls are
    // excluded because a 401 on one means something else entirely.
    if (first.status === 401 && config.refreshSession && !options.anonymous) {
      config.log?.(`${label} (refreshing)`, 401);

      if (await config.refreshSession()) {
        const retried = await attempt();
        if (retried !== "no-token") {
          config.log?.(label, retried.status);
          // Exactly once. A second 401 means the new token is genuinely not
          // good enough for this call, and retrying again would loop.
          if (retried.status === 401) config.onUnauthorized?.();
          return retried;
        }
      }

      config.log?.(label, 401);
      config.onUnauthorized?.();
      return first;
    }

    config.log?.(label, first.status);
    if (first.status === 401) config.onUnauthorized?.();

    return first;
  };

  const requestNullable = async <T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<DataType<T>> => {
    const run = async (): Promise<DataType<T>> => {
      const response = await raw(path, options);

      if (response.status === 404) {
        if (options.notFound === "null") return null;
        if (options.notFound === "empty-array") return [] as T;
        return errorResult();
      }

      if (!response.ok) {
        if (!options.withReason) return errorResult();
        const rawText = await response.text().catch(() => "");
        return { ...errorResult(), reason: parseErrorReason(rawText) };
      }

      // 204, and endpoints that answer with an empty body on success. The old
      // hand-written actions called `response.json()` straight away and threw
      // here; returning null instead is the one deliberate behaviour change,
      // and it only fires where the body really is empty.
      const text = await response.text();
      if (!text) return null;

      return JSON.parse(text) as T;
    };

    if (!options.catchErrors) return run();

    try {
      return await run();
    } catch {
      return errorResult();
    }
  };

  const request = async <T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T | ErrorType> => {
    const result = await requestNullable<T>(path, options);
    return result === null ? errorResult() : result;
  };

  return {
    authHeaderName: config.authHeaderName,
    baseUrl: config.baseUrl,
    raw,
    request,
    requestNullable,
  };
};
