import { Form } from "radix-ui";
import { type FC, type HTMLProps, useMemo } from "react";
import type { SubmitPromptType } from "@/types";
import { useEventThreadInputState } from "./event-thread-input.store";
import * as S from "./styles";

type PromptInputButtonProps = HTMLProps<HTMLButtonElement> & {
  loading?: boolean;
};

export const SendButton: FC<PromptInputButtonProps> = ({
  loading,
  ...rest
}) => {
  const mediaUploading = useEventThreadInputState("mediaUploading");
  const mediaUploadError = useEventThreadInputState("mediaUploadError");
  const promptType = useEventThreadInputState("type");

  const disabled = useMemo(() => {
    return mediaUploading || Boolean(mediaUploadError) || loading;
  }, [mediaUploading, mediaUploadError, loading]);

  const buttonText = useMemo(() => {
    if (loading) {
      return "Sending...";
    }

    if (mediaUploading) {
      return "Uploading attachment...";
    }

    return "Send";
  }, [promptType, mediaUploading, loading]);

  return (
    <Form.Submit asChild>
      <S.SubmitButton
        className="send-button"
        disabled={disabled}
        {...rest}
        type="submit"
      >
        {buttonText}
      </S.SubmitButton>
    </Form.Submit>
  );
};
