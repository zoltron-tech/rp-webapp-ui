"use client";
import type { Muse } from "@nw/types/novelist";
import classNames from "classnames";
import { useParams } from "next/navigation";
import { type FC, useState } from "react";
import { FaRegTrashCan, FaUser } from "react-icons/fa6";
import { GrEdit } from "react-icons/gr";
import { deleteMuseAction } from "@/app/rp/muse/actions";
import { useGlobalState } from "@/context/store/stores";
import { useCustomEvents } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
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
  const { routeToPage } = usePageRouter();
  const params = useParams();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [coverError, setCoverError] = useState(false);
  const { emit } = useCustomEvents(EVENTS.MUSE.base);

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
    routeToPage(ROUTES.Muse.View(muse.id || ""));
  };

  const onAddClick = () => {
    if (!muse) return;
    routeToPage(ROUTES.Profile.Muses.Create);
  };

  const onEditClick = () => {
    routeToPage(ROUTES.Profile.Muses.Edit(muse?.id || ""));
  };

  const onConfirmDelete = async () => {
    if (!muse?.id) return;
    const deleted = await deleteMuseAction(muse.id);
    if (deleted.message === API_MESSAGE.Success) {
      emit(EVENTS.MUSE.DELETED, {
        id: muse.id,
        name: muse.firstName,
      });
    }
    setShowDeleteAlert(false);
  };

  const getSafeImage = (src?: string) => src || "";

  const coverSrc =
    getSafeImage(muse?.cardBackground?.src) || getSafeImage(muse?.image || "");

  Logger.info("MuseCard rendered");

  if (!muse) return <></>;

  return (
    <S.CardContainer>
      <ShouldRender if={muse !== INITIAL_MUSE && !!isCurrentUser}>
        <S.ActionBar>
          <S.EditButton type="button" className="button" onClick={onEditClick}>
            <GrEdit />
            <S.ButtonLabel>Edit</S.ButtonLabel>
          </S.EditButton>
          <S.DeleteButton
            type="button"
            className="button"
            onClick={() => setShowDeleteAlert(true)}
          >
            <FaRegTrashCan />
            <S.ButtonLabel>Delete</S.ButtonLabel>
          </S.DeleteButton>
        </S.ActionBar>
      </ShouldRender>
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
        <S.ImageWrapper>
          <S.CardBackground banner={coverSrc} />
          {coverSrc && (
            // biome-ignore lint/a11y/useAltText: hidden probe only
            <img
              src={coverSrc}
              style={{ display: "none" }}
              onError={() => setCoverError(true)}
            />
          )}
          {(!coverSrc || coverError) && (
            <S.FallbackImageIcon>
              <FaUser size={56} />
            </S.FallbackImageIcon>
          )}
        </S.ImageWrapper>
        <S.Card
          className={classNames([
            "muse-card",
            {
              new: !muse.firstName,
            },
          ])}
          onClick={(e) => handleCardClick(e, muse)}
        >
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
    </S.CardContainer>
  );
};

export default MuseCard;
