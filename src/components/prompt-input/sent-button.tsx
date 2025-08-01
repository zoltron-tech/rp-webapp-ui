import { Form } from "radix-ui";
import { FC, HTMLProps, useMemo } from "react";
import * as S from "./styles";
import { SubmitPromptType } from "@/types";
import { usePromptInputState } from "./prompt-input.store";

const promptTypeToButtonText = (type: SubmitPromptType): string => {
  switch (type) {
    case "prompt":
      return "Post";
    case "reply":
      return "Reply";
    case "comment":
      return "Comment";
    default:
      return "Send";
  }
};

type PromptInputButtonProps = HTMLProps<HTMLButtonElement> & {
  loading?: boolean;
};

export const SendButton: FC<PromptInputButtonProps> = ({
  loading,
  ...rest
}) => {
  const mediaUploading = usePromptInputState("mediaUploading");
  const mediaUploadError = usePromptInputState("mediaUploadError");
  const promptType = usePromptInputState("type");

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

    return promptTypeToButtonText(promptType);
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
