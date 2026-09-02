import { useCookies } from "react-cookie";
import { env } from "@/lib/env";
import { JWT_COOKIE_NAME, REFERRAL_COOKIE_NAME } from "@/utils/constants";

/**
 * Reading and writing the auth cookie from the browser.
 *
 * Next read and wrote this server-side through `next/headers`; a SPA does it
 * here. That is a change in *where* the cookie is touched, not in whether it is
 * reachable — it is `httpOnly: false` today and `validateJWTSync` already
 * decodes it client-side, so any script on the page could already see it.
 *
 * **Every attribute below is reproduced exactly from `app/actions.ts`.** A
 * mismatch here does not fail loudly: it logs everyone out on deploy, or writes
 * a cookie `api.novelist.world` cannot see. Diff the `Set-Cookie` header before
 * and after, and test the OAuth path specifically — `ExternalOAuth2SuccessHandler`
 * in user-service writes the same cookie with *different* attributes (7-day
 * maxAge, default SameSite), and the callback page then calls `setAuthCookie`
 * itself, so both writers run on that one flow.
 *
 * When SECURITY_AUTH_PLAN flips the cookie to `httpOnly: true`, the browser can
 * no longer read or write it and this module is deleted rather than fixed — the
 * transport becomes credentialed CORS. See REACT_MIGRATION_STEPS.md C7.
 *
 * See REACT_MIGRATION_STEPS.md B13.
 */

/**
 * ⚠ Reproduces a pre-existing truthiness bug, deliberately.
 *
 * `USE_LOCAL_DOMAIN` is a string. The original wrote
 * `USE_LOCAL_DOMAIN ? {} : { domain: … }`, so the string `"false"` — which is
 * what `.env.example` ships — is **truthy** and takes the *local* branch: no
 * `domain`, and `secure: !"false"` → `false`.
 *
 * In other words the flag only behaves as its name suggests when it is unset
 * entirely. Setting it to `false` explicitly does the opposite of what it says.
 *
 * This is copied rather than corrected because fixing it changes live cookie
 * attributes, which is exactly the failure this migration must not cause. It
 * should be fixed on its own, deliberately, with the `Set-Cookie` header
 * checked before and after — not smuggled in here.
 */
const useLocalDomain = Boolean(env.USE_LOCAL_DOMAIN);

const DAY = 60 * 60 * 24 * 1000;

type CookieAttributes = {
  expires: Date;
  sameSite: "strict" | "lax";
};

/**
 * Serialises one cookie write to the exact shape `next/headers` produced.
 *
 * `httpOnly` is absent because it cannot be set from JS — and it was already
 * `false`, so nothing is lost. Values are `encodeURIComponent`d, matching what
 * Next did; for a JWT this is a no-op, since none of its characters are
 * escaped.
 */
const writeCookie = (
  name: string,
  value: string,
  { expires, sameSite }: CookieAttributes,
) => {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    `Expires=${expires.toUTCString()}`,
    `SameSite=${sameSite === "strict" ? "Strict" : "Lax"}`,
  ];
  if (!useLocalDomain) {
    parts.push("Domain=novelist.world");
    parts.push("Secure");
  }
  document.cookie = parts.join("; ");
};

/** The raw JWT, or `undefined` when there is no session. Non-reactive. */
export const readAuthCookie = (): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${JWT_COOKIE_NAME}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : undefined;
};

/** The same value, re-rendering the caller when the cookie changes. */
export const useAuthCookie = (): string | undefined => {
  const [cookies] = useCookies([JWT_COOKIE_NAME]);
  return cookies[JWT_COOKIE_NAME];
};

/** 30-day expiry, `SameSite=Strict` — as the server wrote it. */
export const setAuthCookieSync = (jwt: string) =>
  writeCookie(JWT_COOKIE_NAME, jwt, {
    expires: new Date(Date.now() + 30 * DAY),
    sameSite: "strict",
  });

export const removeAuthCookieSync = () => {
  // The original backdated by a year rather than using the epoch; kept, because
  // some clients treat a 1970 date oddly and this is the behaviour in production.
  const past = new Date(0);
  past.setFullYear(past.getFullYear() - 1);
  writeCookie(JWT_COOKIE_NAME, "", { expires: past, sameSite: "strict" });
};

/**
 * 7-day expiry, and `SameSite=Lax` rather than Strict — deliberately.
 *
 * Strict would drop the cookie on the top-level redirect back from
 * Google/Discord to the OAuth2 callback, which is the one moment it has to
 * survive.
 */
export const setReferralCookieSync = (username: string) =>
  writeCookie(REFERRAL_COOKIE_NAME, username, {
    expires: new Date(Date.now() + 7 * DAY),
    sameSite: "lax",
  });

export const removeReferralCookieSync = () =>
  writeCookie(REFERRAL_COOKIE_NAME, "", {
    expires: new Date(0),
    sameSite: "lax",
  });

export const readReferralCookie = (): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${REFERRAL_COOKIE_NAME}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : undefined;
};
