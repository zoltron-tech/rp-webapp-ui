/**
 * Read-time pagination.
 *
 * There are no page formats here any more. A page is whatever the reader's
 * screen gives the book, and `paginate` decides where it ends by measuring the
 * flow that is actually on that screen — so a break never lands inside an
 * image or a dialog, and nothing is clipped out of sight.
 */
export { FLOW_ITEM_ATTR, paginate } from "./measure";
export {
  EMPTY_PAGE_MAP,
  type FlowKey,
  type Page,
  type PageItem,
  type PageMap,
  threadKey,
} from "./types";
