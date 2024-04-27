import { Card, ShouldRender } from "@/components/common";
import { useAuthContext, useStore } from "@/hooks";
import classNames from "classnames";
import { Logger } from "@/utils/services";
import { FC, useState, useEffect, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import * as S from "./styles";
import { Avatar } from "../common";
import { BsSendArrowUp, BsEmojiSmile } from "react-icons/bs";
import { Friend, Message } from "@/types";
import { chatAction } from "@/app/rp/novelists/actions";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { StoreState } from "@/types/state";
import useWebSocket from "react-use-websocket";
import { Console } from "console";
const SOCKET_URL = "ws://localhost:50200/ws/app/user";

export type MessengerCardProps = {};

export const MessengerCard: FC<MessengerCardProps> = ({}) => {
  const { novelist } = useAuthContext();
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [loadedChat, setLoadedChat] = useState<Message[] | null>([]);
  const [loading, setLoading] = useState(true);
  const [openPicker, setOpenPicker] = useState(false);
  const [theme] = useStore<StoreState, "theme">((store) => store.theme);
  const { push } = useRouter();
  const { sendMessage, lastMessage, readyState } = useWebSocket(SOCKET_URL);

  const [inputMessage, setInputMessage] = useState("Hello");
  const [channel, setChannel] = useState(selectedFriend?.username + "/private");

  const [privateChats, setPrivateChats] = useState(new Map());
  const [publicChats, setPublicChats] = useState([]);
  const [userData, setUserData] = useState({
    sender: novelist?.username,
    receiver: "",
    connected: false,
  });

  const handleSendMessage = () => {
    console.log("Ham agaye!", inputMessage, SOCKET_URL, channel);
    if (inputMessage.trim() !== "") {
      sendMessage(
        JSON.stringify({
          type: "message",
          channel: channel,
          data: inputMessage,
        })
      );
    }
  };

  const handleSubscribe = (newChannel: SetStateAction<string>) => {
    setChannel(newChannel);
  };

  useEffect(() => {
    console.log(userData);
  }, [userData]);

  const onCardClick = (friend: Friend) => {
    setSelectedFriend(friend);
    setChannel(friend.username + "/private");
    fetchChat(friend);
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
  };

  Logger.info("MessengerCard rendered");

  return (
    <>
      <S.ProfileBackgroundBlurFilter
        banner={
          "https://i.etsystatic.com/44068041/r/il/3bab40/5467123737/il_300x300.5467123737_1kne.jpg"
        }
      />
      <Card
        width="100%"
        maxWidth="90cqw"
        minHeight="550px"
        maxHeight="550px"
        padding="0px"
        margin="clamp(50px, 20cqw, 50px) auto 100px auto"
        centered
      >
        <S.ContentContainer>
          <S.Contacts>
            <S.Title>
              <span>Friends</span>
            </S.Title>
            <S.Menu className={classNames({ open })}>
              {novelist?.friends &&
                novelist?.friends.map((friend) => (
                  <S.CardWrapper
                    key={friend.username}
                    className={
                      selectedFriend?.username === friend.username
                        ? "selected"
                        : ""
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
                      onClick={() =>
                        onAvatarClick(selectedFriend?.username || "")
                      }
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
              <S.ChatBoxParent>
                <S.ChatBox>
                  {loadedChat?.map((message) => (
                    <S.ChatRow
                      key={message.createdAt}
                      className={
                        message.sender === novelist?.username
                          ? "sender"
                          : "receiver"
                      }
                    >
                      <S.ChatBubble
                        className={
                          message.sender === novelist?.username
                            ? "sender"
                            : "receiver"
                        }
                      >
                        {message.message}
                      </S.ChatBubble>
                    </S.ChatRow>
                  ))}
                </S.ChatBox>
              </S.ChatBoxParent>
              <S.ChatInput>
                <S.MessageInput name="message" label="message"></S.MessageInput>
                <ShouldRender if={openPicker == true}>
                  <S.MenuContainer>
                    <Picker
                      data={data}
                      onEmojiSelect={console.log}
                      previewPosition={"none"}
                      navPosition={"bottom"}
                      searchPosition={"sticky"}
                      perLine={7}
                      theme={theme}
                    />
                  </S.MenuContainer>
                </ShouldRender>
                <S.MenuItemBox>
                  <BsEmojiSmile
                    onClick={() => onEmojiIconClick()}
                    size={"30px"}
                  />
                </S.MenuItemBox>
                <S.MenuItemBox>
                  <BsSendArrowUp
                    size={"30px"}
                    onClick={() => handleSendMessage()}
                  />
                </S.MenuItemBox>
              </S.ChatInput>
            </ShouldRender>
          </S.ChatContainer>
        </S.ContentContainer>
      </Card>
    </>
  );
};

export default MessengerCard;
