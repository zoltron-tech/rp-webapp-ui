"use server";

import getConfig from "next/config";
import { getJWTIfExists } from "@/app/actions";
import { AUTH_HEADER_NAME } from "@/utils/constants";
import type {
  E2EConversationBundle,
  E2EEnvelope,
  E2EKeyBackup,
} from "@/utils/e2e-types";
import { Logger } from "@/utils/services";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

// Key-distribution actions for chat E2E encryption. These only ever carry
// public keys and wrapped conversation keys — plaintext keys and message
// content never pass through the server.

const buildHeaders = async (): Promise<Record<string, string>> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }
  return headers;
};

export const publishE2EPublicKeyAction = async (
  publicKey: string,
): Promise<boolean> => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/chat/e2e/public-key`;

  const response = await fetch(URL, {
    body: JSON.stringify({ publicKey }),
    cache: "no-store",
    headers: await buildHeaders(),
    method: "PUT",
  });

  Logger.debug("publishE2EPublicKeyAction", response.status);

  return response.ok;
};

export const getE2EBundleAction = async (
  conversationId: string,
): Promise<E2EConversationBundle | null> => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/chat/e2e/conversation/${conversationId}/bundle`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: await buildHeaders(),
  });

  Logger.debug("getE2EBundleAction", response.status);

  if (!response.ok) {
    return null;
  }

  const bundle: E2EConversationBundle = await response.json();

  return bundle;
};

export const getE2EKeyBackupAction =
  async (): Promise<E2EKeyBackup | null> => {
    const URL = `${RP_SERVICE_URL}/rp/portfolio/chat/e2e/key-backup`;

    const response = await fetch(URL, {
      cache: "no-store",
      headers: await buildHeaders(),
    });

    Logger.debug("getE2EKeyBackupAction", response.status);

    if (!response.ok) {
      return null;
    }

    const backup: E2EKeyBackup = await response.json();

    return backup;
  };

export const storeE2EKeyBackupAction = async (
  backup: E2EKeyBackup,
): Promise<boolean> => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/chat/e2e/key-backup`;

  const response = await fetch(URL, {
    body: JSON.stringify(backup),
    cache: "no-store",
    headers: await buildHeaders(),
    method: "PUT",
  });

  Logger.debug("storeE2EKeyBackupAction", response.status);

  return response.ok;
};

/** Uploads envelopes and returns the caller's authoritative envelope (the
 *  server resolves creation races — always use the returned envelope). */
export const storeE2EEnvelopesAction = async (
  conversationId: string,
  envelopes: E2EEnvelope[],
): Promise<E2EEnvelope | null> => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/chat/e2e/conversation/${conversationId}/envelopes`;

  const response = await fetch(URL, {
    body: JSON.stringify(envelopes),
    cache: "no-store",
    headers: await buildHeaders(),
    method: "POST",
  });

  Logger.debug("storeE2EEnvelopesAction", response.status);

  if (!response.ok) {
    return null;
  }

  const text = await response.text();
  if (!text) return null;

  const envelope: E2EEnvelope = JSON.parse(text);

  return envelope;
};
