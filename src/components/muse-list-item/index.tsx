"use client";
import classNames from "classnames";
import type { FC } from "react";
import { useMemo, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { FiChevronRight } from "react-icons/fi";
import { GrEdit } from "react-icons/gr";
import { deleteMuseAction } from "@/app/rp/muse/actions";
import { AppAlertDialog } from "@/components/dialog";
import { useGlobalState } from "@/context/store/stores";
import { useCustomEvents } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Muse } from "@/types";
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
        src={displayMuse.image ?? null}
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
        heading={`Delete ${displayMuse.firstName}?`}
        text="This action is permanent."
        open={showDeleteAlert}
        onOpenChange={setShowDeleteAlert}
        onConfirm={async () => {
          if (!displayMuse.id) return;
          const res = await deleteMuseAction(displayMuse.id);
          if (res?.message === API_MESSAGE.Success) {
            emit(EVENTS.MUSE.DELETED, {
              id: displayMuse.id,
              name: displayMuse.firstName,
            });
          }
          setShowDeleteAlert(false);
        }}
      />
      <FiChevronRight size={18} color="var(--text-secondary)" />
    </S.MuseContainer>
  );
};

export default MuseListItem;
