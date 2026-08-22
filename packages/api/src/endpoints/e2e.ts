import type {
  E2EConversationBundle,
  E2EEnvelope,
  E2EKeyBackup,
} from "@nw/types/e2e";
import type { ApiClient } from "../client";

/**
 * Key distribution for chat E2E encryption.
 *
 * Everything here carries public keys or wrapped conversation keys only —
 * plaintext keys and message content never pass through the server. These use
 * `raw` rather than `request` because the callers want a plain boolean or null,
 * not the `{ message }` error shape.
 */

const BASE = "/rp/portfolio/chat/e2e";

export const publishE2EPublicKey = async (
  api: ApiClient,
  publicKey: string,
): Promise<boolean> => {
  const response = await api.raw(`${BASE}/public-key`, {
    body: { publicKey },
    label: "publishE2EPublicKeyAction",
    method: "PUT",
  });
  return response.ok;
};

export const getE2EBundle = async (
  api: ApiClient,
  conversationId: string,
): Promise<E2EConversationBundle | null> => {
  const response = await api.raw(
    `${BASE}/conversation/${conversationId}/bundle`,
    { label: "getE2EBundleAction" },
  );
  if (!response.ok) return null;
  return (await response.json()) as E2EConversationBundle;
};

export const getE2EKeyBackup = async (
  api: ApiClient,
): Promise<E2EKeyBackup | null> => {
  const response = await api.raw(`${BASE}/key-backup`, {
    label: "getE2EKeyBackupAction",
  });
  if (!response.ok) return null;
  return (await response.json()) as E2EKeyBackup;
};

export const storeE2EKeyBackup = async (
  api: ApiClient,
  backup: E2EKeyBackup,
): Promise<boolean> => {
  const response = await api.raw(`${BASE}/key-backup`, {
    body: backup,
    label: "storeE2EKeyBackupAction",
    method: "PUT",
  });
  return response.ok;
};

/**
 * Uploads envelopes and returns the caller's authoritative envelope (the
 * server resolves creation races — always use the returned envelope).
 */
export const storeE2EEnvelopes = async (
  api: ApiClient,
  conversationId: string,
  envelopes: E2EEnvelope[],
): Promise<E2EEnvelope | null> => {
  const response = await api.raw(
    `${BASE}/conversation/${conversationId}/envelopes`,
    {
      body: envelopes,
      label: "storeE2EEnvelopesAction",
      method: "POST",
    },
  );
  if (!response.ok) return null;

  const text = await response.text();
  if (!text) return null;

  return JSON.parse(text) as E2EEnvelope;
};
