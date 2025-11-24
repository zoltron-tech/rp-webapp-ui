"use client";
import classNames from "classnames";
import { useParams, useRouter } from "next/navigation";
import { type FC, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { GrEdit } from "react-icons/gr";
import { deleteMuseAction } from "@/app/rp/muse/actions";
import { useGlobalState } from "@/context/store/stores";
import { useCustomEvents } from "@/hooks";
import type { Muse } from "@/types/novelist";
import { API_MESSAGE, INITIAL_MUSE } from "@/utils/constants";
import { EVENTS } from "@/utils/constants/custom-events";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";
import { ShouldRender } from "../common";
import { AppAlertDialog } from "../dialog";
import * as S from "./styles";

type Props = React.HTMLProps<HTMLDivElement> & {
  muse?: Muse | null;
};
export const MuseCard: FC<Props> = ({ muse, className, ...rest }) => {
  const { push } = useRouter();
  const params = useParams();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const { emit } = useCustomEvents("muse");

  const user = useGlobalState("user");

  const username = params?.slug as string;
  const isCurrentUser = user?.username && user.username === username;

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>, muse: Muse) => {
    const target = e.target as HTMLDivElement;
    if (target.classList.contains("button")) return;

    !muse.firstName ? onAddClick() : onAvatarClick();
  };

  const onAvatarClick = () => {
    if (!muse) return;
    push(ROUTES.Muse.View(muse.id || ""));
  };

  const onAddClick = () => {
    if (!muse) return;
    push(ROUTES.Profile.Muses.Create);
  };

  const onEditClick = () => {
    push(ROUTES.Profile.Muses.Edit(muse?.id || ""));
  };

  const onConfirmDelete = async () => {
    if (!muse?.id) return;
    const deleted = await deleteMuseAction(muse.id);
    if (deleted.message === API_MESSAGE.Success) {
      emit("deleted", {
        id: muse.id,
        name: muse.firstName,
      });
    }
    setShowDeleteAlert(false);
  };

  Logger.info("MuseCard rendered");

  if (!muse) return <></>;

  return (
    <S.CardWrapper
      className={classNames([
        className,
        {
          new: !muse.firstName,
        },
      ])}
      {...rest}
    >
      <ShouldRender if={muse !== INITIAL_MUSE && !!isCurrentUser}>
        <AppAlertDialog
          heading={`Unalive ${muse.firstName}?`}
          text="This action is permanent. Are you sure?"
          open={showDeleteAlert}
          onOpenChange={setShowDeleteAlert}
          onConfirm={onConfirmDelete}
        />
      </ShouldRender>
      <S.CardBackground banner={muse.image || ""} />
      <S.Card
        className={classNames([
          "muse-card",
          {
            new: !muse.firstName,
          },
        ])}
        onClick={(e) => handleCardClick(e, muse)}
      >
        <ShouldRender if={muse !== INITIAL_MUSE && !!isCurrentUser}>
          <S.EditButton className="button" onClick={onEditClick}>
            <GrEdit />
          </S.EditButton>
          <S.DeleteButton
            className="button"
            onClick={() => setShowDeleteAlert(true)}
          >
            <FaRegTrashCan />
          </S.DeleteButton>
        </ShouldRender>
        <S.CardHeader>
          <S.MuseInfo>
            <S.Title
              className={classNames([
                {
                  new: !muse.firstName,
                },
              ])}
            >
              {muse.firstName || "Add New"} {muse.lastName || ""}
            </S.Title>
          </S.MuseInfo>
        </S.CardHeader>
      </S.Card>
    </S.CardWrapper>
  );
};

export default MuseCard;
