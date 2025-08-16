import { Form } from "radix-ui";
import { type FC, useCallback, useRef } from "react";
import { PromptEvent, useRunOn } from "./helpers";
import * as S from "./styles";

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
        <textarea ref={textAreaRef} className="text-area" spellCheck required />
      </Form.Control>
      <Form.Message className="form-message" match="valueMissing">
        Prompt cannot be empty
      </Form.Message>
    </S.TextInputContainer>
  );
};
