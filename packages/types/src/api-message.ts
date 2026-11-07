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
}
