// Shared types for the chat message key API.
// Mirrors E2EConversationSecret.kt in portfolio-service.

/** The server half of a conversation's message key (32 random bytes, base64).
 *  Combined with the UI's build-time CHAT_E2E_SECRET to derive the AES key. */
export type E2EConversationSecret = {
  secret: string;
};
