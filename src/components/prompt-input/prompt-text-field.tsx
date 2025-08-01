import { Form } from "radix-ui";
import { FC, useCallback, useRef } from "react";
import * as S from "./styles";
import { PromptEvent, useRunOn } from "./helpers";

export const PromptTextField: FC = () => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const handleClear = useCallback(() => {
    if (textAreaRef.current) {
      textAreaRef.current.value = "";
    }
  }, []);

  useRunOn([PromptEvent.Sent], handleClear);

  return (
    <S.TextInputContainer name="promptText">
      <Form.Control asChild>
        <textarea ref={textAreaRef} className="text-area" required autoFocus />
      </Form.Control>
      <Form.Message className="form-message" match="valueMissing">
        Prompt cannot be empty
      </Form.Message>
    </S.TextInputContainer>
  );
};
