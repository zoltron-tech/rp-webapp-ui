import { Form } from "radix-ui";
import { FC, useCallback, useMemo, useState } from "react";
import * as S from "./styled";
import { checkUsernameAvailability } from "@/app/actions";
import Link from "next/link";
import { UpdatePasswordFields } from "@/components/common/update-password-fields";

export const RegisterForm: FC = () => {
  const [usernameValidityLoader, setUsernameValidityLoader] = useState(false);
  const [userConsent, setUserConsent] = useState(false);
  const [passwordsValid, setPasswordsValid] = useState(false);

  const valid = useMemo(() => {
    return passwordsValid && userConsent;
  }, [passwordsValid, userConsent]);

  const usernameCheck = useCallback(async (value: string) => {
    setUsernameValidityLoader(true);
    const available = await checkUsernameAvailability(value);
    setUsernameValidityLoader(false);
    console.log("Username availability:", available);
    if (!available) return true;
    return false;
  }, []);

  const onConsentChange = useCallback(() => {
    setUserConsent((prev) => !prev);
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
      <UpdatePasswordFields setValid={setPasswordsValid} />
      <Form.Field className="field checkbox" name="consent">
        <Form.Control
          aria-label="Consent"
          type="checkbox"
          required
          checked={userConsent}
          onChange={onConsentChange}
        />
        <Form.Label>
          I agree to the <Link href="/terms">Terms of Service</Link> and&nbsp;
          <Link href="/privacy">Privacy Policy</Link>.
        </Form.Label>
      </Form.Field>
      <Form.Submit className="submit-button" type="submit" disabled={!valid}>
        Register
      </Form.Submit>
    </Form.Root>
  );
};
