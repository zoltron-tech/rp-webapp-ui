import type { MentionDataItem, MentionTab } from "@nw/types";
import { type FC, useCallback, useEffect, useMemo, useRef } from "react";
import { RiErrorWarningLine } from "react-icons/ri";
import { searchMentionMusesAction } from "@/app/rp/muse/actions";
import { deleteMedia } from "@/app/rp/profile/actions";
import { useGlobalState } from "@/context/store/stores";
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
  /** Compact mode: starts at one-line height and grows with content. */
  compact?: boolean;
}

export const PromptTextField: FC<PromptTextFieldProps> = ({
  onClear,
  fullPage,
  compact,
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<RichTextEditorHandle>(null);
  const novelist = useGlobalState("novelist");
  const setPromptInputState = usePromptInputStoreSet();
  const promptText = usePromptInputState("promptText");
  const gifToInsert = usePromptInputState("gifToInsert");
  const uploadingImage = usePromptInputState("uploadingImage");
  const uploadedImage = usePromptInputState("uploadedImage");
  const uploadFailedImage = usePromptInputState("uploadFailedImage");
  const mediaUploadError = usePromptInputState("mediaUploadError");

  // Tracks final backend URLs of images inserted via upload so we can
  // delete them from storage if removed before the post is submitted.
  const trackedUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    if (gifToInsert && editorRef.current) {
      editorRef.current.insertGif(gifToInsert);
      setPromptInputState({ gifToInsert: null });
    }
  }, [gifToInsert, setPromptInputState]);

  useEffect(() => {
    if (uploadingImage && editorRef.current) {
      editorRef.current.insertUploadingImage(uploadingImage.objectUrl);
      setPromptInputState({ uploadingImage: null });
    }
  }, [uploadingImage, setPromptInputState]);

  useEffect(() => {
    if (uploadedImage && editorRef.current) {
      editorRef.current.replaceImageSrc(
        uploadedImage.objectUrl,
        uploadedImage.finalUrl,
      );
      URL.revokeObjectURL(uploadedImage.objectUrl);
      // Keep a reference so we can clean up if the image is removed later
      trackedUrlsRef.current = [
        ...trackedUrlsRef.current,
        uploadedImage.finalUrl,
      ];
      setPromptInputState({ uploadedImage: null });
    }
  }, [uploadedImage, setPromptInputState]);

  // Detect when a tracked image has been deleted from the editor (e.g. via
  // backspace) and fire the backend deletion call immediately.
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
      if (currentUrls.has(url)) {
        remaining.push(url);
      } else {
        deleteMedia(url);
      }
    }
    trackedUrlsRef.current = remaining;
  }, [promptText]);

  useEffect(() => {
    if (uploadFailedImage && editorRef.current) {
      editorRef.current.removeImageBySrc(uploadFailedImage.objectUrl);
      URL.revokeObjectURL(uploadFailedImage.objectUrl);
      setPromptInputState({ uploadFailedImage: null });
    }
  }, [uploadFailedImage, setPromptInputState]);

  const handlePromptTextChange = useCallback(
    (value: string) => {
      setPromptInputState({ promptText: value });
    },
    [setPromptInputState],
  );

  const handleClear = useCallback(() => {
    console.log("Clearing form");
    setPromptInputState({ promptText: "" });
    editorRef.current?.clear();
    if (textAreaRef.current) {
      console.log("resetting current");
      textAreaRef.current.value = "";
    }
    onClear?.();
  }, [setPromptInputState, onClear]);

  useRunOn([PromptEvent.Sent], handleClear);

  // On successful send the images are saved to the post — clear tracking
  // without issuing any deletions. This fires synchronously (via DOM event)
  // before the promptText state update, so the watcher above won't delete.
  useRunOn([PromptEvent.Sent], () => {
    trackedUrlsRef.current = [];
  });

  // If the component unmounts while there are still tracked URLs (e.g. user
  // navigates away without submitting), delete them from storage.
  useEffect(() => {
    return () => {
      for (const url of trackedUrlsRef.current) {
        deleteMedia(url);
      }
    };
    // trackedUrlsRef is stable (ref) and deleteMedia is a stable import
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const errorMessage =
    mediaUploadError === "FILE_TOO_LARGE"
      ? "Attachment is too large. Maximum file size is 10 MB."
      : mediaUploadError === "INVALID_FILE_TYPE"
        ? "Invalid file type. Please upload an image, audio or video file."
        : mediaUploadError === "UPLOAD_FAILED"
          ? "Upload failed. Please try again."
          : null;

  return (
    <S.TextInputContainer name="promptText" $fullPage={fullPage}>
      {errorMessage && (
        <S.UploadErrorBanner role="alert">
          <RiErrorWarningLine size={15} />
          {errorMessage}
        </S.UploadErrorBanner>
      )}
      {/* <textarea ref={textAreaRef} className="text-area" spellCheck required /> */}
      <RichTextEditor
        ref={editorRef}
        placeholder="Type your story here... @mention"
        value={""}
        mentionTabs={MENTION_TABS}
        onChange={handlePromptTextChange}
        onClear={handleClear}
        fullPage={fullPage}
        compact={compact}
        desktopRounded
      />
    </S.TextInputContainer>
  );
};
