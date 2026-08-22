// Shared types for the chat E2E key-distribution API.
// Mirrors E2EModels.kt in portfolio-service.

export type E2EMemberKey = {
  novelistId: string;
  publicKey: string;
};

/** A conversation key wrapped for one member — opaque to the server. */
export type E2EEnvelope = {
  novelistId: string;
  wrappedKey: string;
  wrapperPublicKey: string;
  recipientPublicKey: string;
};

export type E2EEnvelopeInfo = {
  novelistId: string;
  recipientPublicKey: string;
};

export type E2EConversationBundle = {
  memberPublicKeys: E2EMemberKey[];
  envelopes: E2EEnvelopeInfo[];
  myEnvelope: E2EEnvelope | null;
};

/** The user's identity private key, encrypted client-side with a
 *  password-derived key — the server can store but never open it. */
export type E2EKeyBackup = {
  wrappedPrivateKey: string;
  salt: string;
  kdfIterations: number;
};
