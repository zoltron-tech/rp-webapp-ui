// Browser-preview stub for next/headers.
const emptyCookieStore = {
  get: (_name?: string) => undefined,
  getAll: () => [] as unknown[],
  has: (_name?: string) => false,
  set: () => emptyCookieStore,
  delete: () => emptyCookieStore,
};

export const cookies = () => emptyCookieStore;
export const headers = () => new Map<string, string>();
export const draftMode = () => ({ isEnabled: false, enable: () => {}, disable: () => {} });
