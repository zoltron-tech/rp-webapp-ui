import { ShouldRender } from "@novelist-world/ui";
import classNames from "classnames";
import { Collapsible } from "radix-ui";
import { type FC, useMemo, useState } from "react";
import { useGlobalState } from "@/context/store/stores";
import type { PromptSource } from "@/types";
import { Comment } from "../comment";
import { AvatarNew } from "../common/avatar-new";
import { museToSource, novelistToSource } from "../event-thread-input/helpers";
import PromptInput from "../prompt-input";
import { useGetComments } from "./helpers";
import { usePromptState } from "./prompt.store";
import * as S from "./styled";

export const PromptThreads: FC = () => {
  const threadsOpen = usePromptState("threadOpen");
  const novelist = useGlobalState("novelist");
  const [open, setOpen] = useState(threadsOpen);
  const promptId = usePromptState("id");
  const promptSource = usePromptState("source");
  const authState = useGlobalState("authState");
  const canInteract = usePromptState("canInteract");
  const { comments, refetch: refetchComments } = useGetComments(promptId);

  const buttonText = useMemo(() => {
    return open
      ? "Hide Threads"
      : comments.length === 0
        ? "Start new thread"
        : "View Threads";
  }, [open, comments.length]);

  const isOOCPost = promptSource.sourceType === "NOVELIST";

  const initialSelection: PromptSource | undefined = useMemo(() => {
    if (!novelist) return undefined;

    const novelistSource = novelistToSource(novelist);
    const museSources = (novelist.muses ?? []).map(museToSource);

    // 1️⃣ If OOC post → always novelist
    if (isOOCPost) {
      return novelistSource;
    }

    if (museSources.length > 0) {
      return museSources[0];
    }

    // 4️⃣ Final fallback → novelist
    return novelistSource;
  }, [novelist, isOOCPost]);

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} asChild>
      <S.PromptThreads.Root className={classNames({ open })}>
        <S.PromptThreads.Header>
          <S.PromptThreads.LeftPre />
          <ShouldRender if={comments.length > 0}>
            <S.PromptThreads.Avatars>
              {comments.slice(0, 2).map((comment) => {
                const source = comment.source;
                if (!source) return null;

                return (
                  <AvatarNew
                    key={comment.id}
                    src={source.image}
                    alt={source.name}
                    style={{ cursor: "default" }}
                  />
                );
              })}
            </S.PromptThreads.Avatars>
            <ShouldRender if={comments.length === 1}>
              <S.PromptThreads.LeftPlaceholder />
            </ShouldRender>
          </ShouldRender>
          <ShouldRender if={comments.length === 0}>
            <S.PromptThreads.LeftMid />
          </ShouldRender>
          <S.PromptThreads.LeftPost />
          <Collapsible.Trigger asChild>
            <S.PromptThreads.Toggle $active={open}>
              {buttonText}{" "}
              <ShouldRender if={comments.length > 0}>
                <S.ThreadsCounter>{comments.length}</S.ThreadsCounter>
              </ShouldRender>
            </S.PromptThreads.Toggle>
          </Collapsible.Trigger>
          <S.PromptThreads.Right />
        </S.PromptThreads.Header>
        <S.PromptThreads.Content>
          {authState === "LOGGED_IN" && canInteract && (
            <PromptInput
              className="comment-action"
              initialSelection={initialSelection}
              dropdownSelection={isOOCPost ? "NOVELIST" : "MUSE"}
              parentId={promptId}
              type="comment"
              onSend={refetchComments}
            />
          )}
          {comments.map((comment, index) => (
            <Comment
              key={comment.id}
              comment={comment}
              hide-separator={!canInteract && index === 0}
            />
          ))}
        </S.PromptThreads.Content>
      </S.PromptThreads.Root>
    </Collapsible.Root>
  );
};
