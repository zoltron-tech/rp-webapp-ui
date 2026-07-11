import { useEffect } from "react";
import { useCustomEvents } from "@/hooks";
import type { Muse, Novelist, PromptSource } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { useEventThreadInputState } from "./event-thread-input.store";

export enum EventThreadEvent {
  Sent = "sent",
  Error = "error",
}

export const museToSource = (muse: Muse): PromptSource => ({
  accent: muse.accent,
  avatar: muse.avatar,
  image: muse.image || "",
  name: `${muse.firstName} ${muse.lastName}`.trim(),
  sourceId: muse.id || "",
  sourceType: "MUSE",
  urlProp: muse.id || "",
  useAccent: muse.useAccent,
});

export const novelistToSource = (novelist: Novelist): PromptSource => ({
  accent: String(novelist.palette),
  avatar: novelist.avatar,
  image: novelist.image || "",
  name: `${novelist.firstName} ${novelist.lastName}`.trim(),
  sourceId: novelist.id || "",
  sourceType: "NOVELIST",
  urlProp: novelist.username || "",
  useAccent: true,
});

export const apiMessageToInfoMessage = (
  message: API_MESSAGE | null,
): string => {
  switch (message) {
    case API_MESSAGE.Success:
      return "Operation completed successfully.";
    case API_MESSAGE.Error:
      return "An error occurred. Please try again.";
    case API_MESSAGE.NotAllowed:
      return "Cross-posting between novelists and characters is not permitted.";
    case API_MESSAGE.BadPayload:
      return "Invalid input provided. Please check your data.";
    case API_MESSAGE.AccessDenied:
      return "You do not have permission to perform this action.";
    default:
      return "An unexpected error occurred.";
  }
};

export const useEventThreadInputEvents = () =>
  useCustomEvents(
    "event-thread-input",
    useEventThreadInputState("storyBoardEventId"),
  );

export const useRunOn = (events: EventThreadEvent[], callback: () => void) => {
  const { on, off } = useEventThreadInputEvents();

  useEffect(() => {
    events.forEach((event) => on(event, callback));
    return () => {
      events.forEach((event) => off(event, callback));
    };
  }, [on, off, events, callback]);
};
