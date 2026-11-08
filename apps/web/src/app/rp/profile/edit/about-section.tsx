"use client";

import { ShouldRender } from "@novelist-world/ui";
import type { MentionDataItem, MentionTab } from "@nw/types/novelist";
import { fileTooLargeMessage } from "@nw/utils";
import { Separator } from "radix-ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BsArrowLeft } from "react-icons/bs";
import { GrAttachment } from "react-icons/gr";
import { MdGif, MdOutlineInfo } from "react-icons/md";
import { AppAlertDialog } from "@/components/dialog";
import { GifPicker } from "@/components/gif-picker";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/rich-text-editor-input";
import { useGlobalState } from "@/context/store/stores";
import { useRichTextMediaRoom } from "@/hooks/use-rich-text-media-room";
import { useUploadCaps } from "@/hooks/use-upload-caps";
import { useUploadMedia } from "@/hooks/use-upload-media";
import { API_MESSAGE } from "@/utils/constants";
import { searchMentionMusesAction } from "../../muse/actions";
import { useProfileState, useProfileStoreSet } from "./profile.store";
import * as S from "./styled";
import { useProfileSave } from "./use-profile-save";

type Props = {
  onBack: () => void;
};

export function AboutSection({ onBack }: Props) {
  const novelist = useGlobalState("novelist");
  const about = useProfileState("about");
  const setProfileState = useProfileStoreSet();
  const { saveNovelist, loading } = useProfileSave();
  const { uploadMedia } = useUploadMedia();
  // The service's cap for the file's family (AWS_COST_SECURITY_PLAN.md D7).
  const { capFor } = useUploadCaps();

  const [error, setError] = useState<string | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  // Five media items per rich-text input, as on prompts (2026-11-08).
  const { ensureRoom } = useRichTextMediaRoom(about);

  const editorRef = useRef<RichTextEditorHandle>(null);
  const originalRef = useRef(novelist?.about ?? "");

  useEffect(() => {
    originalRef.current = novelist?.about ?? "";
  }, [novelist?.about]);

  const isDirty = (about ?? "") !== (originalRef.current ?? "");

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

  const mentionTabs: MentionTab[] = useMemo(
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

  const handleGifSelect = useCallback(
    (gifUrl: string) => {
      setShowGifPicker(false);
      if (!ensureRoom()) return;
      editorRef.current?.insertGif(gifUrl);
    },
    [ensureRoom],
  );

  const handleAttachImage = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      const file = input.files?.[0] ?? null;
      input.value = "";
      if (!file) return;
      if (!ensureRoom()) return;

      if (file.size > capFor(file.type)) {
        setError(fileTooLargeMessage(capFor(file.type)));
        return;
      }
      setError(null);

      // Embed inline into the editor, same as prompt-input.
      const objectUrl = URL.createObjectURL(file);
      editorRef.current?.insertUploadingImage(objectUrl);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("contentType", file.type);
      formData.append("prefix", "profile-about");
      const url = await uploadMedia(formData);

      if (url === API_MESSAGE.MediaError) {
        setError("Failed to upload image");
        editorRef.current?.removeImageBySrc(objectUrl);
        URL.revokeObjectURL(objectUrl);
        return;
      }
      editorRef.current?.replaceImageSrc(objectUrl, url);
      URL.revokeObjectURL(objectUrl);
    },
    [capFor, uploadMedia, ensureRoom],
  );

  const handleSave = async () => {
    setError(null);
    const result = await saveNovelist();
    if (!result.ok) {
      setError("Failed to save changes. Please try again.");
      return;
    }
    onBack();
  };

  const handleReset = () => {
    setProfileState({ about: originalRef.current });
    setError(null);
  };

  const handleBack = () => {
    if (isDirty) {
      setDiscardOpen(true);
      return;
    }
    onBack();
  };

  const handleConfirmDiscard = () => {
    handleReset();
    setDiscardOpen(false);
    onBack();
  };

  return (
    <>
      <S.TopBar>
        <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
          <S.BackButton type="button" onClick={handleBack}>
            <BsArrowLeft size={18} />
          </S.BackButton>
          <S.FormHeading>
            <MdOutlineInfo />
            <h1>About</h1>
          </S.FormHeading>
        </div>
      </S.TopBar>

      <Separator.Root className="separator" orientation="horizontal" />

      <S.AboutSectionBody>
        <S.AboutToolbar>
          <S.AboutAttachLabel
            htmlFor="about-attach-input"
            aria-label="Attach image"
            onClick={(event) => {
              if (!ensureRoom()) event.preventDefault();
            }}
          >
            <GrAttachment />
          </S.AboutAttachLabel>
          <input
            id="about-attach-input"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleAttachImage}
          />
          <S.AboutToolButton
            type="button"
            aria-label="Insert GIF"
            onClick={() => {
              if (ensureRoom()) setShowGifPicker(true);
            }}
          >
            <MdGif />
          </S.AboutToolButton>
        </S.AboutToolbar>

        <RichTextEditor
          ref={editorRef}
          placeholder="Tell people about yourself..."
          value={about ?? ""}
          mentionTabs={mentionTabs}
          onChange={(value) => setProfileState({ about: value })}
        />
        <ShouldRender if={Boolean(error)}>
          <S.LandingErrorBanner>{error}</S.LandingErrorBanner>
        </ShouldRender>
      </S.AboutSectionBody>

      <Separator.Root className="separator" orientation="horizontal" />

      <S.FormActions>
        <S.ResetButton
          type="button"
          onClick={handleReset}
          disabled={!isDirty || loading}
        >
          Reset
        </S.ResetButton>
        <S.LandingHeroSaveButton
          type="button"
          onClick={handleSave}
          disabled={!isDirty || loading}
        >
          {loading ? "Saving..." : "Save"}
        </S.LandingHeroSaveButton>
      </S.FormActions>

      <AppAlertDialog
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        heading="Discard unsaved changes?"
        text="You have unsaved changes that will be lost."
        actionButtonLabel="Discard"
        closeButtonText="Stay"
        actionColor="negative"
        onConfirm={handleConfirmDiscard}
        onCancel={() => setDiscardOpen(false)}
      />

      <AppAlertDialog
        heading="Insert GIF"
        text=""
        body={<GifPicker onSelect={handleGifSelect} />}
        open={showGifPicker}
        onOpenChange={setShowGifPicker}
        showConfirm={false}
        closeButtonText="Close"
      />
    </>
  );
}
