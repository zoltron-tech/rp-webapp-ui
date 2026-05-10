"use client";

import { Flex, RichText } from "@novelist-world/ui";
import classNames from "classnames";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BiSolidMessageEdit } from "react-icons/bi";
import { BsFillPeopleFill } from "react-icons/bs";
import { FaComments } from "react-icons/fa6";
import { FiMoreVertical } from "react-icons/fi";
import { GiBookCover } from "react-icons/gi";
import { IoHeart } from "react-icons/io5";
import { MdClose, MdOutlineSlowMotionVideo } from "react-icons/md";
import { TiInfoLarge } from "react-icons/ti";
import { VscUnverified, VscVerifiedFilled } from "react-icons/vsc";
import { ShouldRender, Username } from "@/components/common";
import { PrivacyIcon } from "@/components/common/privacy-icon";
import { AppImageViewer } from "@/components/image-viewer/AppImageViewer";
import { Quote } from "@/components/novelist-card/styles";
import { RichTextRenderer } from "@/components/rich-text-editor-input/rich-test-renderer";
import { TagsContainer } from "@/components/tags-container";
import { useGlobalState } from "@/context/store/stores";
import { useStateMachine } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Muse, MuseAboutSection, Prompt } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import { toFormattedDate } from "@/utils/helpers";
import { Logger } from "@/utils/services";
import { getMuseAboutSectionsAction, getMuseAction } from "../../muse/actions";
import { getPromptsByMuseAction } from "../../prompt/actions";
import * as S from "./styles";

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
  const [muse, setMuse] = useState<Muse | null>(null);
  const [prompts, setPrompts] = useState<Prompt[] | null>(null);
  const [aboutSections, setAboutSections] = useState<MuseAboutSection[] | null>(
    null,
  );
  const username = params?.slug as string;
  const { routeToPage, baseDataLoader } = usePageRouter();
  const { transition, is } = useStateMachine<CARD_STATE>({
    initial: "MAIN",
    transitions: {
      BACK_STORY: {
        CONNECTIONS: true,
        MAIN: true,
        MUSE_INFO: true,
        PROMPTS: true,
        VIDEO: true,
      },
      CONNECTIONS: {
        BACK_STORY: true,
        MAIN: true,
        MUSE_INFO: true,
        PROMPTS: true,
        VIDEO: true,
      },
      MAIN: {
        BACK_STORY: true,
        CONNECTIONS: true,
        MUSE_INFO: true,
        PROMPTS: true,
        VIDEO: true,
      },
      MUSE_INFO: {
        BACK_STORY: true,
        CONNECTIONS: true,
        MAIN: true,
        PROMPTS: true,
        VIDEO: true,
      },
      PROMPTS: {
        BACK_STORY: true,
        CONNECTIONS: true,
        MAIN: true,
        MUSE_INFO: true,
        VIDEO: true,
      },
      VIDEO: {
        BACK_STORY: true,
        CONNECTIONS: true,
        MAIN: true,
        MUSE_INFO: true,
        PROMPTS: true,
      },
    },
  });
  Logger.debug("params are:", params);

  const getSafeImage = (src?: string) => src || "";

  const onMuseAvatarClick = (museId: string) => {
    if (museId) routeToPage(ROUTES.Muse.View(museId));
  };

  const onPromptClick = (promptId: string) => {
    if (promptId) routeToPage(ROUTES.Prompt.View(promptId));
  };

  const fetchMuse = async (museId: string) => {
    const _muse = await baseDataLoader(() => getMuseAction(museId));
    setMuse(_muse);
  };

  const fetchPrompts = async (museId: string) => {
    const _prompts = await baseDataLoader(() => getPromptsByMuseAction(museId));
    setPrompts(_prompts);
  };

  const fetchAboutSections = async (museId: string) => {
    const _aboutSections = await baseDataLoader(() =>
      getMuseAboutSectionsAction(museId),
    );
    setAboutSections(_aboutSections);
  };

  useEffect(() => {
    if (authState === "LOADING" || muse) return;

    fetchMuse(username);
    fetchPrompts(username);
    fetchAboutSections(username);
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
                  : connection.sourceMuseId,
              )
            }
          >
            <S.Avatar
              src={connection.image}
              alt={connection.firstName}
              size={40}
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
        <Flex direction="column" style={{ width: "100%" }}>
          <RichTextRenderer
            savedText={prompt.text ?? ""}
            collapsedHeight={100}
            overlayHidden
          />
          {prompt?.media && (
            <S.PromptMedia>
              <ShouldRender if={prompt?.media.toLowerCase().endsWith("mp4")}>
                <S.PromptVideo src={`${prompt?.media}#t=0.3`} controls />
              </ShouldRender>
              <ShouldRender if={!prompt?.media.toLowerCase().endsWith("mp4")}>
                <AppImageViewer src={prompt?.media} alt="Prompt media">
                  <S.CardBackground
                    banner={prompt?.media || ""}
                    className="image"
                  />
                </AppImageViewer>
              </ShouldRender>
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
            <S.StyledDate>{toFormattedDate(prompt?.createdOn)}</S.StyledDate>
          </S.FooterContainer>
        </Flex>
      </>
    ));
  };

  return (
    <S.MuseContainer>
      <S.Banner
        src={
          (muse?.useExtraImages && getSafeImage(muse?.wallpaper?.src)) ||
          getSafeImage(muse?.image || "")
        }
        filterValues={
          muse?.useExtraImages
            ? (muse?.wallpaper?.filterValues ?? {
                blur: 20,
                brightness: 50,
                greyscale: 20,
              })
            : {
                blur: 20,
                brightness: 50,
                greyscale: 20,
              }
        }
      />
      <S.CardWrapper
        // hoverable={is("MAIN")}
        className={classNames({ closed: is("MAIN"), open: !is("MAIN") })}
      >
        <S.CardBackground
          banner={
            (muse?.useExtraImages && getSafeImage(muse?.cardBackground?.src)) ||
            getSafeImage(muse?.image || "")
          }
        />
        <S.Card className="muse-card">
          <S.CardHeader>
            <S.MuseInfo>
              <S.MuseName>
                {muse?.firstName} <br />
                {muse?.lastName}
              </S.MuseName>
              <S.AuthorContainer>
                {/* <AvatarNew
                  className="selectable"
                  src={muse?.pennedBy?.image ?? null}
                  alt={muse?.pennedBy.username ?? "Author Avatar"}
                  onClick={onAuthorAvatarClick}
                /> */}
                <S.UsernameContainer>
                  <span className="penned">PENNED BY:</span>
                  <Username
                    username={muse?.pennedBy?.username}
                    accentOverride={
                      (muse?.useAccent && muse?.accent) || undefined
                    }
                    primary
                  />
                </S.UsernameContainer>
              </S.AuthorContainer>
            </S.MuseInfo>
          </S.CardHeader>
        </S.Card>
      </S.CardWrapper>
      <ShouldRender if={is("MUSE_INFO")}>
        <S.CardExpandedWrapper>
          <S.CardBack
            className="muse-card"
            accent={muse?.useAccent ? muse?.accent : undefined}
          >
            <S.InfoCardContent>
              <S.InfoPrivacyCorner>
                <PrivacyIcon privacy={muse?.privacy ?? "PUBLIC"} />
              </S.InfoPrivacyCorner>
              <S.InfoScrollBody
                accent={muse?.useAccent ? muse?.accent : undefined}
              >
                {/* Name + Nicknames */}
                <S.InfoHeaderSection>
                  <S.InfoMuseName>
                    {muse?.firstName}
                    {muse?.lastName ? ` ${muse.lastName}` : ""}
                  </S.InfoMuseName>
                  <ShouldRender if={Boolean(muse?.nicknames?.length)}>
                    <S.InfoNicknamesRow>
                      {muse?.nicknames?.map((n) => (
                        <S.InfoNicknamePill key={n}>{n}</S.InfoNicknamePill>
                      ))}
                    </S.InfoNicknamesRow>
                  </ShouldRender>
                </S.InfoHeaderSection>

                {/* Fandom */}
                <ShouldRender if={muse?.fandom !== null}>
                  <S.InfoFandomSection>
                    <S.FandomValue color={muse?.fandom?.color || "#444"}>
                      {muse?.fandom?.name}
                    </S.FandomValue>
                  </S.InfoFandomSection>
                </ShouldRender>

                {/* Extra Attributes */}
                <ShouldRender
                  if={Boolean(
                    muse?.extraAttributes &&
                      Object.keys(muse.extraAttributes).length > 0,
                  )}
                >
                  <S.InfoAttributesGrid>
                    {muse?.extraAttributes &&
                      Object.entries(muse.extraAttributes).map(
                        ([key, value]) => (
                          <S.InfoAttributeCard
                            key={key}
                            accent={muse?.useAccent ? muse?.accent : undefined}
                          >
                            <S.InfoAttributeKey>{key}</S.InfoAttributeKey>
                            <S.InfoAttributeValue>{value}</S.InfoAttributeValue>
                          </S.InfoAttributeCard>
                        ),
                      )}
                  </S.InfoAttributesGrid>
                </ShouldRender>

                {/* Tags */}
                {/* <ShouldRender
                  if={
                    muse?.tags?.length !== undefined && muse?.tags?.length > 0
                  }
                >
                  <S.InfoTagsSection>
                    <TagsContainer tags={muse?.tags} />
                  </S.InfoTagsSection>
                </ShouldRender> */}
              </S.InfoScrollBody>
            </S.InfoCardContent>
          </S.CardBack>
        </S.CardExpandedWrapper>
      </ShouldRender>
      <ShouldRender if={is("CONNECTIONS")}>
        <S.CardExpandedWrapper>
          <S.CardBack
            className="muse-card"
            accent={muse?.useAccent ? muse?.accent : undefined}
          >
            <S.InfoCardContent>
              <S.Title>Connections</S.Title>
              <S.ConnectionsContainer>
                <S.ScrollableContent
                  accent={muse?.useAccent ? muse?.accent : undefined}
                >
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
          <S.CardBack
            className="muse-card"
            accent={muse?.useAccent ? muse?.accent : undefined}
          >
            <S.InfoCardContent>
              <S.Title>Story</S.Title>
              <S.ScrollableContent
                accent={muse?.useAccent ? muse?.accent : undefined}
              >
                <ShouldRender
                  if={
                    muse?.note?.length !== undefined && muse?.note?.length > 0
                  }
                >
                  <S.NoteContainer>
                    <Quote>{muse?.note}</Quote>
                  </S.NoteContainer>
                </ShouldRender>
                <ShouldRender
                  if={Boolean(aboutSections && aboutSections.length > 0)}
                >
                  {aboutSections?.map((section, index) => (
                    <div key={section.id ?? `about-section-${index}`}>
                      {section.image && (
                        <AppImageViewer
                          src={section.image}
                          alt="Section attachment"
                        >
                          <S.AboutSectionImage
                            src={section.image}
                            alt="Section attachment"
                          />
                        </AppImageViewer>
                      )}
                      <RichTextRenderer
                        savedText={section.text || ""}
                        overlayHidden
                        disableCollapse
                      />
                    </div>
                  ))}
                </ShouldRender>
              </S.ScrollableContent>
            </S.InfoCardContent>
          </S.CardBack>
        </S.CardExpandedWrapper>
      </ShouldRender>
      {/* <ShouldRender if={is("VIDEO")}>
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
      </ShouldRender> */}
      <ShouldRender if={is("PROMPTS")}>
        <S.CardExpandedWrapper>
          <S.CardBack
            className="muse-card"
            accent={muse?.useAccent ? muse?.accent : undefined}
          >
            <S.InfoCardContent>
              <S.Title>Prompts</S.Title>
              <S.ScrollableContent
                accent={muse?.useAccent ? muse?.accent : undefined}
              >
                {loadPrompts()}
              </S.ScrollableContent>
            </S.InfoCardContent>
          </S.CardBack>
        </S.CardExpandedWrapper>
      </ShouldRender>
      <S.SideMenu>
        {/* <ShouldRender if={muse?.video != null && muse?.video !== ""}>
          <S.MenuButton>
            <S.MenuButtonIcon
              onClick={() => transition("VIDEO")}
              className={classNames({ selected: is("VIDEO") })}
              accent={muse?.useAccent ? muse?.accent : undefined}
            >
              <MdOutlineSlowMotionVideo size={"45%"} />
            </S.MenuButtonIcon>
            <S.MenuText>VIDEO</S.MenuText>
          </S.MenuButton>
        </ShouldRender> */}
        <S.MenuButton>
          <S.MenuButtonIcon
            onClick={() => transition("PROMPTS")}
            className={classNames({ selected: is("PROMPTS") })}
            accent={muse?.useAccent ? muse?.accent : undefined}
          >
            <BiSolidMessageEdit size={"45%"} />
          </S.MenuButtonIcon>
          <S.MenuText>PROMPTS</S.MenuText>
        </S.MenuButton>
        <S.MenuButton>
          <S.MenuButtonIcon
            onClick={() => transition("MUSE_INFO")}
            className={classNames({ selected: is("MUSE_INFO") })}
            accent={muse?.useAccent ? muse?.accent : undefined}
          >
            <TiInfoLarge size={"45%"} />
          </S.MenuButtonIcon>
          <S.MenuText>INFO</S.MenuText>
        </S.MenuButton>
        <S.MenuButton>
          <S.MenuButtonIcon
            onClick={() => transition("BACK_STORY")}
            className={classNames({ selected: is("BACK_STORY") })}
            accent={muse?.useAccent ? muse?.accent : undefined}
          >
            <GiBookCover size={"45%"} />
          </S.MenuButtonIcon>
          <S.MenuText>STORY</S.MenuText>
        </S.MenuButton>
        {/* <S.MenuButton>
          <S.MenuButtonIcon
            onClick={() => transition("CONNECTIONS")}
            className={classNames({ selected: is("CONNECTIONS") })}
            accent={muse?.useAccent ? muse?.accent : undefined}
          >
            <BsFillPeopleFill size={"45%"} />
          </S.MenuButtonIcon>
          <S.MenuText>RELATIONS</S.MenuText>
        </S.MenuButton> */}
        <ShouldRender if={!is("MAIN")}>
          <S.MenuButton className="stick-top">
            <S.MenuButtonIcon
              onClick={() => {
                transition("MAIN");
              }}
              accent={muse?.useAccent ? muse?.accent : undefined}
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
              accent={muse?.useAccent ? muse?.accent : undefined}
            >
              <FiMoreVertical size={"45%"} />
            </S.MenuButtonIcon>
          </S.MenuButton>
        </ShouldRender>
      </S.SideMenu>
    </S.MuseContainer>
  );
}
