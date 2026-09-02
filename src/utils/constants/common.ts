import { env } from "@/lib/env";
export const SUPPORT_EMAIL = env.SUPPORT_EMAIL || "";
export const SUPPORT_EMAIL_URL = `mailto:${SUPPORT_EMAIL}`;

/** Width ÷ height for Storyboard and Storyboard Event cover avatars (6:9
 *  portrait) — single source of truth so the crop dialog, the upload-field
 *  preview, and every place a cover renders always agree on the same ratio. */
export const STORY_COVER_ASPECT_RATIO = 6 / 9;

/** Upper zoom bound for Storyboard/Storyboard Event cover crops. A widescreen
 *  image needs a much bigger scale than a portrait one to fully cover the 6:9
 *  frame (no top/bottom gap) under the "width% auto" background-size model,
 *  so this must be well above 3x. Keep in sync with the `<= *_ZOOM_MAX * 100`
 *  guard in CoverImage that tells a valid crop from a missing/legacy one. */
export const STORY_COVER_ZOOM_MAX = 8;
