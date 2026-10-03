"use client";

import type { Muse } from "@nw/types";
import { useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { GrEdit } from "react-icons/gr";
import { MdOutlineDownload, MdOutlineReport, MdShare } from "react-icons/md";
import { AppAlertDialog } from "@/components/dialog";
import { MiniMuseCard } from "@/components/mini-muse-card";
import { ShareMuseDialog } from "@/components/share-muse-dialog";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { deleteMuseAction } from "../../../muse/actions";
import { reportAction } from "../../../thread/actions";
import { getMuseAppearance } from "../appearance";
import * as S from "../styles";
import SectionMiniHeader from "./SectionMiniHeader";

type Props = {
  muse: Muse | null;
  isOwnMuse: boolean;
};

export function MoreSection({ muse, isOwnMuse }: Props) {
  const user = useGlobalState("user");
  const { routeToPage } = usePageRouter();
  const { successToast, errorToast } = useUIContext();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const [showExportCard, setShowExportCard] = useState(false);
  const [showShareMuse, setShowShareMuse] = useState(false);
  const accent = muse?.useAccent ? muse.accent : undefined;
  const { hideExpandedBackground } = getMuseAppearance(muse);

  return (
    <>
      <S.CardExpandedWrapper $hideChrome={hideExpandedBackground}>
        <S.CardBack
          className="muse-card"
          accent={accent}
          $hideBackground={hideExpandedBackground}
        >
          <S.InfoCardContent>
            <SectionMiniHeader muse={muse} accent={accent ?? null} />
            <S.InfoDivider $accent={accent ?? null} />
            <S.InfoSectionLabel>Options</S.InfoSectionLabel>
            <S.ScrollableContent accent={accent}>
              {isOwnMuse ? (
                <S.MoreMenuList>
                  <S.MoreMenuItem
                    type="button"
                    onClick={() =>
                      routeToPage(ROUTES.Profile.Muses.Edit(muse?.id ?? ""))
                    }
                  >
                    <GrEdit size={18} />
                    Edit muse
                  </S.MoreMenuItem>
                  <S.MoreMenuItem
                    type="button"
                    onClick={() => setShowShareMuse(true)}
                  >
                    <MdShare size={20} />
                    Share muse
                  </S.MoreMenuItem>
                  <S.MoreMenuItem
                    type="button"
                    onClick={() => setShowExportCard(true)}
                  >
                    <MdOutlineDownload size={20} />
                    Export muse card
                  </S.MoreMenuItem>
                  <S.MoreMenuItem
                    type="button"
                    $variant="danger"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <FaRegTrashCan size={18} />
                    {muse?.originalVerseId ? "Delete verse" : "Delete muse"}
                  </S.MoreMenuItem>
                </S.MoreMenuList>
              ) : (
                <S.MoreMenuList>
                  <S.MoreMenuItem
                    type="button"
                    onClick={() => setShowShareMuse(true)}
                  >
                    <MdShare size={20} />
                    Share muse
                  </S.MoreMenuItem>
                  <S.MoreMenuItem
                    type="button"
                    onClick={() => setShowExportCard(true)}
                  >
                    <MdOutlineDownload size={20} />
                    Export muse card
                  </S.MoreMenuItem>
                  <S.MoreMenuItem
                    type="button"
                    $variant="warn"
                    onClick={() => setShowReportConfirm(true)}
                  >
                    <MdOutlineReport size={20} />
                    Report muse
                  </S.MoreMenuItem>
                </S.MoreMenuList>
              )}
            </S.ScrollableContent>
          </S.InfoCardContent>
        </S.CardBack>
      </S.CardExpandedWrapper>

      <AppAlertDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        heading={`Delete ${muse?.firstName}?`}
        text="This action is permanent and cannot be undone. The muse and all associated data will be removed."
        actionButtonLabel="Delete"
        actionColor="negative"
        onConfirm={async () => {
          if (!muse?.id) return;
          setShowDeleteConfirm(false);
          await deleteMuseAction(muse.id);
          routeToPage(
            muse.originalVerseId
              ? ROUTES.Muse.View(muse.originalVerseId)
              : ROUTES.Profile.View(user?.username ?? "").Muses,
          );
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
      <AppAlertDialog
        open={showReportConfirm}
        onOpenChange={setShowReportConfirm}
        heading="Report this muse?"
        text="We strive to maintain a safe and welcoming community. If you notice any misconduct, please report it. Our team will review the issue and take appropriate action as quickly as possible."
        actionButtonLabel="Report"
        onConfirm={async () => {
          if (!muse?.id) return;
          setShowReportConfirm(false);
          const response = await reportAction(muse.id, "", "MUSE");
          if (response?.message === API_MESSAGE.Success) {
            successToast?.("Reported successfully.");
          } else {
            errorToast?.("There was an issue while reporting this muse.");
          }
        }}
        onCancel={() => setShowReportConfirm(false)}
      />

      {showExportCard && muse && (
        <MiniMuseCard muse={muse} onClose={() => setShowExportCard(false)} />
      )}

      <ShareMuseDialog
        muse={muse}
        open={showShareMuse}
        onClose={() => setShowShareMuse(false)}
      />
    </>
  );
}
