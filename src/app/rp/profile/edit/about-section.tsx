"use client";

import { ShouldRender } from "@novelist-world/ui";
import { Separator } from "radix-ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BsArrowLeft } from "react-icons/bs";
import { MdOutlineInfo } from "react-icons/md";
import { AppAlertDialog } from "@/components/dialog";
import { RichTextEditor } from "@/components/rich-text-editor-input";
import { useGlobalState } from "@/context/store/stores";
import type { MentionDataItem, MentionTab } from "@/types/novelist";
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

  const [error, setError] = useState<string | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);

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
        <RichTextEditor
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
    </>
  );
}
