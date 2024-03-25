"use client";
import { Novelist } from "@/types/novelist";
import { FC, HTMLProps } from "react";

import { Logger } from "@/utils/services";
import { useRouter } from "next/navigation";
import { FaCheck } from "react-icons/fa6";

import * as S from "./styles";
import { RxCross2 } from "react-icons/rx";
import { ShouldRender } from "../common";
import {
  acceptFriendRequest,
  deleteFriendRequest,
} from "@/app/rp/profile/actions";
import { API_MESSAGE } from "@/utils/constants";

type Props = HTMLProps<HTMLDivElement> & {
  novelist?: Novelist | null;
  removeMethod: (novelist: Novelist) => void;
};

export const FriendRequestNotification: FC<Props> = ({
  novelist,
  removeMethod,
  ...rest
}) => {
  const { push } = useRouter();

  const handleAcceptFriendRequest = async () => {
    if (!novelist?.id) return;

    const response = await acceptFriendRequest(novelist.id);

    console.log("response", response);

    if (response?.message === API_MESSAGE.Success) {
      removeMethod(novelist);
    }
  };

  const handleDeleteFriendRequest = async () => {
    if (!novelist?.id) return;

    const response = await deleteFriendRequest(novelist.id);

    console.log("response", response);

    if (response?.message === API_MESSAGE.Success) {
      removeMethod(novelist);
    }
  };

  const onAvatarClick = () => {
    if (!novelist) return;
    push(`/rp/profile/${novelist.username}`);
  };

  Logger.info("FriendRequestNotification rendered");

  if (!novelist) return <></>;

  return (
    <S.CardWrapper {...rest}>
      <S.Card className="muse-card">
        <S.CardHeader>
          <S.Avatar
            src={novelist.image || ""}
            alt={""}
            size={40}
            name={"open"}
            onClick={onAvatarClick}
            hoverable
          />
          <S.NotificationBox>
            <S.Title>{novelist.firstName}</S.Title>
            <S.username username={novelist.username}></S.username>
            <S.Subtext>Sent you a request</S.Subtext>
          </S.NotificationBox>
          <S.NotificationActions>
            <S.AcceptButton onClick={handleAcceptFriendRequest}>
              <FaCheck />
            </S.AcceptButton>
            <S.RemoveButton onClick={handleDeleteFriendRequest}>
              <RxCross2 />
            </S.RemoveButton>
          </S.NotificationActions>
        </S.CardHeader>
      </S.Card>
    </S.CardWrapper>
  );
};
