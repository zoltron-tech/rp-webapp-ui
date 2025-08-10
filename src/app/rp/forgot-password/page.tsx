"use client";

import { Form, Separator } from "radix-ui";
import { MdArrowBackIosNew } from "react-icons/md";
import Link from "next/link";
import { MouseEventHandler, useCallback, useMemo, useState } from "react";
import { IoIosInformationCircleOutline, IoMdCheckmark } from "react-icons/io";
import * as S from "./styled";

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);

  const headingText = useMemo(() => {
    return success ? "Email Sent" : "Reset your password";
  }, [success]);

  const descriptionText = useMemo(() => {
    return success
      ? "Please check your email for the reset link."
      : "Enter your email address below, and we will send you a link to reset your password.";
  }, [success]);

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      event.preventDefault();
      // Simulate sending reset email
      setSuccess(true);
    },
    []
  );

  return (
    <S.PageRoot>
      <S.FormContainer>
        <Separator.Root className="separator" orientation="horizontal" />
        <Form.Root>
          <S.FormHeading>
            {success ? <IoMdCheckmark /> : null}
            <h1>{headingText}</h1>
          </S.FormHeading>
          <S.FormDescription>{descriptionText}</S.FormDescription>

          {!success && (
            <>
              <Form.Field className="field" name="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  aria-label="email"
                  name="email"
                  type="email"
                  required
                />
              </Form.Field>
              <Form.Submit onClick={handleSubmit} type="submit">
                Send reset email
              </Form.Submit>
            </>
          )}

          {success && (
            <S.InfoBox>
              <div>
                <IoIosInformationCircleOutline />
                Next steps
              </div>

              <p>
                Please check your inbox and follow the instructions to reset
                your password.
              </p>

              <p>
                <strong>Tip: </strong>
                If you do not receive the email, please check your spam folder
                or try again.
              </p>
            </S.InfoBox>
          )}

          <S.BackLinkContainer>
            {success ? (
              <Link href="/rp/novelists" tabIndex={0}>
                <MdArrowBackIosNew />
                Back to home
              </Link>
            ) : (
              <Link href="/rp/login" tabIndex={0}>
                <MdArrowBackIosNew />
                Back to login
              </Link>
            )}
          </S.BackLinkContainer>
        </Form.Root>
      </S.FormContainer>
    </S.PageRoot>
  );
}
