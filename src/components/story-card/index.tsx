"use client";
import classNames from "classnames";
import { useParams, useRouter } from "next/navigation";
import { type FC, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { GrEdit } from "react-icons/gr";
import { useGlobalState } from "@/context/store/stores";
import type { StoryBoard } from "@/types/story-board";
import { INITIAL_STORY_BOARD } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";
import { ShouldRender } from "../common";
import { AppAlertDialog } from "../dialog";
import * as S from "./styles";

type Props = React.HTMLProps<HTMLDivElement> & {
  storyBoard?: StoryBoard | null;
};

export const StoryCard: FC<Props> = ({ storyBoard, className, ...rest }) => {
  const { push } = useRouter();
  const params = useParams();
  const user = useGlobalState("user");
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const username = params?.slug as string;
  const isCurrentUser = user?.username && user.username === username;

  const handleCardClick = (
    e: React.MouseEvent<HTMLDivElement>,
    storyBoard: StoryBoard,
  ) => {
    const target = e.target as HTMLDivElement;
    if (target.classList.contains("button")) return;

    !storyBoard.name ? onAddClick() : onAvatarClick();
  };

  const onAvatarClick = () => {
    if (!storyBoard) return;
    push(ROUTES.Story.View(storyBoard.id || ""));
  };

  const onAddClick = () => {
    if (!storyBoard) return;
    push(ROUTES.Profile.Story.Create);
  };

  const onEditClick = () => {
    push(ROUTES.Profile.Story.Edit(storyBoard?.id || "").Index);
  };

  Logger.info("StoryCard rendered");

  if (!storyBoard) return <></>;

  return (
    <S.CardWrapper
      className={classNames([
        className,
        {
          new: !storyBoard.name,
        },
      ])}
      {...rest}
    >
      <ShouldRender if={storyBoard !== INITIAL_STORY_BOARD && !!isCurrentUser}>
        <AppAlertDialog
          heading={`Delete ${storyBoard.name}?`}
          text="This action is permanent. Are you sure?"
          open={showDeleteAlert}
          onOpenChange={setShowDeleteAlert}
        />
      </ShouldRender>
      <S.CardBackground banner={storyBoard.image || ""} />
      <S.Card
        className={classNames([
          "muse-card",
          {
            new: !storyBoard.name,
          },
        ])}
        onClick={(e) => handleCardClick(e, storyBoard)}
      >
        <ShouldRender
          if={storyBoard !== INITIAL_STORY_BOARD && !!isCurrentUser}
        >
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
                className,
                {
                  new: !storyBoard.name,
                },
              ])}
              {...rest}
            >
              {storyBoard.name || "Add New"}
            </S.Title>
          </S.MuseInfo>
        </S.CardHeader>
      </S.Card>
    </S.CardWrapper>
  );
};

export default StoryCard;
