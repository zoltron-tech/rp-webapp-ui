"use client";

import { Avatar, ShouldRender, Username } from "@/components/common";
import { PageLoader } from "@/components/layout";
import { Quote } from "@/components/novelist-card/styles";
import { useStateMachine } from "@/hooks";
import { Muse, Prompt } from "@/types";
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
import { MdOutlineSlowMotionVideo } from "react-icons/md";
import { BiSolidMessageEdit } from "react-icons/bi";
import { FaComments } from "react-icons/fa6";
import classNames from "classnames";
import { Flex, RichText } from "@novelist-world/ui";
import { getPromptsByMuseAction } from "../../prompt/actions";
import { toFormattedDate } from "@/utils/helpers";
import { VscVerifiedFilled } from "react-icons/vsc";
import { VscUnverified } from "react-icons/vsc";
import { IoHeart } from "react-icons/io5";
import { TagsContainer } from "@/components/tags-container";
import { useGlobalState } from "@/context/store/stores";
import { AvatarNew } from "@/components/common/avatar-new";

type CARD_STATE =
  | "MAIN"
  | "VIDEO"
  | "MUSE_INFO"
  | "CONNECTIONS"
  | "BACK_STORY"
  | "PROMPTS";

export default function MuseProfilePage({}) {
  const params = useParams();
  const authState = useGlobalState("authState");
  const novelist = useGlobalState("novelist");
  const [muse, setMuse] = useState<Muse | null>(null);
  const [prompts, setPrompts] = useState<Prompt[] | null>(null);
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
        VIDEO: true,
        PROMPTS: true,
      },
      VIDEO: {
        MAIN: true,
        MUSE_INFO: true,
        CONNECTIONS: true,
        BACK_STORY: true,
        PROMPTS: true,
      },
      MUSE_INFO: {
        MAIN: true,
        CONNECTIONS: true,
        BACK_STORY: true,
        VIDEO: true,
        PROMPTS: true,
      },
      CONNECTIONS: {
        MAIN: true,
        BACK_STORY: true,
        MUSE_INFO: true,
        VIDEO: true,
        PROMPTS: true,
      },
      BACK_STORY: {
        CONNECTIONS: true,
        MAIN: true,
        MUSE_INFO: true,
        VIDEO: true,
        PROMPTS: true,
      },
      PROMPTS: {
        CONNECTIONS: true,
        MAIN: true,
        MUSE_INFO: true,
        VIDEO: true,
        BACK_STORY: true,
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

  const onPromptClick = (promptId: string) => {
    if (promptId) push(`/rp/prompt/${promptId}`);
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

  const fetchPrompts = async (museId: string) => {
    setLoading(true);
    const _prompts = await getPromptsByMuseAction(museId);

    if (!_prompts || "message" in _prompts) {
      setLoading(false);
      push("/404");
      return;
    }
    console.log(_prompts);
    setLoading(false);
    setPrompts(_prompts);
  };

  useEffect(() => {
    if (authState === "LOADING" || muse) return;

    fetchMuse(username);
    fetchPrompts(username);
  }, [authState]);

  const loadChonnections = (slice = 0, className = "") => {
    return muse?.connections
      ?.slice(0, slice ? slice : muse?.connections.length)
      .map((connection) => (
        <>
          <S.ConnectionItem
            onClick={() =>
              onMuseAvatarClick(
                connection.sourceMuseId === muse.id
                  ? connection.targetMuseId
                  : connection.sourceMuseId
              )
            }
          >
            <S.Avatar
              src={connection.image}
              alt={connection.firstName}
              size={65}
              key={connection.firstName}
              className={className}
              name={connection.firstName}
            />
            <Flex direction="column" align="flex-start">
              <S.ConnectionLabel>
                {connection.firstName} {connection.lastName}
              </S.ConnectionLabel>
              <Flex>
                <S.ConnectionType>{connection.connection}</S.ConnectionType>
                {connection.verified &&
                  connection.connection !== "RELATIONSHIP" && (
                    <VscVerifiedFilled size={20} color="rgb(21, 74, 117)" />
                  )}
                {connection.connection === "RELATIONSHIP" &&
                  connection.verified && (
                    <IoHeart size={20} color="rgb(151, 42, 42)" />
                  )}
                {!connection.verified && (
                  <VscUnverified size={20} color="rgb(184, 184, 184)" />
                )}
              </Flex>
            </Flex>
          </S.ConnectionItem>
        </>
      ));
  };

  const loadPrompts = () => {
    return prompts?.map((prompt) => (
      <>
        <Flex direction="column">
          <S.PromptText>
            {prompt.text.length > 200
              ? `${prompt.text.slice(0, 200)} ...`
              : prompt.text}
          </S.PromptText>
          <ShouldRender if={prompt.text.length > 80}>
            <S.ViewMoreText
              onClick={() => onPromptClick(prompt.id ? prompt.id : "")}
            >
              Read more...
            </S.ViewMoreText>
          </ShouldRender>
          {prompt?.media && (
            <S.PromptMedia>
              <S.CardBackground
                banner={prompt?.media || ""}
                className="image"
              />
            </S.PromptMedia>
          )}
          <S.FooterContainer>
            <Flex justify="flex-start" style={{ width: "80%" }}>
              <FaComments />{" "}
              <S.PromptFooterText
                onClick={() => onPromptClick(prompt.id ? prompt.id : "")}
              >
                View Comments & Replies.
              </S.PromptFooterText>
            </Flex>
            <S.Date>{toFormattedDate(prompt?.createdOn)}</S.Date>
          </S.FooterContainer>
        </Flex>
      </>
    ));
  };

  return (
    <S.MuseContainer>
      <ShouldRender if={loading}>
        <PageLoader />
      </ShouldRender>
      <S.Banner
        src={muse?.image && !muse.image.endsWith(".gif") ? muse.image : null}
      />
      <S.CardWrapper
        hoverable={is("MAIN")}
        className={classNames({ closed: is("MAIN"), open: !is("MAIN") })}
      >
        <S.CardBackground banner={muse?.image || ""} />
        <S.Card className="muse-card">
          <S.CardHeader>
            <S.MuseInfo>
              <S.MuseName>
                {muse?.firstName} {muse?.lastName}
              </S.MuseName>
              <S.AuthorContainer>
                <AvatarNew
                  className="selectable"
                  src={muse?.pennedBy?.image ?? null}
                  alt={muse?.pennedBy.username ?? "Author Avatar"}
                  size={60}
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
        <S.CardExpandedWrapper>
          <S.CardBack className="muse-card">
            <S.InfoCardContent>
              <S.Title>Muse Information</S.Title>
              <S.InfoContainer>
                <S.InfoItem>
                  <S.InfoLabel>Visibility:</S.InfoLabel>
                  <S.InfoValue>{muse?.privacy}</S.InfoValue>
                </S.InfoItem>
                <S.InfoItem>
                  <S.InfoLabel>First Name:</S.InfoLabel>
                  <S.InfoValue>{muse?.firstName}</S.InfoValue>
                </S.InfoItem>
                <S.InfoItem>
                  <S.InfoLabel>Last Name:</S.InfoLabel>
                  <S.InfoValue>{muse?.lastName}</S.InfoValue>
                </S.InfoItem>
                <ShouldRender
                  if={
                    muse?.nicknames?.length !== undefined &&
                    muse?.nicknames?.length > 0
                  }
                >
                  <S.InfoItem>
                    <S.InfoLabel>Nicknames:</S.InfoLabel>
                    <Flex direction="column">
                      {muse?.nicknames?.map((nickname) => (
                        <S.InfoValue key={nickname}>{nickname}</S.InfoValue>
                      ))}
                    </Flex>
                  </S.InfoItem>
                </ShouldRender>
                <S.InfoItem>
                  <S.InfoLabel>Fandom:</S.InfoLabel>
                  <ShouldRender if={muse?.fandom !== null}>
                    <S.FandomValue color={muse?.fandom.color || "red"}>
                      {muse?.fandom.id}
                    </S.FandomValue>
                  </ShouldRender>
                  <ShouldRender if={muse?.fandom === null}>
                    <S.InfoValue>NOT SPECIFIED</S.InfoValue>
                  </ShouldRender>
                </S.InfoItem>
                {muse?.extraAttributes &&
                  Object.entries(muse.extraAttributes).map(([key, value]) => (
                    <S.InfoItem key={key}>
                      <S.InfoLabel>{key}:</S.InfoLabel>
                      <S.InfoValue>{value}</S.InfoValue>
                    </S.InfoItem>
                  ))}
                <ShouldRender
                  if={
                    muse?.tags?.length !== undefined && muse?.tags?.length > 0
                  }
                >
                  <S.InfoItem>
                    <S.InfoLabel>Tags:</S.InfoLabel>
                    <TagsContainer tags={muse?.tags} />
                  </S.InfoItem>
                </ShouldRender>
              </S.InfoContainer>
            </S.InfoCardContent>
          </S.CardBack>
        </S.CardExpandedWrapper>
      </ShouldRender>
      <ShouldRender if={is("CONNECTIONS")}>
        <S.CardExpandedWrapper>
          <S.CardBack className="muse-card">
            <S.InfoCardContent>
              <S.Title>Connections</S.Title>
              <S.ConnectionsContainer>
                <S.ScrollableContent>
                  <S.ExpandedContentInner>
                    {loadChonnections(0, "paddington")}
                  </S.ExpandedContentInner>
                </S.ScrollableContent>
              </S.ConnectionsContainer>
            </S.InfoCardContent>
          </S.CardBack>
        </S.CardExpandedWrapper>
      </ShouldRender>
      <ShouldRender if={is("BACK_STORY")}>
        <S.CardExpandedWrapper>
          <S.CardBack className="muse-card">
            <S.InfoCardContent>
              <S.Title>Back Story</S.Title>
              <S.ScrollableContent>
                <S.NoteContainer>
                  <Quote>{muse?.note}</Quote>
                </S.NoteContainer>
                <ShouldRender if={Boolean(muse?.story)}>
                  <RichText content={JSON.parse(muse?.story || "{}")} />
                </ShouldRender>
              </S.ScrollableContent>
            </S.InfoCardContent>
          </S.CardBack>
        </S.CardExpandedWrapper>
      </ShouldRender>
      <ShouldRender if={is("VIDEO")}>
        <S.CardExpandedWrapper>
          <ShouldRender
            if={muse?.video !== null && muse?.video.endsWith(".mp4") === true}
          >
            <S.VideoCardContent>
              <S.Video controls width="100%" height="100%">
                <source src={muse?.video || ""} type="video/mp4" />
                Your browser does not support the video tag.
              </S.Video>
            </S.VideoCardContent>
          </ShouldRender>
        </S.CardExpandedWrapper>
      </ShouldRender>
      <ShouldRender if={is("PROMPTS")}>
        <S.CardExpandedWrapper>
          <S.CardBack className="muse-card">
            <S.InfoCardContent>
              <S.Title>Prompts</S.Title>
              <S.ScrollableContent>{loadPrompts()}</S.ScrollableContent>
            </S.InfoCardContent>
          </S.CardBack>
        </S.CardExpandedWrapper>
      </ShouldRender>
      <S.SideMenu>
        <ShouldRender if={muse?.video != null && muse?.video !== ""}>
          <S.MenuButton>
            <S.MenuButtonIcon
              onClick={() => transition("VIDEO")}
              className={classNames({ selected: is("VIDEO") })}
            >
              <MdOutlineSlowMotionVideo size={"45%"} />
            </S.MenuButtonIcon>
            <S.MenuText>VIDEO</S.MenuText>
          </S.MenuButton>
        </ShouldRender>
        <S.MenuButton>
          <S.MenuButtonIcon
            onClick={() => transition("PROMPTS")}
            className={classNames({ selected: is("PROMPTS") })}
          >
            <BiSolidMessageEdit size={"45%"} />
          </S.MenuButtonIcon>
          <S.MenuText>PROMPTS</S.MenuText>
        </S.MenuButton>
        <S.MenuButton>
          <S.MenuButtonIcon
            onClick={() => transition("BACK_STORY")}
            className={classNames({ selected: is("BACK_STORY") })}
          >
            <GiBookCover size={"45%"} />
          </S.MenuButtonIcon>
          <S.MenuText>STORY</S.MenuText>
        </S.MenuButton>
        <S.MenuButton>
          <S.MenuButtonIcon
            onClick={() => transition("MUSE_INFO")}
            className={classNames({ selected: is("MUSE_INFO") })}
          >
            <TiInfoLarge size={"45%"} />
          </S.MenuButtonIcon>
          <S.MenuText>INFO</S.MenuText>
        </S.MenuButton>
        <S.MenuButton>
          <S.MenuButtonIcon
            onClick={() => transition("CONNECTIONS")}
            className={classNames({ selected: is("CONNECTIONS") })}
          >
            <BsFillPeopleFill size={"45%"} />
          </S.MenuButtonIcon>
          <S.MenuText>CONTACTS</S.MenuText>
        </S.MenuButton>
        <ShouldRender if={!is("MAIN")}>
          <S.MenuButton className="stick-top">
            <S.MenuButtonIcon
              onClick={() => {
                transition("MAIN");
              }}
            >
              <MdClose />
            </S.MenuButtonIcon>
          </S.MenuButton>
        </ShouldRender>
        <ShouldRender if={is("MAIN")}>
          <S.MenuButton className="stick-top">
            <S.MenuButtonIcon
              onClick={() => {
                transition("MAIN");
              }}
            >
              <FiMoreVertical size={"45%"} />
            </S.MenuButtonIcon>
          </S.MenuButton>
        </ShouldRender>
      </S.SideMenu>
    </S.MuseContainer>
  );
}
