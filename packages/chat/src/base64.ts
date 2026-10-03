/**
 * Base64, without `atob`/`btoa`.
 *
 * Those are browser globals. Hermes does not define them, and a polyfill would
 * mean the two clients encode ciphertext through different code — which is
 * precisely the sort of difference that shows up as "one device cannot read the
 * other's messages" rather than as a build error.
 *
 * Messages are short, so the cost of doing it in JavaScript is not worth
 * optimising away for a platform branch.
 */

const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const LOOKUP: Record<string, number> = {};
for (let index = 0; index < ALPHABET.length; index += 1) {
  LOOKUP[ALPHABET[index]] = index;
}

export const toBase64 = (bytes: Uint8Array): string => {
  let out = "";

  for (let index = 0; index < bytes.length; index += 3) {
    const a = bytes[index];
    const b = bytes[index + 1];
    const c = bytes[index + 2];

    out += ALPHABET[a >> 2];
    out += ALPHABET[((a & 3) << 4) | ((b ?? 0) >> 4)];
    out += b === undefined ? "=" : ALPHABET[((b & 15) << 2) | ((c ?? 0) >> 6)];
    out += c === undefined ? "=" : ALPHABET[c & 63];
  }

  return out;
};

export const fromBase64 = (base64: string): Uint8Array => {
  // Tolerate the URL-safe alphabet and missing padding: this decodes a secret
  // handed over by a backend, and rejecting a variant spelling of the same
  // bytes would break chat for a change nobody thought was breaking.
  const clean = base64
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .replace(/[^A-Za-z0-9+/]/g, "");
  const length = Math.floor((clean.length * 3) / 4);
  const bytes = new Uint8Array(length);

  let byte = 0;
  for (let index = 0; index < clean.length; index += 4) {
    const a = LOOKUP[clean[index]] ?? 0;
    const b = LOOKUP[clean[index + 1]] ?? 0;
    const c = LOOKUP[clean[index + 2]];
    const d = LOOKUP[clean[index + 3]];

    if (byte < length) bytes[byte++] = (a << 2) | (b >> 4);
    if (c !== undefined && byte < length)
      bytes[byte++] = ((b & 15) << 4) | (c >> 2);
    if (d !== undefined && byte < length) bytes[byte++] = ((c & 3) << 6) | d;
  }

  return bytes;
};

/**
 * UTF-8, also by hand and for the same reason.
 *
 * `TextEncoder` exists on both platforms today, but the key derivation salts
 * with these bytes: if one client ever encodes a non-ASCII secret differently
 * from the other, the two derive different keys and every message between them
 * is unreadable, with nothing in either log to say why.
 */
export const utf8Bytes = (text: string): Uint8Array => {
  const out: number[] = [];

  for (let index = 0; index < text.length; index += 1) {
    let code = text.charCodeAt(index);

    if (code >= 0xd800 && code <= 0xdbff && index + 1 < text.length) {
      const next = text.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        code = ((code - 0xd800) << 10) + (next - 0xdc00) + 0x10000;
        index += 1;
      }
    }

    if (code < 0x80) {
      out.push(code);
    } else if (code < 0x800) {
      out.push(0xc0 | (code >> 6), 0x80 | (code & 63));
    } else if (code < 0x10000) {
      out.push(
        0xe0 | (code >> 12),
        0x80 | ((code >> 6) & 63),
        0x80 | (code & 63),
      );
    } else {
      out.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 63),
        0x80 | ((code >> 6) & 63),
        0x80 | (code & 63),
      );
    }
  }

  return new Uint8Array(out);
};

export const utf8Text = (bytes: Uint8Array): string => {
  let out = "";

  for (let index = 0; index < bytes.length; ) {
    const byte = bytes[index];
    let code: number;

    if (byte < 0x80) {
      code = byte;
      index += 1;
    } else if (byte < 0xe0) {
      code = ((byte & 31) << 6) | (bytes[index + 1] & 63);
      index += 2;
    } else if (byte < 0xf0) {
      code =
        ((byte & 15) << 12) |
        ((bytes[index + 1] & 63) << 6) |
        (bytes[index + 2] & 63);
      index += 3;
    } else {
      code =
        ((byte & 7) << 18) |
        ((bytes[index + 1] & 63) << 12) |
        ((bytes[index + 2] & 63) << 6) |
        (bytes[index + 3] & 63);
      index += 4;
    }

    out += String.fromCodePoint(code);
  }

  return out;
};
