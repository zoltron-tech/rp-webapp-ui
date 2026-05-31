"use client";

import { usePathname } from "next/navigation";
import type { FC } from "react";
import { useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { GrEdit } from "react-icons/gr";
import { deleteMuseAction } from "@/app/rp/muse/actions";
import { AppAlertDialog } from "@/components/dialog";
import { useGlobalState } from "@/context/store/stores";
import { useCustomEvents } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Muse } from "@/types";
import { API_MESSAGE } from "@/utils/constants";
import { EVENTS } from "@/utils/constants/custom-events";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styles";

type Props = {
  muse: Muse;
  className?: string;
};

export const MusePreviewCard: FC<Props> = ({ muse, className }) => {
  const { routeToPage } = usePageRouter();
  const pathname = usePathname();
  const isHomePath =
    typeof pathname === "string" && pathname.startsWith("/rp/home");
  const user = useGlobalState("user");
  const isOwnMuse = muse?.pennedBy?.username === user?.username;
  const { emit } = useCustomEvents(EVENTS.MUSE.base);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const accent = muse.useAccent ? (muse.accent ?? null) : null;
  const coverSrc = muse.cardBackground?.src || muse.image || "";

  // Use crop values whenever the data is present and valid (width > 0).
  // The `useExtraImages` flag is absent on lightweight list responses, so we
  // fall back to checking the crop payload directly — same encoding as the
  // muse profile page: width = background-size%, x/y = background-position%.
  const rawCrop = muse.cardBackground?.crop;
  const cardCrop = rawCrop && (rawCrop.width ?? 0) > 0 ? rawCrop : null;
  const bgSize = cardCrop ? `${cardCrop.width}%` : undefined;
  const bgPosition = cardCrop ? `${cardCrop.x}% ${cardCrop.y}%` : undefined;

  const onClick = () => {
    if (!muse.id) return;
    routeToPage(ROUTES.Muse.View(muse.id));
  };

  const onEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    routeToPage(ROUTES.Profile.Muses.Edit(muse.id ?? ""));
  };

  const onConfirmDelete = async () => {
    if (!muse?.id) return;
    const res = await deleteMuseAction(muse.id);
    if (res?.message === API_MESSAGE.Success) {
      emit(EVENTS.MUSE.DELETED, { id: muse.id, name: muse.firstName });
    }
    setShowDeleteAlert(false);
  };

  const combinedClassName =
    `${className ?? ""} ${isHomePath ? "home" : ""}`.trim();

  return (
    <S.CardFrame
      $accent={accent}
      onClick={onClick}
      className={combinedClassName}
    >
      <AppAlertDialog
        heading={`Delete ${muse.firstName}?`}
        text="This action is permanent."
        open={showDeleteAlert}
        onOpenChange={setShowDeleteAlert}
        onConfirm={onConfirmDelete}
      />
      {isOwnMuse && (
        <S.ControlsOverlay>
          <S.EditButton
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEditClick(e);
            }}
            aria-label="Edit muse"
          >
            <GrEdit />
          </S.EditButton>
          <S.DeleteButton
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteAlert(true);
            }}
            aria-label="Delete muse"
          >
            <FaRegTrashCan />
          </S.DeleteButton>
        </S.ControlsOverlay>
      )}
      <S.Card>
        <S.CoverImage $src={coverSrc} $bgSize={bgSize} $bgPosition={bgPosition}>
          <S.CoverNameBlock>
            {muse.fandom && muse.fandom.id !== "FANDOMLESS" && (
              <S.FandomTag $color={muse.fandom.color}>
                {muse.fandom.name}
              </S.FandomTag>
            )}
            <S.CharacterName>
              {muse.firstName}
              {muse.lastName ? ` ${muse.lastName}` : ""}
            </S.CharacterName>
            <S.PennedByRow>
              <S.PennedByLabel>by</S.PennedByLabel>
              <S.PennedByUsername $accent={accent}>
                @{muse.pennedBy?.username}
              </S.PennedByUsername>
            </S.PennedByRow>
          </S.CoverNameBlock>
        </S.CoverImage>
      </S.Card>
    </S.CardFrame>
  );
};

export default MusePreviewCard;
