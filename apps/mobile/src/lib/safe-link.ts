import { Alert, Linking } from "react-native";
import { env } from "@/lib/env";

/**
 * Opening a link somebody else wrote.
 *
 * Rich text, chat attachments and profile songs all carry URLs chosen by
 * another user, and `Linking.openURL` opens anything the OS has a handler for:
 * `tel:`, `sms:`, another app's scheme, or this app's own `novelistworld://`
 * routes. So those links come through here instead — web and mail schemes
 * only, and a confirmation naming the host before leaving for a site that is
 * not ours.
 *
 * Parsed with regular expressions rather than `URL`: React Native's `URL`
 * does not implement `protocol` or `hostname` (the getters throw).
 */

const SCHEME = /^([a-z][a-z0-9+.-]*):/i;

/**
 * The host of an http(s) URL, past any `user:pass@` prefix.
 *
 * Backslashes are refused in both the credentials and the host, so
 * `https://evil.example\@novelist.world` does not parse as ours — browsers
 * disagree about what that URL means, and a link we cannot read with
 * confidence is not one to open.
 */
const HTTP_HOST =
  /^https?:\/\/(?:[^@/?#\\]*@)?([^/:?#\\]+)(?::\d+)?(?:[/?#]|$)/i;

const VALID_HOST = /^[a-z0-9.-]+$/;

const OWN_DOMAIN = "novelist.world";

/** Lowercased host of an http(s) URL, or null for anything else. */
export const urlHost = (url: string): string | null => {
  const host = HTTP_HOST.exec(url.trim())?.[1]?.toLowerCase();
  return host && VALID_HOST.test(host) ? host : null;
};

const configuredHost = (url: string) => (url ? urlHost(url) : null);

const isTrustedHost = (host: string): boolean => {
  if (host === OWN_DOMAIN || host.endsWith(`.${OWN_DOMAIN}`)) return true;
  if (host === configuredHost(env.WEB_URL)) return true;
  if (host === configuredHost(env.RP_SERVICE_URL)) return true;
  // Uploaded files, at the bucket's virtual-hosted S3 address.
  const bucket = env.RP_BUCKET_NAME;
  return (
    Boolean(bucket) &&
    host.startsWith(`${bucket}.s3.`) &&
    host.endsWith(".amazonaws.com")
  );
};

/** True when `url` is https and on exactly one of `hosts`. */
export const isHttpsUrlOn = (
  url: string | null | undefined,
  hosts: readonly string[],
): url is string => {
  if (!url || !/^https:\/\//i.test(url.trim())) return false;
  const host = urlHost(url);
  return host !== null && hosts.includes(host);
};

const open = (url: string) => {
  Linking.openURL(url).catch(() => {});
};

export const openExternalLink = (raw: string | null | undefined): void => {
  const url = raw?.trim();
  if (!url) return;

  // A site-relative link, from rich text written on the web app.
  if (url.startsWith("/") && !url.startsWith("//")) {
    open(`${env.WEB_URL}${url}`);
    return;
  }

  const scheme = SCHEME.exec(url)?.[1]?.toLowerCase();
  if (scheme === "mailto") {
    open(url);
    return;
  }
  if (scheme !== "http" && scheme !== "https") return;

  const host = urlHost(url);
  if (!host) return;

  if (isTrustedHost(host)) {
    open(url);
    return;
  }

  Alert.alert(
    "Open this link?",
    `This leaves Novelist World and opens ${host} in your browser.`,
    [
      { style: "cancel", text: "Cancel" },
      { onPress: () => open(url), text: "Open" },
    ],
  );
};
