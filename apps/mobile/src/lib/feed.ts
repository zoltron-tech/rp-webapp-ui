/**
 * The small pieces every paged feed on this client shares.
 */

/**
 * Drop anything already seen while flattening pages.
 *
 * Web's `appendUnique`, and it is needed for the same reason: these endpoints
 * page by offset, so a post made while somebody is reading shifts every row
 * down by one and the next page repeats the one that straddled the boundary.
 * On web that is a duplicate React key; here it is a duplicate `keyExtractor`,
 * which a recycling list reports rather than merely warning about.
 */
export const dedupeById = <T extends { id: string }>(
  pages: readonly (readonly T[])[],
): T[] => {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const page of pages) {
    for (const item of page) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      out.push(item);
    }
  }
  return out;
};

/**
 * Round-robin, one from each list in turn until every list is spent.
 *
 * Web's `interleaveFeed`, and chosen for the reasons it gives: deterministic
 * and trivially debuggable; no need to normalise an activity's numeric date
 * against a prompt's string one; and a mix from the first row even when one
 * source has many more items than the others.
 */
export const interleave = <T>(...lists: readonly (readonly T[])[]): T[] => {
  const out: T[] = [];
  const longest = Math.max(0, ...lists.map((list) => list.length));
  for (let i = 0; i < longest; i += 1) {
    for (const list of lists) {
      const item = list[i];
      if (item !== undefined) out.push(item);
    }
  }
  return out;
};
