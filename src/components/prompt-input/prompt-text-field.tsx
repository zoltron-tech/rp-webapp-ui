import { Form } from "radix-ui";
import { FC } from "react";
import * as S from "./styles";

export const PromptTextField: FC = () => {
  return (
    <S.TextInputContainer name="promptText">
      <Form.Control asChild>
        <textarea className="text-area" required autoFocus />
      </Form.Control>
      <Form.Message className="form-message" match="valueMissing">
        Prompt cannot be empty
      </Form.Message>
    </S.TextInputContainer>
  );
};
