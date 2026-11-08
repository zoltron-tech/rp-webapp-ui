"use client";
import type { Muse } from "@nw/types";
import classNames from "classnames";
import type { FC } from "react";
import { useMemo, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { FiChevronRight } from "react-icons/fi";
import { GrEdit } from "react-icons/gr";
import { deleteMuseAction } from "@/app/rp/muse/actions";
import { AppAlertDialog } from "@/components/dialog";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { useCustomEvents } from "@/hooks";
import { useUIContext } from "@/hooks/use-ui-context";
import { usePageRouter } from "@/hooks/use-page-router";
import { EVENTS } from "@/utils/constants/custom-events";
import { ROUTES } from "@/utils/constants/routes";
import { API_MESSAGE } from "@/utils/constants/status-messages";
import { AvatarNew } from "../common/avatar-new";
import * as S from "./styles";

type Props = React.HTMLProps<HTMLDivElement> & {
  muse: Muse | undefined;
  /** Other verses of this muse's character family, excluding `muse` itself. */
  verses?: Muse[];
};

export const MuseListItem: FC<Props> = ({ muse, className, verses, ...rest }) => {
  const { routeToPage } = usePageRouter();
  const user = useGlobalState("user");
  const setGlobalState = useGlobalStoreSet();
  const { successToast, errorToast } = useUIContext();
  const isOwnMuse = muse?.pennedBy?.username === user?.username;
  const { emit } = useCustomEvents(EVENTS.MUSE.base);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  // Verse family, self included, ordered for the badge row next to the name.
  const familyVerses = useMemo(() => {
    if (!muse || !verses?.length) return [];
    return [muse, ...verses]
      .filter((v): v is Muse => Boolean(v?.id))
      .sort((a, b) => (a.verseNumber ?? 1) - (b.verseNumber ?? 1));
  }, [muse, verses]);

  // Which verse of the family this row is currently showing. Switching
  // verses swaps the row's own content in place rather than navigating away,
  // so the list stays put while the user browses a character's verses.
  const [activeVerseId, setActiveVerseId] = useState(muse?.id);
  const displayMuse = familyVerses.find((v) => v.id === activeVerseId) ?? muse;

  const onVerseBadgeClick = (e: React.MouseEvent, verseId: string) => {
    e.stopPropagation();
    setActiveVerseId(verseId);
  };

  const onAvatarClick = () => {
    if (!displayMuse) return;
    routeToPage(ROUTES.Muse.View(displayMuse.id || ""));
  };

  if (!muse || !displayMuse) return <></>;

  return (
    <S.MuseContainer
      onClick={onAvatarClick}
      className={classNames(["muse-list-item", className])}
      {...rest}
    >
      <AvatarNew
        className="avatar"
        src={displayMuse.avatar?.src || displayMuse.image || null}
        nwImage={displayMuse.avatar}
        alt={displayMuse.firstName ?? "Muse"}
        name="open"
        onClick={onAvatarClick}
      />
      <S.MuseInfo>
        <S.MuseName>
          {displayMuse.firstName}{" "}
          <S.MuseSubname>{displayMuse.lastName}</S.MuseSubname>
        </S.MuseName>
        <S.MuseFandom $color={displayMuse.fandom?.color || "#666"}>
          {displayMuse.fandom?.name}
        </S.MuseFandom>
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
      </S.MuseInfo>
      {isOwnMuse && (
        <S.Controls>
          <S.IconBtn
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              routeToPage(ROUTES.Profile.Muses.Edit(displayMuse.id ?? ""));
            }}
            aria-label="Edit muse"
          >
            <GrEdit />
          </S.IconBtn>
          <S.IconBtn
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteAlert(true);
            }}
            aria-label="Delete muse"
          >
            <FaRegTrashCan />
          </S.IconBtn>
        </S.Controls>
      )}
      <AppAlertDialog
        closeOnConfirm
        heading={`Delete ${displayMuse.firstName}?`}
        text="This action is permanent."
        open={showDeleteAlert}
        onOpenChange={setShowDeleteAlert}
        onConfirm={async () => {
          const museId = displayMuse.id;
          if (!museId) return;
          const res = await deleteMuseAction(museId).catch(() => null);
          if (res?.message !== API_MESSAGE.Success) {
            errorToast(
              `Couldn't delete ${displayMuse.firstName}. Please try again.`,
            );
            return;
          }
          // Each delete site adjusts the signed-in novelist's count itself;
          // there is no shared MUSE.DELETED listener, so nothing double-counts.
          setGlobalState((prev) =>
            prev.novelist
              ? {
                  novelist: {
                    ...prev.novelist,
                    museCount: Math.max(0, (prev.novelist.museCount ?? 0) - 1),
                    muses: (prev.novelist.muses ?? []).filter(
                      (m) => m.id !== museId,
                    ),
                  },
                }
              : prev,
          );
          emit(EVENTS.MUSE.DELETED, {
            id: museId,
            name: displayMuse.firstName,
          });
          successToast(`${displayMuse.firstName} deleted.`);
        }}
      />
      <FiChevronRight size={18} color="var(--text-secondary)" />
    </S.MuseContainer>
  );
};

export default MuseListItem;
