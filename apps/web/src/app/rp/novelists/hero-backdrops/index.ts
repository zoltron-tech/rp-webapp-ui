import { AuroraFieldBackdrop } from "./backdrop-1";
import { WovenThreadsBackdrop } from "./backdrop-2";

/**
 * The hero's drawn backgrounds.
 *
 * Both replace the S3 wallpaper PNG the hero used to fetch: drawn rather than
 * downloaded, so they cost no request, never pop in late, scale to any
 * viewport, and follow the reader's accent instead of being locked to one
 * photograph's colour.
 *
 *   1. `AuroraFieldBackdrop`  — a still night field: accent aurora over faint
 *      ruled paper, a constellation of writers, threads drawn between them.
 *   2. `WovenThreadsBackdrop` — in motion: long story threads flowing across
 *      the hero and crossing one another, with the crossings lit.
 *
 * Both are kept so either can be used.
 */
export { AuroraFieldBackdrop, WovenThreadsBackdrop };

/**
 * The backdrop the hero renders.
 *
 * This is the switch: point it at either component above and the page picks it
 * up. Nothing else needs to know which one is active.
 */
export const HeroBackdrop = AuroraFieldBackdrop;
