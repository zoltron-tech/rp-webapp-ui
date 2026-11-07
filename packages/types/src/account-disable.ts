/**
 * Disabling an account, and the stand-ins left behind
 * (ACCOUNT_DISABLE_PLAN.md at the repo root).
 *
 * A disabled novelist, their muses and their posts are hidden everywhere.
 * What they wrote in other people's spaces (comments, replies, chat, story
 * passages) stays, under a placeholder: the server keeps the real id, sets
 * `isPlaceholder` and scrubs the name, image and handle. Both clients draw
 * placeholders the same way: these labels, the default avatar, no link.
 */

/** The names a placeholder shows. Keep in step with `Placeholders.kt`. */
export const PLACEHOLDER_LABELS = {
  MUSE: "A Veiled Muse",
  NOVELIST: "A Quiet Novelist",
} as const;

/** Anything that names its author: prompt, activity and chat sources, members. */
export type MaybePlaceholder =
  | { isPlaceholder?: boolean | null }
  | null
  | undefined;

/** True for a disabled author's stand-in. Never route to one. */
export const isPlaceholderSource = (source: MaybePlaceholder): boolean =>
  source?.isPlaceholder === true;

/** The label for a placeholder of this source type ("MUSE" or "NOVELIST"). */
export const placeholderLabel = (
  sourceType: string | null | undefined,
): string =>
  sourceType === "MUSE" ? PLACEHOLDER_LABELS.MUSE : PLACEHOLDER_LABELS.NOVELIST;

/** Why someone disabled their account, when they chose to say. Mirrors `DisableReason.kt`. */
export type DisableReason =
  | "BREAK"
  | "BUSY"
  | "PRIVACY"
  | "NOT_FOR_ME"
  | "UPSET"
  | "OTHER";

/** The optional reason picker, in the order both clients show it. */
export const DISABLE_REASONS: ReadonlyArray<{
  value: DisableReason;
  label: string;
}> = [
  { label: "Taking a break", value: "BREAK" },
  { label: "Too much on my plate right now", value: "BUSY" },
  { label: "I need more privacy", value: "PRIVACY" },
  { label: "It isn't the right place for me", value: "NOT_FOR_ME" },
  { label: "Something here upset me", value: "UPSET" },
  { label: "Other", value: "OTHER" },
];

/** The free-text limit for "Other"; the server trims to the same. */
export const DISABLE_REASON_TEXT_MAX = 280;

export interface DisableAccountPayload {
  reason?: DisableReason | null;
  reasonText?: string | null;
}

/**
 * The copy both clients use, warm by decision (plan §9). One place, so the
 * web dialog and the mobile tray never drift apart.
 */
export const DISABLE_ACCOUNT_COPY = {
  action: "Disable my account",
  bullets: [
    "Your profile, your muses and your posts are hidden from everyone.",
    "Your comments and replies stay in other people's threads, under a quiet placeholder instead of your name.",
    "Your friends, stories, points and badges are kept exactly as they are.",
    "Signing back in, any time, brings everything back at once.",
  ],
  cancel: "Keep my account",
  chatUnavailable: "This novelist isn't available right now.",
  confirm: "Disable account",
  dialogLead: "Take all the time you need. While your account is disabled:",
  dialogTitle: "Disable your account?",
  groupBody:
    "You can step away without losing anything. Disabling hides you and your writing until you sign back in. Nothing is deleted.",
  groupTitle: "Taking a break?",
  reasonOtherPlaceholder: "Tell us a little more",
  reasonPrompt: "Mind telling us why? (optional)",
  toastAfterDisable:
    "See you when you're ready. Signing back in reopens your account.",
  toastOnReturn: "Welcome back. Your account is live again.",
} as const;
