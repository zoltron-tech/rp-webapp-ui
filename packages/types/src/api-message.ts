export enum API_MESSAGE {
  Success = "success",
  Error = "error",
  NotFound = "not_found",
  NotAllowed = "not_allowed",
  UncategorizedError = "uncatogorized_error",
  FileTooLarge = "file_size_too_large",
  Unauthorized = "unauthorized",
  AccessDenied = "access_denied",
  MediaError = "media_error",
  /** The upload NSFW check refused the file (portfolio-service answers 422). */
  MediaRejected = "media_rejected",
  BadPayload = "bad_payload",
  ServerError = "server_error",
  Conflict = "conflict",
  TooManyRequests = "too_many_requests",
  /** The other side of a direct conversation disabled their account (409 `unavailable`). */
  Unavailable = "unavailable",
  /**
   * A direct conversation with someone blocked either way (409 `blocked`,
   * BLOCK_BLACKLIST_PLAN.md K3): nothing can be sent into it.
   */
  Blocked = "blocked",
  /**
   * A prompt, comment or reply carrying more media than the limit (422
   * `too_many_media`, owner decision 2026-11-08: five per input).
   */
  TooManyMedia = "too_many_media",
}
