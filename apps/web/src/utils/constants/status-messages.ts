// The API's message vocabulary is a wire contract, not an app constant — it
// moved to @nw/types so every client shares one definition. Re-exported here so
// the ~100 existing `@/utils/constants` import sites keep resolving.
export { API_MESSAGE } from "@nw/types";
