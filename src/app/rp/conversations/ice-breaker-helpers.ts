import type { PromptSource } from "@/types";
import { ACCENT_MAP, type Accent } from "@/types/theme";

export const ICE_BREAKER_PREVIEW_LENGTH = 20;
export const ICE_BREAKER_SOURCE_NAME_LENGTH = 16;

export const truncateIceBreakerMessage = (message: string) =>
  message.length > ICE_BREAKER_PREVIEW_LENGTH
    ? `${message.slice(0, ICE_BREAKER_PREVIEW_LENGTH)}...`
    : message;

export const truncateIceBreakerSourceName = (name: string) =>
  name.length > ICE_BREAKER_SOURCE_NAME_LENGTH
    ? `${name.slice(0, ICE_BREAKER_SOURCE_NAME_LENGTH)}...`
    : name;

/** Resolves a source's accent into a ring color, mirroring MuseAvatar/
 *  NovelistAvatar: muses carry a literal hex color, while novelists carry a
 *  palette index that must be applied as a CSS class so `var(--accent)`
 *  resolves to their chosen palette. */
export const getSourceRingAccent = (
  source: PromptSource,
): { className: string | null; color: string | null } => {
  if (!source.useAccent || source.accent == null) {
    return { className: null, color: null };
  }

  if (source.sourceType === "MUSE") {
    return { className: null, color: source.accent };
  }

  const paletteClass = ACCENT_MAP[Number(source.accent) as Accent] ?? null;
  return {
    className: paletteClass,
    color: paletteClass ? "var(--accent)" : null,
  };
};

/** The ice-breaker endpoint serializes `createdOn` as a raw epoch-seconds
 *  float (e.g. "1782895379.212409000") rather than an ISO string like the
 *  rest of the API, so it needs its own parsing before being handed to the
 *  usual date-formatting helpers (which expect milliseconds or ISO). */
export const parseIceBreakerTimestamp = (value: string): number => {
  const seconds = Number.parseFloat(value);
  return Number.isFinite(seconds) ? seconds * 1000 : Date.now();
};
