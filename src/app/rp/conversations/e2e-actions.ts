import {
  getE2EBundle,
  getE2EKeyBackup,
  publishE2EPublicKey,
  storeE2EEnvelopes,
  storeE2EKeyBackup,
} from "@nw/api/endpoints/e2e";
import type { E2EEnvelope, E2EKeyBackup } from "@nw/types/e2e";
import { api } from "@/lib/api";

export const publishE2EPublicKeyAction = (publicKey: string) =>
  publishE2EPublicKey(api, publicKey);

export const getE2EBundleAction = (conversationId: string) =>
  getE2EBundle(api, conversationId);

export const getE2EKeyBackupAction = () => getE2EKeyBackup(api);

export const storeE2EKeyBackupAction = (backup: E2EKeyBackup) =>
  storeE2EKeyBackup(api, backup);

export const storeE2EEnvelopesAction = (
  conversationId: string,
  envelopes: E2EEnvelope[],
) => storeE2EEnvelopes(api, conversationId, envelopes);
