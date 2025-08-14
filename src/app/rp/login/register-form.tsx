import { Form } from "radix-ui";
import { FC, FormEventHandler, useCallback, useMemo, useState } from "react";
import * as S from "./styled";
import { checkUsernameAvailability, signupAction } from "@/app/actions";
import Link from "next/link";
import { UpdatePasswordFields } from "@/components/common/update-password-fields";
import { LoaderAction } from "@/components/common/loader-action";

export const RegisterForm: FC = () => {
  const [usernameValidityLoader, setUsernameValidityLoader] = useState(false);
  const [userConsent, setUserConsent] = useState(false);
  const [passwordsValid, setPasswordsValid] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const username = formData.get("username") as string;
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const consent = formData.get("consent") as string;
      console.log("Form data:", {
        username,
        email,
        password,
        consent,
      });

      if (consent !== "on") {
        console.error("User must agree to the terms and conditions.");
        return;
      }
      setLoading(true);

      const response = await signupAction({
        username,
        email,
        password,
      });

      console.log("Signup response:", response);
      setLoading(false);

      // Handle form submission logic here
    },
    []
  );

  return (
    <Form.Root onSubmit={handleSubmit}>
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
          disabled={loading}
          required
          autoFocus
        />
      </Form.Field>
      <Form.Field className="field" name="email">
        <S.FieldHeader>
          <Form.Label>Email</Form.Label>
          <Form.Message className="label-message" match={"typeMismatch"}>
            must be a valid email address
          </Form.Message>
        </S.FieldHeader>
        <Form.Control
          aria-label="email"
          name="email"
          type="email"
          disabled={loading}
          required
        />
      </Form.Field>
      <UpdatePasswordFields setValid={setPasswordsValid} disabled={loading} />
      <Form.Field className="field checkbox" name="consent">
        <Form.Control
          aria-label="Consent"
          type="checkbox"
          disabled={loading}
          checked={userConsent}
          onChange={onConsentChange}
          required
        />
        <Form.Label>
          I agree to the
          <Link href="/rp/terms">&nbsp;Terms of Service&nbsp;</Link>
          and
          <Link href="/rp/privacy-policy">&nbsp;Privacy Policy&nbsp;</Link>.
        </Form.Label>
      </Form.Field>
      <Form.Submit
        className="submit-button"
        type="submit"
        disabled={!valid || loading}
      >
        <LoaderAction
          text="Register"
          loadingText="Registering..."
          loading={loading}
        />
      </Form.Submit>
    </Form.Root>
  );
};
