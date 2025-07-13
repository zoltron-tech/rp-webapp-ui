"use client";

import { FC } from "react";

import classNames from "classnames";
import moment from "moment";
import * as S from "./styles";
import { Message } from "@/types/conversation";

type Props = {
  message: Message;
  currentUsername: string;
};

export const ChatBubble: FC<Props> = ({ message, currentUsername }) => {
  const today = moment().format("YYYY-MM-DD");
  const messageDate = moment.utc(message.createdAt).local();

  const isToday = messageDate.isSame(today, "day");
  const formattedDate = isToday
    ? messageDate.format("h:mm A")
    : messageDate.format("MMM D, h:mm A");
  return (
    <S.ChatBubbleContainer
      className={classNames({
        sender: message.sender.username === currentUsername,
        receiver: message.sender.username !== currentUsername,
      })}
    >
      <S.ChatBubble>{message.message}</S.ChatBubble>
      <S.TimeStamp>{formattedDate}</S.TimeStamp>
    </S.ChatBubbleContainer>
  );
};
