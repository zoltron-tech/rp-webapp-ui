import { Form } from "radix-ui";
import { FC, useCallback, useState } from "react";
import * as S from "./styled";
import { checkUsernameAvailability } from "@/app/actions";

export const RegisterForm: FC = () => {
  const [usernameValidityLoader, setUsernameValidityLoader] = useState(false);

  const usernameCheck = useCallback(async (value: string) => {
    setUsernameValidityLoader(true);
    const available = await checkUsernameAvailability(value);
    setUsernameValidityLoader(false);
    console.log("Username availability:", available);
    if (!available) return true;
    return false;
  }, []);

  const onFormChange = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      const form = event.currentTarget;
      const usernameField = form.elements.namedItem(
        "username"
      ) as HTMLInputElement;
      if (usernameField) {
        usernameCheck(usernameField.value);
      }
    },
    [setUsernameValidityLoader]
  );

  return (
    <Form.Root onChange={onFormChange}>
      <Form.Field className="field" name="username">
        <S.FieldHeader>
          <Form.Label>Username</Form.Label>
          <Form.Message
            className="label-message"
            match={(value) => value.length < 3}
          >
            must be at least 3 characters long
          </Form.Message>
          <Form.Message className="label-message" match={usernameCheck}>
            username is taken
          </Form.Message>
          <Form.Message
            className="label-message"
            match={() => usernameValidityLoader}
          >
            Checking username availability...
          </Form.Message>
        </S.FieldHeader>
        <Form.Control
          aria-label="Username"
          name="username"
          type="text"
          required
        />
      </Form.Field>
      <Form.Field className="field" name="email">
        <Form.Label>Email</Form.Label>
        <Form.Control aria-label="email" name="email" type="email" required />
      </Form.Field>
      <Form.Field className="field" name="password">
        <Form.Label>Password</Form.Label>
        <Form.Control
          aria-label="Password"
          name="password"
          type="password"
          required
        />
      </Form.Field>
      <Form.Field className="field" name="confirmPassword">
        <Form.Label>Confirm password</Form.Label>
        <Form.Control
          aria-label="Confirm password"
          name="confirmPassword"
          type="password"
          required
        />
      </Form.Field>
      <Form.Submit type="submit">Register</Form.Submit>
    </Form.Root>
  );
};
