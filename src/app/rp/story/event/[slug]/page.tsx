"use client";

import * as S from "./styles";
import { useAuthContext } from "@/hooks";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { StoryBoard, StoryBoardEvent, StoryBoardEventThread } from "@/types";
import { PageLoader } from "@/components/layout";
import { toFormattedDate } from "@/utils/helpers";
import { ShouldRender, Flex } from "@novelist-world/ui";
import { IoArrowBackOutline } from "react-icons/io5";
import { TfiLocationPin } from "react-icons/tfi";
import { BsCalendar2Date } from "react-icons/bs";
import { CiCircleMore } from "react-icons/ci";

import {
  getStoryboardAction,
  getStoryboardEventAction,
  getStoryboardEventThreadsAction,
} from "../../actions";
import classNames from "classnames";
import { Divider } from "@/app/rp/tiers/styles";

export default function StoryboardEventPage({}) {
  const params = useParams();
  const { state: authState, novelist, state } = useAuthContext();
  const [storyboard, setStoryBoard] = useState<StoryBoard | null>(null);
  const [storyboardEvent, setStoryBoardEvent] =
    useState<StoryBoardEvent | null>(null);
  const [storyboardEventThreads, setStoryBoardEventThreads] = useState<
    StoryBoardEventThread[]
  >([]);
  const [loading, setLoading] = useState(true);
  const storyboardEventId = params?.slug as string;
  const { push } = useRouter();

  const onBackClick = () => {
    if (!storyboardEvent?.storyBoardId) return;
    push(`/rp/story/${storyboardEvent?.storyBoardId}`);
  };

  const fetchStoryboard = async (storyboardId: string) => {
    setLoading(true);
    const _storyboard = await getStoryboardAction(storyboardId);

    if (!_storyboard || "message" in _storyboard) {
      // handle error
      setLoading(false);
      push("/404");
      return;
    }
    setLoading(false);
    setStoryBoard(_storyboard);
  };

  const fetchStoryboardEvent = async () => {
    setLoading(true);
    console.log("going to fetch event");
    const _storyboardEvent = await getStoryboardEventAction(storyboardEventId);

    if (!_storyboardEvent || "message" in _storyboardEvent) {
      // handle error
      setLoading(false);
      push("/404");
      return;
    }
    setLoading(false);
    setStoryBoardEvent(_storyboardEvent);
    fetchStoryboard(_storyboardEvent.storyBoardId);
  };

  const fetchStoryboardEventThreads = async () => {
    setLoading(true);
    console.log("going to fetch event threads");
    const _storyboardEventThreads = await getStoryboardEventThreadsAction(
      storyboardEventId
    );

    if (!_storyboardEventThreads || "message" in _storyboardEventThreads) {
      // handle error
      setLoading(false);
      push("/404");
      return;
    }
    setLoading(false);
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
        <S.Avatar src={member?.image || ""} alt={""} size={40} />
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
                    src={thread.sender?.image || ""}
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
    <S.ParentContainer>
      <ShouldRender if={loading}>
        <PageLoader />
      </ShouldRender>
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
            <S.Date>{toFormattedDate(storyboardEvent?.eventTime || "")}</S.Date>
          </Flex>
          <Flex gap={5}>
            <TfiLocationPin />
            <S.Date>{storyboardEvent?.location}</S.Date>
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
        {/* {state === "LOGGED_IN" && (
          <Flex style={{ borderTop: "1px solid gray" }}>
            <PromptInput className="upward" muses={novelist?.muses || []} />
          </Flex>
        )} */}
      </S.RepliesContainer>
    </S.ParentContainer>
  );
}
