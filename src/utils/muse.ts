/**
 * Main-verse muses only. Alternative verses (rows with an originalVerseId)
 * are hidden from character-list renderings but stay available elsewhere,
 * e.g. when picking muses for a muse connection.
 */
export const mainVerseMuses = <T extends { originalVerseId?: string | null }>(
  muses: T[] | null | undefined,
): T[] => (muses ?? []).filter((m) => !m.originalVerseId);
