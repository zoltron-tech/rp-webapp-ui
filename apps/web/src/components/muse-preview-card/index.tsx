"use client";

import type { Muse } from "@nw/types";
import { usePathname } from "@/lib/navigation";
import type { FC } from "react";
import { useMemo, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { GrEdit } from "react-icons/gr";
import { deleteMuseAction } from "@/app/rp/muse/actions";
import { AppAlertDialog } from "@/components/dialog";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { useCustomEvents } from "@/hooks";
import { useUIContext } from "@/hooks/use-ui-context";
import { usePageRouter } from "@/hooks/use-page-router";
import { API_MESSAGE } from "@/utils/constants";
import { EVENTS } from "@/utils/constants/custom-events";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styles";

type Props = {
  muse: Muse;
  className?: string;
  /** Other verses of this muse's character family, excluding `muse` itself. */
  verses?: Muse[];
};

export const MusePreviewCard: FC<Props> = ({ muse, className, verses }) => {
  const { routeToPage } = usePageRouter();
  const pathname = usePathname();
  const isHomePath =
    typeof pathname === "string" && pathname.startsWith("/rp/home");
  const user = useGlobalState("user");
  const setGlobalState = useGlobalStoreSet();
  const { successToast, errorToast } = useUIContext();
  const isOwnMuse = muse?.pennedBy?.username === user?.username;
  const { emit } = useCustomEvents(EVENTS.MUSE.base);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  // Verse family, self included, ordered for the badge row below the name.
  const familyVerses = useMemo(() => {
    if (!verses?.length) return [];
    return [muse, ...verses]
      .filter((v): v is Muse => Boolean(v?.id))
      .sort((a, b) => (a.verseNumber ?? 1) - (b.verseNumber ?? 1));
  }, [muse, verses]);

  // Which verse of the family this card is currently showing. Switching
  // verses swaps the card's own content in place rather than navigating away,
  // so the list stays put while the user browses a character's verses.
  const [activeVerseId, setActiveVerseId] = useState(muse.id);
  const displayMuse =
    familyVerses.find((v) => v.id === activeVerseId) ?? muse;

  const onVerseBadgeClick = (e: React.MouseEvent, verseId: string) => {
    e.stopPropagation();
    setActiveVerseId(verseId);
  };

  const accent = displayMuse.useAccent ? (displayMuse.accent ?? null) : null;
  const coverSrc = displayMuse.cardBackground?.src || displayMuse.image || "";

  // Use crop values whenever the data is present and valid (width > 0).
  // The `useExtraImages` flag is absent on lightweight list responses, so we
  // fall back to checking the crop payload directly — same encoding as the
  // muse profile page: width = background-size%, x/y = background-position%.
  const rawCrop = displayMuse.cardBackground?.crop;
  const cardCrop = rawCrop && (rawCrop.width ?? 0) > 0 ? rawCrop : null;
  const bgSize = cardCrop ? `${cardCrop.width}%` : undefined;
  const bgPosition = cardCrop ? `${cardCrop.x}% ${cardCrop.y}%` : undefined;

  const onClick = () => {
    if (!displayMuse.id) return;
    routeToPage(ROUTES.Muse.View(displayMuse.id));
  };

  const onEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    routeToPage(ROUTES.Profile.Muses.Edit(displayMuse.id ?? ""));
  };

  const onConfirmDelete = async () => {
    const museId = displayMuse?.id;
    if (!museId) return;
    const res = await deleteMuseAction(museId).catch(() => null);
    if (res?.message !== API_MESSAGE.Success) {
      errorToast(`Couldn't delete ${displayMuse.firstName}. Please try again.`);
      return;
    }
    // Each delete site adjusts the signed-in novelist's count itself; there
    // is no shared MUSE.DELETED listener for it, so nothing double-counts.
    setGlobalState((prev) =>
      prev.novelist
        ? {
            novelist: {
              ...prev.novelist,
              museCount: Math.max(0, (prev.novelist.museCount ?? 0) - 1),
              muses: (prev.novelist.muses ?? []).filter((m) => m.id !== museId),
            },
          }
        : prev,
    );
    emit(EVENTS.MUSE.DELETED, { id: museId, name: displayMuse.firstName });
    successToast(`${displayMuse.firstName} deleted.`);
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
        closeOnConfirm
        heading={`Delete ${displayMuse.firstName}?`}
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
            {displayMuse.fandom && displayMuse.fandom.id !== "FANDOMLESS" && (
              <S.FandomTag $color={displayMuse.fandom.color}>
                {displayMuse.fandom.name}
              </S.FandomTag>
            )}
            <S.CharacterName>
              {displayMuse.firstName}
              {displayMuse.lastName ? ` ${displayMuse.lastName}` : ""}
            </S.CharacterName>
            {familyVerses.length > 1 && (
              <S.VerseBadgeRow>
                {familyVerses.map((v) => (
                  <S.VerseBadge
                    key={v.id}
                    type="button"
                    $active={v.id === activeVerseId}
                    disabled={v.id === activeVerseId}
                    title={
                      v.id === activeVerseId
                        ? `Verse ${v.verseNumber ?? 1} (current)`
                        : `Show verse ${v.verseNumber ?? 1}`
                    }
                    onClick={(e) => onVerseBadgeClick(e, v.id ?? "")}
                  >
                    {v.verseNumber ?? 1}
                  </S.VerseBadge>
                ))}
              </S.VerseBadgeRow>
            )}
            <S.PennedByRow>
              <S.PennedByLabel>by</S.PennedByLabel>
              <S.PennedByUsername $accent={accent}>
                @{displayMuse.pennedBy?.username}
              </S.PennedByUsername>
            </S.PennedByRow>
          </S.CoverNameBlock>
        </S.CoverImage>
      </S.Card>
    </S.CardFrame>
  );
};

export default MusePreviewCard;
