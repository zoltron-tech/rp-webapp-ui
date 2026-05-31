"use client";
import classNames from "classnames";
import type { FC } from "react";
import { useState } from "react";
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
};

export const MuseListItem: FC<Props> = ({ muse, className, ...rest }) => {
  const { routeToPage } = usePageRouter();
  const user = useGlobalState("user");
  const isOwnMuse = muse?.pennedBy?.username === user?.username;
  const { emit } = useCustomEvents(EVENTS.MUSE.base);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const onAvatarClick = () => {
    if (!muse) return;
    routeToPage(ROUTES.Muse.View(muse.id || ""));
  };

  if (!muse) return <></>;

  return (
    <S.MuseContainer
      onClick={onAvatarClick}
      className={classNames(["muse-list-item", className])}
      {...rest}
    >
      <AvatarNew
        className="avatar"
        src={muse?.image ?? null}
        alt={muse?.firstName ?? "Muse"}
        name="open"
        onClick={onAvatarClick}
      />
      <S.MuseInfo>
        <S.MuseName>
          {muse.firstName} <S.MuseSubname>{muse.lastName}</S.MuseSubname>
        </S.MuseName>
        <S.MuseFandom $color={muse.fandom?.color || "#666"}>
          {muse.fandom?.name}
        </S.MuseFandom>
      </S.MuseInfo>
      {isOwnMuse && (
        <S.Controls>
          <S.IconBtn
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              routeToPage(ROUTES.Profile.Muses.Edit(muse?.id ?? ""));
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
        heading={`Delete ${muse?.firstName}?`}
        text="This action is permanent."
        open={showDeleteAlert}
        onOpenChange={setShowDeleteAlert}
        onConfirm={async () => {
          if (!muse?.id) return;
          const res = await deleteMuseAction(muse.id);
          if (res?.message === API_MESSAGE.Success) {
            emit(EVENTS.MUSE.DELETED, { id: muse.id, name: muse.firstName });
          }
          setShowDeleteAlert(false);
        }}
      />
      <FiChevronRight size={18} color="var(--text-secondary)" />
    </S.MuseContainer>
  );
};

export default MuseListItem;
