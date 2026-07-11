import type { DialogEmbedData } from "../dialog-embed";

/** Selectable read-only presentations for embedded dialogs. */
export type DialogDesign =
  | "card"
  | "card-colored"
  | "bubble"
  | "bubble-colored"
  | "quote"
  | "quote-plain";

export const DEFAULT_DIALOG_DESIGN: DialogDesign = "card";

/**
 * Rebuilds a single `.dialog-embed`'s read-only DOM for a given design, from
 * its style-agnostic data model. Each design lives in its own folder with a
 * matching `*.styles.ts`.
 */
export type DialogDesignRenderer = (
  embed: HTMLElement,
  data: DialogEmbedData,
) => void;

/** Dropdown option describing a design. */
export type DialogDesignOption = {
  value: DialogDesign;
  label: string;
  description: string;
};

/** Server-resolved sender info for a muse referenced by a dialog. */
export type MuseDialogAttr = {
  name: string;
  accent: string | null;
};

/** Map of muse id → resolved sender info, provided per thread by the backend. */
export type MuseDialogAttrs = Record<string, MuseDialogAttr>;
