"use client";

import { Avatar, ShouldRender, Username } from "@/components/common";
import { PageLoader } from "@/components/layout";
import { Quote } from "@/components/novelist-card/styles";
import { useAuthContext, useStateMachine } from "@/hooks";
import { Muse } from "@/types";
import { Logger } from "@/utils/services";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMuseAction } from "../../muse/actions";
import * as S from "./styles";
import { BsFillPeopleFill } from "react-icons/bs";
import { TiInfoLarge } from "react-icons/ti";
import { GiBookCover } from "react-icons/gi";
import { FiMoreVertical } from "react-icons/fi";
import { MdClose } from "react-icons/md";
import classNames from "classnames";

type CARD_STATE = "MAIN" | "MUSE_INFO" | "CONNECTIONS" | "BACK_STORY";

export default function MuseProfilePage({}) {
  const params = useParams();
  const { state: authState } = useAuthContext();
  const [muse, setMuse] = useState<Muse | null>(null);
  const [loading, setLoading] = useState(true);
  const username = params?.slug as string;
  const { push } = useRouter();
  const { state, transition, is } = useStateMachine<CARD_STATE>({
    initial: "MAIN",
    transitions: {
      MAIN: {
        MUSE_INFO: true,
        CONNECTIONS: true,
        BACK_STORY: true,
      },
      MUSE_INFO: {
        MAIN: true,
        CONNECTIONS: true,
        BACK_STORY: true,
      },
      CONNECTIONS: {
        MAIN: true,
        BACK_STORY: true,
        MUSE_INFO: true,
      },
      BACK_STORY: {
        CONNECTIONS: true,
        MAIN: true,
        MUSE_INFO: true,
      },
    },
  });
  Logger.debug("params are:", params);

  const onAuthorAvatarClick = () => {
    const username = muse?.pennedBy?.username;
    if (username) push(`/rp/profile/${username}`);
  };

  const onMuseAvatarClick = (museId: string) => {
    if (museId) push(`/rp/muse/${museId}`);
  };

  const fetchMuse = async (museId: string) => {
    setLoading(true);
    const _muse = await getMuseAction(museId);

    if (!_muse || "message" in _muse) {
      // handle error
      setLoading(false);
      push("/404");
      return;
    }
    setLoading(false);
    setMuse(_muse);
  };

  useEffect(() => {
    if (authState === "LOADING" || muse) return;

    fetchMuse(username);
  }, [authState]);

  const loadChildren = (slice = 0, className = "") => {
    return muse?.connections
      ?.slice(0, slice ? slice : muse?.connections.length)
      .map((connection) => (
        <S.Avatar
          src={connection.image}
          alt={connection.firstName}
          size={65}
          key={connection.firstName}
          className={className}
          name={connection.firstName}
          onClick={() => onMuseAvatarClick(connection.id ? connection.id : "")}
          hoverable
        />
      ));
  };

  return (
    <S.MuseContainer>
      <ShouldRender if={loading}>
        <PageLoader />
      </ShouldRender>
      <S.Banner
        src={muse?.image && !muse.image.endsWith(".gif") ? muse.image : ""}
      />
      <S.CardWrapper
        className={classNames({ closed: is("MAIN") })}
        onClick={() => transition("MUSE_INFO")}
      >
        <S.CardBackground banner={muse?.image || ""} />
        <S.Card className="muse-card">
          <S.CardHeader>
            <S.MuseInfo>
              <S.MuseName>
                {muse?.firstName} {muse?.lastName}
              </S.MuseName>
              <S.AuthorContainer>
                <Avatar
                  src={muse?.pennedBy?.image || ""}
                  alt="profile-picture"
                  size={60}
                  hoverable
                  onClick={onAuthorAvatarClick}
                />
                <S.UsernameContainer>
                  <span>PENNED BY:</span>
                  <Username username={muse?.pennedBy?.username} primary />
                </S.UsernameContainer>
              </S.AuthorContainer>
            </S.MuseInfo>
          </S.CardHeader>
        </S.Card>
      </S.CardWrapper>
      <ShouldRender if={is("MUSE_INFO")}>
        <S.CardExpandedWrapper onClick={() => transition("CONNECTIONS")}>
          <S.CardBack className="muse-card">
            <S.InfoCardContent>
              <S.Title>Muse Information</S.Title>
              <S.InfoContainer>
                <S.InfoItem>
                  <S.InfoLabel>First Name:</S.InfoLabel>
                  <S.InfoValue>{muse?.firstName}</S.InfoValue>
                </S.InfoItem>
                <S.InfoItem>
                  <S.InfoLabel>Last Name:</S.InfoLabel>
                  <S.InfoValue>{muse?.lastName}</S.InfoValue>
                </S.InfoItem>
                <S.InfoItem>
                  <S.InfoLabel>Fandom:</S.InfoLabel>
                  <S.InfoValue>{muse?.fandom}</S.InfoValue>
                </S.InfoItem>
                <S.InfoItem>
                  <S.InfoLabel>Date of Birth:</S.InfoLabel>
                  <S.InfoValue>
                    {muse?.dateOfBirth.year}-{muse?.dateOfBirth.month}-
                    {muse?.dateOfBirth.day}
                  </S.InfoValue>
                </S.InfoItem>
                <S.InfoItem>
                  <S.InfoLabel>Species:</S.InfoLabel>
                  <S.InfoValue>{muse?.species}</S.InfoValue>
                </S.InfoItem>
                <S.InfoItem>
                  <S.InfoLabel>Hometown:</S.InfoLabel>
                  <S.InfoValue>{muse?.hometown}</S.InfoValue>
                </S.InfoItem>
                <S.InfoItem>
                  <S.InfoLabel>Relationship Status:</S.InfoLabel>
                  <S.InfoValue>{muse?.relationshipStatus}</S.InfoValue>
                </S.InfoItem>
              </S.InfoContainer>
            </S.InfoCardContent>
          </S.CardBack>
        </S.CardExpandedWrapper>
      </ShouldRender>
      <ShouldRender if={is("CONNECTIONS")}>
        <S.CardExpandedWrapper onClick={() => transition("BACK_STORY")}>
          <S.CardBack className="muse-card">
            <S.InfoCardContent>
              <S.Title>Connections</S.Title>
              <S.ConnectionsContainer>
                <S.ScrollableContent>
                  <S.ExpandedContentInner>
                    {loadChildren(0, "paddington")}
                  </S.ExpandedContentInner>
                </S.ScrollableContent>
              </S.ConnectionsContainer>
            </S.InfoCardContent>
          </S.CardBack>
        </S.CardExpandedWrapper>
      </ShouldRender>
      <ShouldRender if={is("BACK_STORY")}>
        <S.CardExpandedWrapper onClick={() => transition("MAIN")}>
          <S.CardBack className="muse-card">
            <S.InfoCardContent>
              <S.Title>Back Story</S.Title>
              <S.ScrollableContent>
                <S.NoteContainer>
                  <Quote>{muse?.note}</Quote>
                </S.NoteContainer>
                <S.Text>{muse?.story}</S.Text>
              </S.ScrollableContent>
            </S.InfoCardContent>
          </S.CardBack>
        </S.CardExpandedWrapper>
      </ShouldRender>
      <S.SideMenu>
        <ShouldRender if={!is("MAIN")}>
          <S.MenuButton className="stick-top">
            <S.MenuButtonIcon onClick={() => transition("MAIN")}>
              <MdClose size={"20px"} />
            </S.MenuButtonIcon>
          </S.MenuButton>
        </ShouldRender>
        <S.MenuButton>
          <S.MenuButtonIcon onClick={() => transition("BACK_STORY")}>
            <GiBookCover size={"30px"} />
          </S.MenuButtonIcon>
          STORY
        </S.MenuButton>
        <S.MenuButton>
          <S.MenuButtonIcon onClick={() => transition("MUSE_INFO")}>
            <TiInfoLarge size={"30px"} />
          </S.MenuButtonIcon>
          INFO
        </S.MenuButton>
        <S.MenuButton>
          <S.MenuButtonIcon onClick={() => transition("CONNECTIONS")}>
            <BsFillPeopleFill size={"30px"} />
          </S.MenuButtonIcon>
          CONTACTS
        </S.MenuButton>
        <S.MenuButton>
          <S.MenuButtonIcon>
            <FiMoreVertical size={"20px"} />
          </S.MenuButtonIcon>
        </S.MenuButton>
      </S.SideMenu>
    </S.MuseContainer>
  );
}
