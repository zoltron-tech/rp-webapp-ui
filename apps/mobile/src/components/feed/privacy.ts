import type { Ionicons } from "@expo/vector-icons";
import type { PrivacyLevel } from "@nw/types";
import type { ComponentProps } from "react";

/** Web's `PRIVACY_LABEL` and `PRIVACY_OPTIONS`, in the order web lists them. */
export const PRIVACY_LABEL: Record<PrivacyLevel, string> = {
  CUSTOM: "Custom",
  FRIENDS: "Friends",
  ONLY_ME: "Only me",
  PUBLIC: "Public",
};

export const PRIVACY_OPTIONS: { hint: string; value: PrivacyLevel }[] = [
  { hint: "Anyone on Novelist World", value: "PUBLIC" },
  { hint: "Your friends only", value: "FRIENDS" },
  { hint: "Just you", value: "ONLY_ME" },
  { hint: "The friends you choose", value: "CUSTOM" },
];

/**
 * Web's `PrivacyIcon`, in the set this app has.
 *
 * Mapped by meaning rather than by artwork: react-icons' globe, two figures,
 * gear and padlock have Ionicons counterparts that read the same at 11pt,
 * which is the size that matters — a chip this small is recognised by
 * silhouette, not by detail.
 */
export const PRIVACY_ICON: Record<
  PrivacyLevel,
  ComponentProps<typeof Ionicons>["name"]
> = {
  CUSTOM: "options-outline",
  FRIENDS: "people-outline",
  ONLY_ME: "lock-closed-outline",
  PUBLIC: "earth-outline",
};
