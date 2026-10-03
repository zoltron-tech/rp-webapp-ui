import type { QueryClient, QueryKey } from "@tanstack/react-query";

/**
 * Something already on the phone about a page that is about to be asked for.
 *
 * A detail page is almost always opened from a list that has just drawn the
 * thing it opens: a prompt from a feed, a story from the library, a chapter
 * from its story. The list's copy is in the query cache already, and it is
 * usually the whole object, or near enough. Handing it to the detail query as
 * `placeholderData` draws the page on the first frame, while the page's own
 * request still runs and replaces it — the placeholder is never written to the
 * cache, so nothing that reads the cache mistakes it for the server's answer.
 *
 * Only the shapes react-query holds here are walked: an infinite query's pages,
 * a list, or a single object. Callers decide what counts as a match, and must
 * check the shape as well as the id — ids are unique per table, not across
 * them, and several caches share a prefix.
 */

type Entity = Record<string, unknown>;

const isObject = (value: unknown): value is Entity =>
  typeof value === "object" && value !== null;

/** The entities a cached value holds, one level down. */
const entitiesOf = (data: unknown): Entity[] => {
  if (Array.isArray(data)) return data.filter(isObject);
  if (!isObject(data)) return [];
  if (Array.isArray(data.pages)) return data.pages.flatMap(entitiesOf);
  return [data];
};

/**
 * The first thing `pick` returns for any entity cached under any of `prefixes`.
 *
 * Cheap enough to run in a `placeholderData` function: it walks what is in
 * memory, and only on the render that creates the query.
 */
export const findCached = <T>(
  queryClient: QueryClient,
  prefixes: QueryKey[],
  pick: (entity: Entity) => T | undefined,
): T | undefined => {
  for (const prefix of prefixes) {
    for (const [, data] of queryClient.getQueriesData({ queryKey: prefix })) {
      for (const entity of entitiesOf(data)) {
        const found = pick(entity);
        if (found !== undefined) return found;
      }
    }
  }
  return undefined;
};
