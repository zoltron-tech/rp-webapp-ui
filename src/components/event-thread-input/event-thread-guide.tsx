"use client";

import type { FC } from "react";
import { LuCircleHelp } from "react-icons/lu";
import { UserGuideDialog, useUserGuide } from "@/components/user-guide-dialog";
import { PASSAGE_GUIDE } from "@/components/user-guide-dialog/guides/passage";
import * as S from "./styles";

/**
 * "How this works" for the composer.
 *
 * Sits in the row above the editor, beside the tools it explains: the toolbar,
 * embedded dialogs and their designs, and the picture bar that only exists once
 * a picture is selected — none of which announce themselves.
 */
type Props = {
  /**
   * Offer the guide unprompted the first time this novelist reaches the
   * composer. Only the new-passage composer asks for it: it is mounted for
   * members of the story, which is exactly who the guide is for, and only once
   * per page — the in-place editor of an existing passage would be a second
   * copy opening over the first.
   */
  autoOpen?: boolean;
};

export const EventThreadGuideButton: FC<Props> = ({ autoOpen = false }) => {
  const guide = useUserGuide(PASSAGE_GUIDE.id, { auto: autoOpen });

  return (
    <>
      <S.ToolButton
        type="button"
        aria-label="How to write a passage"
        title="How to write a passage"
        onClick={guide.start}
      >
        <LuCircleHelp />
      </S.ToolButton>

      <UserGuideDialog
        guide={PASSAGE_GUIDE}
        open={guide.open}
        onClose={guide.close}
        onFinish={guide.markSeen}
        onSkip={guide.dismiss}
      />
    </>
  );
};
