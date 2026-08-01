/** Identifies one item in a chapter's content flow. */
export type FlowKey = "overture" | "composer" | `thread:${string}`;

export const threadKey = (threadId: string): FlowKey => `thread:${threadId}`;

/** The slice of a flow item that lands on a given page. */
export interface PageItem {
  key: FlowKey;
  /** Global thread index, for items that are passages. */
  threadIndex?: number;
  /** Top of the visible slice, measured from the item's own top. */
  fromY: number;
  /** Bottom of the visible slice, measured from the item's own top. */
  toY: number;
  /** The item starts on this page (rather than continuing onto it). */
  starts: boolean;
  /** The item ends on this page. */
  ends: boolean;
}

export interface Page {
  index: number;
  /** Where this page's window starts in the measured flow. */
  top: number;
  /** How much of the flow this page shows. Equals the page content height for
   *  every page but the last, which is only as tall as the content left. */
  height: number;
  items: PageItem[];
}

export interface PageMap {
  pages: Page[];
  /** Full height of the measured flow. */
  totalHeight: number;
  /** Page content height used for the cuts. */
  pageHeight: number;
  /** Unused space at the foot of the final page — where a composer picks up. */
  tailSpace: number;
}

export const EMPTY_PAGE_MAP: PageMap = {
  pageHeight: 0,
  pages: [],
  tailSpace: 0,
  totalHeight: 0,
};
