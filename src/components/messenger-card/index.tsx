"use client";

import {
  chatAction,
  sendMessageAction,
  updateMessagePollingAction,
} from "@/app/rp/novelists/actions";
import { ChatBubble, ShouldRender } from "@/components/common";
import { useAuthContext, useStore, useUIContext } from "@/hooks";
import { Emoji, Friend, Message } from "@/types";
import { StoreState } from "@/types/state";
import { Logger } from "@/utils/services";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import classNames from "classnames";
import moment from "moment";
import { useRouter } from "next/navigation";
import { FC, useEffect, useRef, useState } from "react";
import { BsEmojiSmile, BsSendArrowUp } from "react-icons/bs";
import { Avatar } from "../common";
import * as S from "./styles";
export type MessengerCardProps = {};

export const MessengerCard: FC<MessengerCardProps> = ({}) => {
  const { novelist } = useAuthContext();
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [loadedChat, setLoadedChat] = useState<Message[] | null>([]);
  const lastMessageDate = useRef<string | null>(null);
  const messageIds = useRef<Set<string>>(new Set());
  const [_loading, setLoading] = useState(true);
  const [openPicker, setOpenPicker] = useState(false);
  const [theme] = useStore<StoreState, "theme">((store) => store.theme);
  const { push } = useRouter();
  const [inputMessage, setInputMessage] = useState("");
  const { errorToast } = useUIContext();
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const polling = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      polling.current && clearTimeout(polling.current);
    };
  }, []);

  const scrollChat = () => {
    setTimeout(() => {
      chatBoxRef.current?.scrollTo({
        top: chatBoxRef.current?.scrollHeight,
        behavior: "instant",
      });
    }, 10);
  };

  const onCardClick = (friend: Friend) => {
    setSelectedFriend(friend);
    fetchChat(friend);
    polling.current && clearTimeout(polling.current);
  };

  const onAvatarClick = (username: string) => {
    if (username === "") return;
    push(`/rp/profile/${username}`);
  };

  const onEmojiIconClick = () => {
    setOpenPicker((prev) => !prev);
  };

  const fetchChat = async (targetUser: Friend) => {
    setLoading(true);
    const _messages = await chatAction(targetUser?.username || null);

    if (!_messages || "message" in _messages) {
      // handle error
      setLoading(false);
      push("/404");
      return;
    }
    setLoading(false);
    setLoadedChat(_messages);
    lastMessageDate.current = _messages[_messages.length - 1]?.date;
    if (!lastMessageDate.current) {
      lastMessageDate.current = moment()
        .utc()
        .format("YYYY-MM-DD HH:mm:ss.SSSSSS");
    }
    scrollChat();
    polling.current = setTimeout(() => {
      updateChat(targetUser);
    }, 10000);
  };

  const updateChat = async (targetUser: Friend) => {
    const _messages = await updateMessagePollingAction(
      targetUser?.username || null,
      lastMessageDate.current || ""
    );

    if (_messages && !("message" in _messages) && _messages.length) {
      const messagesToAdd: Message[] = [];
      _messages.forEach((message) => {
        if (!messageIds.current.has(message.id)) {
          messagesToAdd.push(message);
          messageIds.current.add(message.id);
        }
      });

      lastMessageDate.current = _messages[_messages.length - 1].date;

      setLoadedChat((prev) => {
        const newMessages = [...(prev || []), ...messagesToAdd].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        return newMessages;
      });
      scrollChat();
    }

    polling.current = setTimeout(() => {
      updateChat(targetUser);
    }, 10000);
  };

  const handleEmojiSelect = (emoji: Emoji) => {
    setInputMessage((prev) => prev + emoji.native);
  };

  const handleSendMessage = async () => {
    if (inputMessage === "" || !novelist?.username || !selectedFriend?.username)
      return;

    const message: Message = {
      _tag: "Message",
      id: "",
      sender: novelist?.username,
      receiver: selectedFriend?.username,
      message: inputMessage.trim(),
      date: new Date().toISOString(),
    };

    if (message.message !== "") {
      const sent = await sendMessageAction(message);

      if (!sent || !("sender" in sent)) {
        errorToast("Failed to send message");
        return;
      }

      setLoadedChat((prev) => [...(prev || []), sent]);
      messageIds.current.add(sent.id);
    }

    setOpenPicker(false);
    setInputMessage("");
    scrollChat();
  };

  Logger.info("MessengerCard rendered");

  return (
    <S.ContentContainer>
      <S.Contacts>
        <S.Title>
          <span>Conversations</span>
        </S.Title>
        <S.Menu className={classNames({ open })}>
          {novelist?.friends &&
            novelist?.friends.map((friend) => (
              <S.CardWrapper
                key={friend.username}
                className={
                  selectedFriend?.username === friend.username ? "selected" : ""
                }
                onClick={() => onCardClick(friend)}
              >
                <S.Card className="muse-card">
                  <S.CardHeader>
                    <Avatar
                      src={friend.image}
                      alt={friend.username}
                      size={30}
                      key={friend.username}
                      name={""}
                      onClick={() => onAvatarClick(friend.username)}
                      hoverable
                    />
                    <S.NotificationBox>{friend.username}</S.NotificationBox>
                  </S.CardHeader>
                </S.Card>
              </S.CardWrapper>
            ))}
        </S.Menu>
      </S.Contacts>
      <S.ChatContainer>
        <ShouldRender if={selectedFriend != null}>
          <S.ChatTitleContainer
            key={selectedFriend?.username}
            className="non-hoverable"
          >
            <S.Card className="muse-card">
              <S.CardHeader>
                <Avatar
                  src={selectedFriend?.image || ""}
                  alt={selectedFriend?.username || ""}
                  size={40}
                  key={selectedFriend?.username}
                  onClick={() => onAvatarClick(selectedFriend?.username || "")}
                  name={"open"}
                  hoverable
                />
                <S.TitleBox>
                  <S.username
                    username={selectedFriend?.username || ""}
                  ></S.username>
                </S.TitleBox>
              </S.CardHeader>
            </S.Card>
          </S.ChatTitleContainer>
          <S.ChatBoxParent ref={chatBoxRef}>
            <S.ChatBox>
              {loadedChat?.map((message) => (
                <S.ChatRow
                  key={message.date}
                  className={
                    message.sender === novelist?.username
                      ? "sender"
                      : "receiver"
                  }
                >
                  <ChatBubble
                    message={message}
                    currentUsername={novelist?.username || ""}
                  />
                </S.ChatRow>
              ))}
            </S.ChatBox>
          </S.ChatBoxParent>
          <S.ChatInput>
            <S.MessageInput
              name="message"
              label="Message"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onEnter={handleSendMessage}
            ></S.MessageInput>
            <ShouldRender if={openPicker == true}>
              <S.MenuContainer>
                <Picker
                  data={data}
                  onEmojiSelect={handleEmojiSelect}
                  previewPosition={"none"}
                  navPosition={"bottom"}
                  searchPosition={"sticky"}
                  perLine={7}
                  theme={theme}
                />
              </S.MenuContainer>
            </ShouldRender>
            <S.MenuItemBox>
              <BsEmojiSmile onClick={() => onEmojiIconClick()} size={"30px"} />
            </S.MenuItemBox>
            <S.MenuItemBox>
              <BsSendArrowUp size={"30px"} onClick={handleSendMessage} />
            </S.MenuItemBox>
          </S.ChatInput>
        </ShouldRender>
      </S.ChatContainer>
    </S.ContentContainer>
  );
};

export default MessengerCard;
