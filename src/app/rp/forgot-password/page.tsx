"use client";

import { ShouldRender } from "@novelist-world/ui";
import classNames from "classnames";
import Link from "next/link";
import { Form } from "radix-ui";
import { type FormEventHandler, useCallback, useMemo, useState } from "react";
import { CgClose } from "react-icons/cg";
import {
  IoIosInformationCircleOutline,
  IoIosWarning,
  IoMdCheckmark,
} from "react-icons/io";
import { MdArrowBackIosNew } from "react-icons/md";
import { TbError404 } from "react-icons/tb";
import { forgotPasswordAction } from "@/app/actions";
import { useGlobalStoreSet } from "@/context/store/stores";
import { API_MESSAGE } from "@/utils/constants";
import { SUPPORT_EMAIL, SUPPORT_EMAIL_URL } from "@/utils/constants/common";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styled";

type OperationState = "INITIAL" | "SUCCESS" | "ERROR" | "NOT_FOUND";

type ContentType = {
  icon: React.ReactNode | null;
  headingText: string;
  descriptionText: string | ((email: string) => string);
};

type InfoBoxContentType = {
  icon: React.ReactNode;
  headingText: string;
  descriptionText: string;
  extra: React.ReactNode | null;
} | null;

const InfoBoxContent: Record<OperationState, InfoBoxContentType> = {
  ERROR: {
    descriptionText: "There was an issue while processing your request.",
    extra: (
      <p>
        <strong>Tip: </strong>
        If the issue persists, please contact support at&nbsp;
        <a href={SUPPORT_EMAIL_URL}>{SUPPORT_EMAIL}</a>. We apologize for the
        inconvenience.
      </p>
    ),
    headingText: "Something went wrong",
    icon: <IoIosInformationCircleOutline />,
  },
  INITIAL: null,
  NOT_FOUND: {
    descriptionText:
      "The email address you entered does not match any account.",
    extra: (
      <p>
        <strong>Tip: </strong>
        If you believe this is an error, please contact support at&nbsp;
        <a href={SUPPORT_EMAIL_URL}>{SUPPORT_EMAIL}</a>.
      </p>
    ),
    headingText: "Email not found",
    icon: <IoIosWarning />,
  },
  SUCCESS: {
    descriptionText:
      "Please check your inbox and follow the instructions to reset your password.",
    extra: (
      <p>
        <strong>Tip: </strong>
        If you do not receive the email, please check your spam folder or try
        again.
      </p>
    ),
    headingText: "Next steps",
    icon: <IoIosInformationCircleOutline />,
  },
};

const Content: Record<OperationState, ContentType> = {
  ERROR: {
    descriptionText: "Sorry but we could not process your request.",
    headingText: "Error",
    icon: <CgClose className="error" />,
  },
  INITIAL: {
    descriptionText:
      "Enter your email address below, and we will send you a link to reset your password.",
    headingText: "Reset your password",
    icon: null,
  },
  NOT_FOUND: {
    descriptionText: (email) =>
      `The email address ${email} does not match any account.`,
    headingText: "Email not found",
    icon: <TbError404 className="warning" />,
  },
  SUCCESS: {
    descriptionText: "Please check your email for the reset link.",
    headingText: "Email sent",
    icon: <IoMdCheckmark className="success" />,
  },
};

export default function ForgotPasswordPage() {
  const [operationState, setOperationState] =
    useState<OperationState>("INITIAL");
  const [email, setEmail] = useState<string>("");
  const [submittedEmail, setSubmittedEmail] = useState<string>("");

  const content = useMemo(() => {
    return Content[operationState];
  }, [operationState]);

  const infoBoxContent = useMemo(() => {
    return InfoBoxContent[operationState];
  }, [operationState]);

  const buttonText = useMemo(() => {
    if (operationState === "NOT_FOUND") return "Resend email";

    return "Send reset email";
  }, [operationState]);

  const globalStoreSet = useGlobalStoreSet();

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);

      console.log("Submitting forgot password request for:", formData);

      const email = formData.get("userEmail") as string;
      console.log("Submitting forgot password request for:", email);

      if (!email) return;

      console.log("Submitting forgot password request for:", email);

      setOperationState("INITIAL");
      globalStoreSet({ globalLoading: true });
      const response = await forgotPasswordAction(email);
      if (response.message === API_MESSAGE.NotFound) {
        setOperationState("NOT_FOUND");
        setSubmittedEmail(email);
        globalStoreSet({ globalLoading: false });
        return;
      }

      if (response.message === API_MESSAGE.UncategorizedError) {
        setOperationState("ERROR");
        globalStoreSet({ globalLoading: false });
        return;
      }

      setOperationState("SUCCESS");
      globalStoreSet({ globalLoading: false });
    },
    [setOperationState, globalStoreSet],
  );

  return (
    <S.PageRoot>
      <S.FormContainer>
        <Form.Root onSubmit={handleSubmit}>
          <S.FormHeading>
            {content.icon}
            <h1>{content.headingText}</h1>
          </S.FormHeading>
          <S.FormDescription>
            {typeof content.descriptionText === "function"
              ? content.descriptionText(submittedEmail)
              : content.descriptionText}
          </S.FormDescription>

          {infoBoxContent && (
            <S.InfoBox
              className={classNames("info-box", operationState.toLowerCase())}
            >
              <div>
                {infoBoxContent.icon}
                {infoBoxContent.headingText}
              </div>

              <p>{infoBoxContent.descriptionText}</p>

              {infoBoxContent.extra}
            </S.InfoBox>
          )}

          <ShouldRender
            if={(["NOT_FOUND", "INITIAL"] as OperationState[]).includes(
              operationState,
            )}
          >
            <Form.Field className="field" name="userEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                aria-label="email"
                name="userEmail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Field>
            <Form.Submit type="submit">{buttonText}</Form.Submit>
          </ShouldRender>

          <S.BackLinkContainer>
            {(["NOT_FOUND", "INITIAL"] as OperationState[]).includes(
              operationState,
            ) ? (
              <Link href={ROUTES.Login} tabIndex={0}>
                <MdArrowBackIosNew />
                Back to login
              </Link>
            ) : (
              <Link href={ROUTES.Novelists} tabIndex={0}>
                <MdArrowBackIosNew />
                Back to home
              </Link>
            )}
          </S.BackLinkContainer>
        </Form.Root>
      </S.FormContainer>
    </S.PageRoot>
  );
}
