"use client";

import { FC } from "react";

import { Message } from "@/types";
import classNames from "classnames";
import moment from "moment";
import * as S from "./styles";

type Props = {
  message: Message;
  currentUsername: string;
};

export const ChatBubble: FC<Props> = ({ message, currentUsername }) => {
  const today = moment().format("YYYY-MM-DD");
  const isToday = moment(message.date).isSame(today, "day");
  const formattedDate = isToday
    ? moment(message.date).format("h:mm A")
    : moment(message.date).format("MMM D, h:mm A");
  return (
    <S.ChatBubbleContainer
      className={classNames({
        sender: message.sender === currentUsername,
        receiver: message.receiver === currentUsername,
      })}
    >
      <S.ChatBubble>{message.message}</S.ChatBubble>
      <S.TimeStamp>{formattedDate}</S.TimeStamp>
    </S.ChatBubbleContainer>
  );
};
