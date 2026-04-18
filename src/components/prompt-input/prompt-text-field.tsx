import { type FC, useCallback, useEffect, useMemo, useRef } from "react";
import { searchMentionMusesAction } from "@/app/rp/muse/actions";
import { useGlobalState } from "@/context/store/stores";
import type { MentionDataItem, MentionTab } from "@/types";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "../rich-text-editor-input";
import { PromptEvent, useRunOn } from "./helpers";
import {
  usePromptInputState,
  usePromptInputStoreSet,
} from "./prompt-input.store";
import * as S from "./styles";

interface PromptTextFieldProps {
  onClear?: () => void;
  fullPage?: boolean;
}

export const PromptTextField: FC<PromptTextFieldProps> = ({
  onClear,
  fullPage,
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<RichTextEditorHandle>(null);
  const novelist = useGlobalState("novelist");
  const setPromptInputState = usePromptInputStoreSet();
  const gifToInsert = usePromptInputState("gifToInsert");

  useEffect(() => {
    if (gifToInsert && editorRef.current) {
      editorRef.current.insertGif(gifToInsert);
      setPromptInputState({ gifToInsert: null });
    }
  }, [gifToInsert, setPromptInputState]);

  const handlePromptTextChange = useCallback(
    (value: string) => {
      setPromptInputState({ promptText: value });
    },
    [setPromptInputState],
  );

  const handleClear = useCallback(() => {
    console.log("Clearing form");
    setPromptInputState({ promptText: "" });
    if (textAreaRef.current) {
      console.log("resetting current");
      textAreaRef.current.value = "";
    }
    onClear?.();
  }, [setPromptInputState, onClear]);

  useRunOn([PromptEvent.Sent], handleClear);

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
    <S.TextInputContainer name="promptText" $fullPage={fullPage}>
      {/* <textarea ref={textAreaRef} className="text-area" spellCheck required /> */}
      <RichTextEditor
        ref={editorRef}
        placeholder="Type your story here... @ to mention other novelists or muses"
        value={""}
        mentionTabs={MENTION_TABS}
        onChange={handlePromptTextChange}
        onClear={handleClear}
        fullPage={fullPage}
      />
    </S.TextInputContainer>
  );
};
