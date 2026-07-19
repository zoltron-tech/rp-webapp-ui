// Browser-preview stub for jsonwebtoken — only decode() is used client-side
// (validateJWTSync). Pure base64 parse, no crypto.
const b64 = (s: string) => {
  try {
    return JSON.parse(atob(s.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
};

export const decode = (token: string, opts?: { complete?: boolean }) => {
  if (typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  const header = b64(parts[0]);
  const payload = b64(parts[1]);
  if (!payload) return null;
  return opts?.complete ? { header, payload, signature: parts[2] ?? "" } : payload;
};

export const sign = () => {
  throw new Error("jsonwebtoken.sign is unavailable in preview");
};
export const verify = () => {
  throw new Error("jsonwebtoken.verify is unavailable in preview");
};

export default { decode, sign, verify };
