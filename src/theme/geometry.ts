export const BORDER_RADIUS = "5px";

export enum Z_INDEX {
  /** User-menu overlay/dialogs — above everything else */
  USER_MENU = 200,
  /** Modal dialogs: GIF picker, select-muse, reporter, edit dialogs */
  MODAL = 100,
  MODAL_CONTENT = MODAL - 1,
  /** Full-page prompt-input overlay — below dialogs, above scroll button */
  PROMPT_OVERLAY = 50,
  /** Scroll-to-top / scroll-to-bottom floating button */
  SCROLL_JUMP = 40,
  TOPBAR = 10,
  CARD = 5,
  CARD_EXPAND = CARD + 1,
  AVATAR = 2,
  DEFAULT = 1,
  BACKGROUND = -1,
}
