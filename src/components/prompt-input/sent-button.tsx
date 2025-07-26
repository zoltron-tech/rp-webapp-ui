import { Form } from "radix-ui";
import { FC } from "react";
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

export const SendButton: FC = () => {
  const mediaUploading = usePromptInputState("mediaUploading");
  const mediaUploadError = usePromptInputState("mediaUploadError");
  const promptType = usePromptInputState("type");
  return (
    <Form.Submit asChild>
      <S.SubmitButton
        type="submit"
        className="send-button"
        disabled={mediaUploading || Boolean(mediaUploadError)}
      >
        {mediaUploading
          ? "Uploading attachment..."
          : promptTypeToButtonText(promptType)}
      </S.SubmitButton>
    </Form.Submit>
  );
};
