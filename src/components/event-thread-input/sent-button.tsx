"use client";

import { Form } from "radix-ui";
import { type FC, type HTMLProps, useMemo } from "react";
import { HiPaperAirplane } from "react-icons/hi2";
import { useEventThreadInputState } from "./event-thread-input.store";
import * as S from "./styles";

type PromptInputButtonProps = HTMLProps<HTMLButtonElement> & {
  loading?: boolean;
};

export const SendButton: FC<PromptInputButtonProps> = ({
  loading,
  ...rest
}) => {
  const threadId = useEventThreadInputState("threadId");
  const promptText = useEventThreadInputState("promptText");

  // Only surface the button once there's something worth submitting.
  const hasContent = useMemo(() => {
    const t = (promptText ?? "").trim();
    return t !== "" && t !== "<br>";
  }, [promptText]);

  const label = loading ? "Sending..." : threadId ? "Update" : "Send";

  return (
    <Form.Submit asChild>
      <S.SubmitButton
        className="send-button"
        $visible={hasContent}
        disabled={loading}
        title={label}
        aria-label={label}
        {...rest}
        type="submit"
      >
        <HiPaperAirplane size={18} />
      </S.SubmitButton>
    </Form.Submit>
  );
};
