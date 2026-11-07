import { getMuse } from "@nw/api/endpoints/muse";
import { getPrompt } from "@nw/api/endpoints/prompt";
import { getStoryboard } from "@nw/api/endpoints/story";
import { useApi } from "@nw/features";
import type { Muse, Prompt, StoryBoard } from "@nw/types";
import type { Activity } from "@nw/types/activity";
import { type ReactNode, useCallback, useState } from "react";
import { Alert } from "react-native";
import { ShareSheet as SharePromptSheet } from "@/components/feed/share-sheet";
import { ShareMuseSheet } from "@/components/share/share-muse-sheet";
import { ShareStorySheet } from "@/components/share/share-story-sheet";

const PROMPT_TYPES = ["PROMPT", "COMMENT", "REPLY"];
const STORY_TYPES = ["STORY_BOARD", "STORY_BOARD_EVENT"];

/** Web's `canShare`: the kinds of activity with a share dialog of their own. */
export const canShareActivity = (activity: Activity) => {
  const type = activity.target?.activityTargetType ?? "";
  return (
    PROMPT_TYPES.includes(type) || STORY_TYPES.includes(type) || type === "MUSE"
  );
};

/**
 * Sharing from an activity card. The sheets need the whole target — Discord
 * embed data, tags, fandom — which the feed does not carry, so it is fetched on
 * the tap, as web does. One set of sheets per screen, not per cell.
 */
export const useActivityShare = () => {
  const api = useApi();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [muse, setMuse] = useState<Muse | null>(null);
  const [story, setStory] = useState<StoryBoard | null>(null);

  const share = useCallback(
    async (activity: Activity) => {
      const id = activity.target?.id;
      if (!id) return;
      const type = activity.target?.activityTargetType ?? "";
      const failed = () =>
        Alert.alert("Could not share", "This could not be loaded. Try again.");

      if (PROMPT_TYPES.includes(type)) {
        const result = await getPrompt(api, id).catch(() => null);
        if (!result || "message" in result) return failed();
        setPrompt(result);
      } else if (type === "MUSE") {
        const result = await getMuse(api, id).catch(() => null);
        if (!result || "message" in result) return failed();
        setMuse(result);
      } else if (STORY_TYPES.includes(type)) {
        const result = await getStoryboard(api, id).catch(() => null);
        if (!result || "message" in result) return failed();
        setStory(result);
      }
    },
    [api],
  );

  const sheets: ReactNode = (
    <>
      <SharePromptSheet onClose={() => setPrompt(null)} prompt={prompt} />
      {muse ? (
        <ShareMuseSheet muse={muse} onClose={() => setMuse(null)} visible />
      ) : null}
      {story ? (
        <ShareStorySheet onClose={() => setStory(null)} story={story} visible />
      ) : null}
    </>
  );

  return { share, sheets };
};
