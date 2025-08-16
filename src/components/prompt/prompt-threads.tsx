import classNames from "classnames";
import { Collapsible } from "radix-ui";
import { type FC, useMemo, useState } from "react";
import { useGlobalState } from "@/context/store/stores";
import { Comment } from "../comment";
import PromptInput from "../prompt-input";
import { useGetComments } from "./helpers";
import { usePromptState } from "./prompt.store";
import * as S from "./styled";

export const PromptThreads: FC = () => {
  const threadsOpen = usePromptState("threadOpen");
  const [open, setOpen] = useState(threadsOpen);

  const novelist = useGlobalState("novelist");
  const promptId = usePromptState("id");
  const canInteract = usePromptState("canInteract");
  const { comments, refetch: refetchComments } = useGetComments(promptId);

  const buttonText = useMemo(() => {
    if (open) return "Hide Threads";
    return "View Threads";
  }, [open]);

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} asChild>
      <S.PromptThreads.Root className={classNames({ open })}>
        <S.PromptThreads.Header>
          <S.PromptThreads.Right />
          <Collapsible.Trigger asChild>
            <S.PromptThreads.Toggle>{buttonText}</S.PromptThreads.Toggle>
          </Collapsible.Trigger>
          <S.PromptThreads.Left />
        </S.PromptThreads.Header>
        <Collapsible.Content>
          {canInteract && (
            <PromptInput
              className="comment-action"
              parentId={promptId}
              type="comment"
              muses={novelist?.muses ?? []}
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
        </Collapsible.Content>
      </S.PromptThreads.Root>
    </Collapsible.Root>
  );
};
