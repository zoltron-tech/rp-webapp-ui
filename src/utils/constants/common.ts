export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "";
export const SUPPORT_EMAIL_URL = `mailto:${SUPPORT_EMAIL}`;

/** Width ÷ height for Storyboard and Storyboard Event cover avatars (6:9
 *  portrait) — single source of truth so the crop dialog, the upload-field
 *  preview, and every place a cover renders always agree on the same ratio. */
export const STORY_COVER_ASPECT_RATIO = 6 / 9;
