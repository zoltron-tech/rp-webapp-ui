/**
 * Main-verse muses only.
 *
 * Alternative verses (rows with an `originalVerseId`) are hidden from character
 * lists but stay available elsewhere — picking muses for a muse connection, for
 * instance. Shared rather than app-local because both clients render a
 * character list, and a phone that showed every verse would show the same
 * character three times.
 */
export const mainVerseMuses = <T extends { originalVerseId?: string | null }>(
  muses: T[] | null | undefined,
): T[] => (muses ?? []).filter((muse) => !muse.originalVerseId);
