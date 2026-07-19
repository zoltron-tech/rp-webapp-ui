// Browser-preview stub for next/config — server actions read API base URLs
// from runtime config; empty values make fetches fail soft in preview cards.
export default function getConfig() {
  return { publicRuntimeConfig: {}, serverRuntimeConfig: {} };
}
