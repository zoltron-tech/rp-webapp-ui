/**
 * Minimal JWT reading — decode only, never verification.
 *
 * This replaces a `jsonwebtoken` dependency that was only ever used for
 * `JWT.decode`. That package pulls in Node built-ins (`crypto`, `buffer`) and
 * would not run in React Native, and its verification half was never used:
 * signatures are checked by user-service, not here. See SECURITY_AUTH_PLAN.md
 * §1.3 — the client deliberately trusts the token's shape and lets the server
 * reject it.
 */

const BASE64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Decodes standard or URL-safe base64 into a UTF-8 string. */
function base64UrlDecode(input: string): string {
  const normalised = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalised.padEnd(
    normalised.length + ((4 - (normalised.length % 4)) % 4),
    "=",
  );

  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;

  for (const char of padded) {
    if (char === "=") break;
    const value = BASE64_ALPHABET.indexOf(char);
    if (value === -1) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }

  // Bytes are UTF-8; percent-encode them so decodeURIComponent can widen
  // multi-byte sequences correctly. A naive charCode join would mangle any
  // non-ASCII claim.
  const percentEncoded = bytes
    .map((byte) => `%${byte.toString(16).padStart(2, "0")}`)
    .join("");

  return decodeURIComponent(percentEncoded);
}

export interface JwtPayload {
  exp?: number;
  [claim: string]: unknown;
}

/** The token's claims, or `null` when it is not a readable JWT. */
export const decodeJwt = (token: string): JwtPayload | null => {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return typeof payload === "object" && payload !== null ? payload : null;
  } catch {
    return null;
  }
};

/**
 * True when the token carries an `exp` that has not passed.
 *
 * A token without `exp`, or one that will not parse, counts as invalid — an
 * unreadable credential should never be treated as a live session.
 */
export const validateJWTSync = (jwt: string): boolean => {
  const payload = decodeJwt(jwt);
  if (!payload?.exp) return false;
  return payload.exp * 1000 > Date.now();
};
