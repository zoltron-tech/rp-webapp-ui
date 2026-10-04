import { env } from "@/lib/env";

/**
 * The web app's pages this app links out to.
 *
 * Written out in three screens before, two of them with the domain typed in
 * and one reading it from the environment. `env.WEB_URL` already defaults to
 * the production site, so these are the same addresses, said once.
 */
export const WEB_URL = env.WEB_URL || "https://novelist.world";
export const TERMS_URL = `${WEB_URL}/rp/terms`;
export const PRIVACY_URL = `${WEB_URL}/rp/privacy-policy`;
