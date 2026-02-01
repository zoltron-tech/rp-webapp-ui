import { Form } from "radix-ui";
import { type FC, useCallback, useMemo, useRef, useState } from "react";
import { searchMentionMusesAction } from "@/app/rp/muse/actions";
import { useGlobalState } from "@/context/store/stores";
import type { MentionDataItem, MentionTab } from "@/types";
import { RichTextEditor } from "../rich-text-editor-input";
import { PromptEvent, useRunOn } from "./helpers";
import { usePromptInputStoreSet } from "./prompt-input.store";
import * as S from "./styles";

export const PromptTextField: FC = () => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const novelist = useGlobalState("novelist");
  const setPromptInputState = usePromptInputStoreSet();

  const handlePromptTextChange = useCallback(
    (value: string) => {
      setPromptInputState({ promptText: value });
    },
    [setPromptInputState],
  );

  const handleClear = useCallback(() => {
    if (textAreaRef.current) {
      textAreaRef.current.value = "";
    }
  }, []);

  const fetchMentionableMuses = useCallback(
    async (prefix: string = ""): Promise<MentionDataItem[]> => {
      return await searchMentionMusesAction(prefix);
    },
    [],
  );

  const fetchMentionableFriends = useCallback(
    async (prefix: string = ""): Promise<MentionDataItem[]> => {
      const friends = novelist?.friends ?? [];

      return friends
        .filter((f) => f.username.toLowerCase().includes(prefix.toLowerCase()))
        .map((friend) => ({
          displayName: friend.username,
          id: friend.id,
          image: friend.image,
          type: "NOVELIST",
        }));
    },
    [novelist?.friends],
  );

  const MENTION_TABS: MentionTab[] = useMemo(
    () => [
      {
        getData: fetchMentionableFriends,
        iconKey: "avatar",
        id: "novelists",
        label: "Friends",
      },
      {
        getData: fetchMentionableMuses,
        iconKey: "icon",
        id: "muses",
        label: "Muses",
      },
    ],
    [fetchMentionableFriends, fetchMentionableMuses],
  );

  useRunOn([PromptEvent.Sent], handleClear);

  return (
    <S.TextInputContainer name="promptText">
      {/* <textarea ref={textAreaRef} className="text-area" spellCheck required /> */}
      <RichTextEditor
        placeholder="Share something about yourself"
        value={""}
        mentionTabs={MENTION_TABS}
        onChange={handlePromptTextChange}
      />
    </S.TextInputContainer>
  );
};
