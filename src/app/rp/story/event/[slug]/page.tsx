"use client";
import { Flex } from "@novelist-world/ui";
import classNames from "classnames";
import { useParams } from "next/navigation";
import { Separator } from "radix-ui";
import { useEffect, useState } from "react";
import { BsCalendar2Date } from "react-icons/bs";
import { IoArrowBackOutline } from "react-icons/io5";
import { TfiLocationPin } from "react-icons/tfi";
import { Divider } from "@/app/rp/tiers/styles";
import EventThreadInput from "@/components/event-thread-input";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import type {
  StoryBoard,
  StoryBoardEvent,
  StoryBoardEventThread,
} from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import { toFormattedDate } from "@/utils/helpers";
import {
  getStoryboardAction,
  getStoryboardEventAction,
  getStoryboardEventThreadsAction,
} from "../../actions";
import * as S from "./styles";

export default function StoryboardEventPage({}) {
  const params = useParams();
  const authState = useGlobalState("authState");

  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");

  const [storyboard, setStoryBoard] = useState<StoryBoard | null>(null);
  const [storyboardEvent, setStoryBoardEvent] =
    useState<StoryBoardEvent | null>(null);
  const [storyboardEventThreads, setStoryBoardEventThreads] = useState<
    StoryBoardEventThread[]
  >([]);
  const storyboardEventId = params?.slug as string;
  const { routeToPage, baseDataLoader } = usePageRouter();

  const onBackClick = () => {
    if (!storyboardEvent?.storyBoardId) return;
    routeToPage(ROUTES.Story.View(storyboardEvent.storyBoardId));
  };

  const fetchStoryboard = async (storyboardId: string) => {
    const _storyboard = await baseDataLoader(() =>
      getStoryboardAction(storyboardId),
    );
    setStoryBoard(_storyboard);
  };

  const fetchStoryboardEvent = async () => {
    const _storyboardEvent = await baseDataLoader(() =>
      getStoryboardEventAction(storyboardEventId),
    );
    setStoryBoardEvent(_storyboardEvent);
    if (_storyboardEvent !== null)
      fetchStoryboard(_storyboardEvent.storyBoardId);
  };

  const fetchStoryboardEventThreads = async () => {
    const _storyboardEventThreads = await baseDataLoader(() =>
      getStoryboardEventThreadsAction(storyboardEventId),
    );
    if (_storyboardEventThreads !== null)
      setStoryBoardEventThreads(_storyboardEventThreads);
  };

  useEffect(() => {
    if (authState === "LOADING" || storyboardEvent) return;

    fetchStoryboardEvent();
    fetchStoryboardEventThreads();
  }, [authState]);

  const loadMembers = () => {
    if (storyboard?.members.length === 0) return <></>;
    return storyboard?.members.map((member) => (
      <>
        <S.Avatar src={member?.image ?? null} alt={""} size={40} />
      </>
    ));
  };

  const loadThreads = () => {
    if (storyboardEventThreads.length === 0) return <></>;
    return storyboardEventThreads.map((thread) => (
      <>
        <Flex direction="column" gap={0} style={{ marginBottom: "10px" }}>
          {thread.type === "DIALOGUE" && (
            <Flex>
              <Flex direction="column" gap={0}>
                {thread?.attachments.map((attachment) => (
                  <S.CardWrapper
                    key={attachment.id}
                    className={classNames("reply")}
                  >
                    <S.CardBackground
                      banner={attachment.url || ""}
                      className="image"
                    />
                  </S.CardWrapper>
                ))}
                <Flex justify="center" align="flex-start" gap={10}>
                  <S.Avatar
                    src={thread.sender?.image ?? null}
                    alt={""}
                    size={50}
                  />
                  <Flex direction="column">
                    <S.DialoguetText>❝ {thread.message} ❞</S.DialoguetText>
                    <S.MuseName>{thread.sender.name}</S.MuseName>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          )}

          {thread.type === "NARRATION" && (
            <Flex direction="column">
              <S.PromptText>{thread.message}</S.PromptText>
              <S.AuthorName>{thread.sender.name}</S.AuthorName>
            </Flex>
          )}
          <Flex
            direction="row"
            justify="space-between"
            style={{ width: "70%" }}
          >
            <div></div>
            {/* <S.Date>{toFormattedDate(thread.createdAt)}</S.Date> */}
          </Flex>
        </Flex>
      </>
    ));
  };

  return (
    <S.ParentContainer className={classNames([accent, theme])}>
      <S.RepliesContainer>
        <S.HeaderContainer>
          <Flex>
            <IoArrowBackOutline
              size={30}
              onClick={() => onBackClick()}
              style={{ cursor: "pointer" }}
            />
            <S.Name onClick={() => onBackClick()} style={{ cursor: "pointer" }}>
              {storyboard?.name}
            </S.Name>
            <S.HeaderInfoFlex>
              {loadMembers()} {/*<CiCircleMore size={48} /> */}
            </S.HeaderInfoFlex>
          </Flex>
        </S.HeaderContainer>
        <Flex direction="column" style={{ marginBottom: 20 }}>
          {storyboardEvent?.image && (
            <S.CardWrapper>
              <S.CardBackground
                banner={storyboardEvent?.image || ""}
                className="image"
              />
            </S.CardWrapper>
          )}
          <S.Name>{storyboardEvent?.name}</S.Name>
          <Flex gap={5}>
            <BsCalendar2Date />
            <S.StyledDate>
              {toFormattedDate(storyboardEvent?.eventTime || "")}
            </S.StyledDate>
          </Flex>
          <Flex gap={5}>
            <TfiLocationPin />
            <S.StyledDate>{storyboardEvent?.location}</S.StyledDate>
          </Flex>
          <S.PromptText>{storyboardEvent?.description}</S.PromptText>
          <Divider></Divider>
          <Flex
            direction="row"
            justify="space-between"
            style={{ width: "70%" }}
          >
            <div></div>
          </Flex>
        </Flex>
        {loadThreads()}
        {authState === "LOGGED_IN" && (
          <>
            <Separator.Root className="separator" orientation="horizontal" />
            <EventThreadInput storyBoardEventId={storyboardEventId} />
          </>
        )}
      </S.RepliesContainer>
    </S.ParentContainer>
  );
}
