import {
  type FC,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { searchMentionMusesAction } from "@/app/rp/muse/actions";
import { deleteMedia } from "@/app/rp/profile/actions";
import { useGlobalState } from "@/context/store/stores";
import type { MentionDataItem, MentionTab } from "@/types";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "../rich-text-editor-input";
import {
  useEventThreadInputState,
  useEventThreadInputStoreSet,
} from "./event-thread-input.store";
import { EventThreadEvent, useRunOn } from "./helpers";
import * as S from "./styles";

type Props = {
  editorRef: RefObject<RichTextEditorHandle | null>;
  /** Initial rich text HTML (used when editing an existing thread). */
  initialValue?: string;
};

export const EventThreadTextField: FC<Props> = ({
  editorRef,
  initialValue,
}) => {
  const novelist = useGlobalState("novelist");
  const setPromptInputState = useEventThreadInputStoreSet();

  const promptText = useEventThreadInputState("promptText");
  const gifToInsert = useEventThreadInputState("gifToInsert");
  const uploadingImage = useEventThreadInputState("uploadingImage");
  const uploadedImage = useEventThreadInputState("uploadedImage");
  const uploadFailedImage = useEventThreadInputState("uploadFailedImage");

  // Final storage URLs of images inserted via upload, so we can delete them
  // from storage if they are removed before the thread is submitted.
  const trackedUrlsRef = useRef<string[]>([]);

  // Embed a picked GIF inline in the editor.
  useEffect(() => {
    if (gifToInsert && editorRef.current) {
      editorRef.current.insertGif(gifToInsert);
      setPromptInputState({ gifToInsert: null });
    }
  }, [gifToInsert, editorRef, setPromptInputState]);

  // Insert a local placeholder while an uploaded image is in flight.
  useEffect(() => {
    if (uploadingImage && editorRef.current) {
      editorRef.current.insertUploadingImage(uploadingImage.objectUrl);
      setPromptInputState({ uploadingImage: null });
    }
  }, [uploadingImage, editorRef, setPromptInputState]);

  // Swap the placeholder for the final storage URL once uploaded.
  useEffect(() => {
    if (uploadedImage && editorRef.current) {
      editorRef.current.replaceImageSrc(
        uploadedImage.objectUrl,
        uploadedImage.finalUrl,
      );
      URL.revokeObjectURL(uploadedImage.objectUrl);
      trackedUrlsRef.current = [
        ...trackedUrlsRef.current,
        uploadedImage.finalUrl,
      ];
      setPromptInputState({ uploadedImage: null });
    }
  }, [uploadedImage, editorRef, setPromptInputState]);

  // Remove the placeholder if its upload failed.
  useEffect(() => {
    if (uploadFailedImage && editorRef.current) {
      editorRef.current.removeImageBySrc(uploadFailedImage.objectUrl);
      URL.revokeObjectURL(uploadFailedImage.objectUrl);
      setPromptInputState({ uploadFailedImage: null });
    }
  }, [uploadFailedImage, editorRef, setPromptInputState]);

  // If a tracked image is removed from the editor (e.g. backspace), delete it
  // from storage immediately.
  useEffect(() => {
    if (!promptText || trackedUrlsRef.current.length === 0) return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(promptText, "text/html");
    const currentUrls = new Set(
      [...doc.querySelectorAll("img.inline-image")].map(
        (img) => img.getAttribute("src") ?? "",
      ),
    );
    const remaining: string[] = [];
    for (const url of trackedUrlsRef.current) {
      if (currentUrls.has(url)) remaining.push(url);
      else deleteMedia(url);
    }
    trackedUrlsRef.current = remaining;
  }, [promptText]);

  // On successful send the images belong to the thread — drop tracking without
  // deleting. Fires synchronously (via event) before the promptText update.
  useRunOn(
    [EventThreadEvent.Sent],
    useCallback(() => {
      trackedUrlsRef.current = [];
    }, []),
  );

  // If unmounted with still-tracked (unsubmitted) uploads, clean them up.
  useEffect(() => {
    return () => {
      for (const url of trackedUrlsRef.current) deleteMedia(url);
    };
  }, []);

  const handlePromptTextChange = useCallback(
    (value: string) => {
      setPromptInputState({ promptText: value });
    },
    [setPromptInputState],
  );

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

  // Muses selectable as the sender of an embedded dialog (inline editing).
  const dialogMuses = useMemo(
    () =>
      (novelist?.muses ?? []).map((m) => ({
        avatar: m.image || null,
        id: m.id ?? "",
        name: `${m.firstName} ${m.lastName}`.trim(),
      })),
    [novelist?.muses],
  );

  return (
    <S.TextInputContainer name="promptText">
      <RichTextEditor
        ref={editorRef}
        placeholder="Type your story here... @ to mention other novelists or muses"
        value={initialValue ?? ""}
        mentionTabs={MENTION_TABS}
        dialogMuses={dialogMuses}
        onChange={handlePromptTextChange}
      />
    </S.TextInputContainer>
  );
};
