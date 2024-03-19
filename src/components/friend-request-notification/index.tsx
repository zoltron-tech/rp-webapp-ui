"use client";
import { Novelist } from "@/types/novelist";
import { FC, HTMLProps } from "react";

import { Logger } from "@/utils/services";
import { useRouter } from "next/navigation";
import { FaCheck } from "react-icons/fa6";

import * as S from "./styles";
import { RxCross2 } from "react-icons/rx";

type Props = HTMLProps<HTMLDivElement> & {
  novelist?: Novelist | null;
};
export const FriendRequestNotification: FC<Props> = ({ novelist, ...rest }) => {
  const { push } = useRouter();

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
            <S.AcceptButton>
              <FaCheck />
            </S.AcceptButton>
            <S.RemoveButton>
              <RxCross2 />
            </S.RemoveButton>
          </S.NotificationActions>
        </S.CardHeader>
      </S.Card>
    </S.CardWrapper>
  );
};
