import { useEffect } from "react";
import { useCustomEvents } from "@/hooks";
import type {
  Muse,
  Novelist,
  Prompt,
  PromptSource,
  SubmitPromptInput,
  SubmitPromptType,
} from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { usePromptInputState } from "./prompt-input.store";

export enum PromptEvent {
  Sent = "sent",
  Error = "error",
  MediaDeleted = "media-deleted",
}

/**
 * Builds a client-side prompt from a just-submitted payload so a freshly posted
 * prompt can be prepended to a feed immediately, without waiting for a refetch.
 * The create endpoint only returns a status message (no persisted row), so the
 * id/createdOn are synthesised locally and reconciled on the next feed fetch.
 */
export const buildOptimisticPrompt = (
  source: PromptSource,
  payload: SubmitPromptInput,
): Prompt => ({
  canInteract: true,
  commentCount: 0,
  createdOn: new Date().toISOString(),
  featuredSong: payload.featuredSong ?? null,
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `optimistic-${Date.now()}`,
  media: payload.media && payload.media !== "null" ? payload.media : "",
  privacy: payload.privacy ?? "PUBLIC",
  reacted: false,
  reactions: 0,
  sharedWith: payload.sharedWith ?? [],
  song: "",
  source,
  text: payload.text,
});

export const museToSource = (muse: Muse): PromptSource => ({
  image: muse.image || "",
  name: `${muse.firstName} ${muse.lastName}`.trim(),
  sourceId: muse.id || "",
  sourceType: "MUSE",
  urlProp: muse.id || "",
});

export const novelistToSource = (novelist: Novelist): PromptSource => ({
  image: novelist.image || "",
  name: `${novelist.firstName} ${novelist.lastName}`.trim(),
  sourceId: novelist.id || "",
  sourceType: "NOVELIST",
  urlProp: novelist.username || "",
});

const videoExtensions = ["mp4"];
const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
const audioExtensions = ["mp3", "mpeg", "wav"];

export const getMediaTypeFromUrl = (url: string) => {
  const extension = url.split(".").pop() || "";
  if (videoExtensions.includes(extension)) return "video";
  if (imageExtensions.includes(extension)) return "image";
  if (audioExtensions.includes(extension)) return "audio";
  return "image";
};

type PromptIdKey = "promptId" | "commentId";

export const getParentIdKeyFromPromptType = (
  type: Exclude<SubmitPromptType, "prompt">,
): PromptIdKey => {
  switch (type) {
    case "comment":
      return "promptId";
    default:
      return "commentId";
  }
};

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

export const typeToTriggerButtonText = (type: SubmitPromptType): string => {
  switch (type) {
    case "comment":
      return "Start a new thread";
    case "reply":
      return "Reply";
    default:
      return "Create a new prompt";
  }
};

export const usePromptInputEvents = () =>
  useCustomEvents("prompt-input", usePromptInputState("parentId"));

export const useRunOn = (events: PromptEvent[], callback: () => void) => {
  const { on, off } = usePromptInputEvents();

  useEffect(() => {
    events.forEach((event) => on(event, callback));
    return () => {
      events.forEach((event) => off(event, callback));
    };
  }, [on, off, events, callback]);
};
