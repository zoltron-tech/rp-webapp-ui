import { useCookies } from "react-cookie";
import { env } from "@/lib/env";
import { JWT_COOKIE_NAME, REFERRAL_COOKIE_NAME } from "@/utils/constants";

/**
 * The cookies this app still writes from the browser.
 *
 * **The auth cookies are not among them.** `X-NW-AUTH-TOKEN` and
 * `X-NW-REFRESH-TOKEN` are `httpOnly` and written only by user-service; nothing
 * here can read or set either one, which is the point — an XSS on
 * novelist.world no longer walks away with a session (SECURITY_AUTH_PLAN C5).
 *
 * What is left is the referral cookie, which is a marketing attribution hint
 * rather than a credential, plus the clean-up needed for the browsers still
 * carrying an old, script-visible auth cookie.
 *
 * See REACT_MIGRATION_STEPS.md B13 and SECURITY_AUTH_PLAN Phase 2 step 18.
 */

/**
 * Whether this build writes cookies scoped to novelist.world or host-only.
 *
 * `USE_LOCAL_DOMAIN` arrives as a string, so the `Boolean(...)` this replaced
 * made `"false"` truthy and took the local branch in production. Only the
 * literal string `"true"` enables it now.
 */
const useLocalDomain = env.USE_LOCAL_DOMAIN === "true";

/** The domain user-service scopes its cookies to. Must match `app.cookie.domain`. */
const SHARED_COOKIE_DOMAIN = "novelist.world";

const DAY = 60 * 60 * 24 * 1000;

type CookieAttributes = {
  expires: Date;
  sameSite: "strict" | "lax";
};

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
    parts.push(`Domain=${SHARED_COOKIE_DOMAIN}`);
    parts.push("Secure");
  }
  document.cookie = parts.join("; ");
};

/**
 * Every `Domain` a copy of a cookie could be sitting under: host-only (no
 * attribute), the exact host, each parent down to the registrable domain, and
 * `novelist.world` itself.
 *
 * Single-label hosts (`localhost`) can only hold a host-only cookie, and a bare
 * TLD (`.world`) is rejected by the browser, so neither is emitted.
 */
const deletionDomains = (): (string | undefined)[] => {
  const domains: (string | undefined)[] = [undefined];
  const host = typeof location === "undefined" ? "" : location.hostname;
  const labels = host.split(".");
  for (let i = 0; i + 1 < labels.length; i++) {
    domains.push(labels.slice(i).join("."));
  }
  if (!domains.includes(SHARED_COOKIE_DOMAIN)) {
    domains.push(SHARED_COOKIE_DOMAIN);
  }
  return domains;
};

/**
 * Expires a cookie under every domain it could exist under, not just the one
 * this build writes.
 *
 * Cookie identity is (name, domain, path), so a browser holding both a
 * host-only copy and a `Domain=novelist.world` copy under one name has two
 * cookies — and clearing one leaves the other alive. Expiring a cookie that was
 * never set costs a header and nothing else.
 */
const clearCookieEverywhere = (name: string) => {
  // Backdated by a year rather than the epoch: some clients treat 1970 oddly,
  // and this is the behaviour production already had.
  const past = new Date(0);
  past.setFullYear(past.getFullYear() - 1);
  const expires = past.toUTCString();

  for (const domain of deletionDomains()) {
    for (const sameSite of ["Strict", "Lax", "None"]) {
      const parts = [`${name}=`, "Path=/", `Expires=${expires}`];
      if (domain) parts.push(`Domain=${domain}`);
      parts.push(`SameSite=${sameSite}`);
      // SameSite=None is only honoured on a Secure cookie; without it the
      // browser drops the whole deletion write and the copy survives.
      if (sameSite === "None") parts.push("Secure");
      document.cookie = parts.join("; ");
    }
  }
};

/**
 * Removes the pre-migration, script-visible auth cookie.
 *
 * Called once at startup. A browser that was signed in before this change is
 * carrying a `X-NW-AUTH-TOKEN` cookie that JavaScript can still see and that the
 * browser will keep sending — where it would shadow the new `httpOnly` cookie of
 * the same name, and where it remains a readable bearer token. It cannot be
 * upgraded in place, only deleted; the refresh cookie then re-establishes the
 * session, or the user signs in again.
 *
 * Safe to run forever: once no legacy cookie exists this writes expiry headers
 * for cookies that are already gone. `httpOnly` cookies are untouched — script
 * cannot delete those either, which is exactly why user-service clears them on
 * logout instead.
 */
export const dropLegacyAuthCookie = () => {
  if (typeof document === "undefined") return;

  const hasScriptVisibleAuthCookie = new RegExp(
    `(?:^|; )${JWT_COOKIE_NAME}=`,
  ).test(document.cookie);
  if (!hasScriptVisibleAuthCookie) return;

  clearCookieEverywhere(JWT_COOKIE_NAME);
};

// ─── Referral ────────────────────────────────────────────────────────────────

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
  // Same two-writers problem as the auth cookie had: user-service clears this
  // one under `Domain=novelist.world`, so clear every variant here too.
  clearCookieEverywhere(REFERRAL_COOKIE_NAME);

export const readReferralCookie = (): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${REFERRAL_COOKIE_NAME}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : undefined;
};

/** Re-renders the caller when the referral cookie changes. */
export const useReferralCookie = (): string | undefined => {
  const [cookies] = useCookies([REFERRAL_COOKIE_NAME]);
  return cookies[REFERRAL_COOKIE_NAME];
};
