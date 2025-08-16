"use client";

import { ShouldRender } from "@novelist-world/ui";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Form } from "radix-ui";
import {
  type FormEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CgClose } from "react-icons/cg";
import { IoMdCheckmark } from "react-icons/io";
import {
  MdArrowBackIosNew,
  MdOutlineSentimentDissatisfied,
} from "react-icons/md";
import { PiPasswordDuotone, PiSpinnerGapLight } from "react-icons/pi";
import { resetPasswordAction } from "@/app/actions";
import { UpdatePasswordFields } from "@/components/common/update-password-fields";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { validateJWTSync } from "@/utils/helpers";
import * as S from "./styled";

type OperationState = "LOADING" | "INITIAL" | "SUCCESS" | "ERROR" | "EXPIRED";

type ContentType = {
  icon: React.ReactNode | null;
  headingText: string | null;
  descriptionText: string | null;
};

const Content: Record<OperationState, ContentType> = {
  ERROR: {
    descriptionText: "There was an error while resetting your password.",
    headingText: "Error resetting password",
    icon: <CgClose className="error" />,
  },
  EXPIRED: {
    descriptionText:
      "The token you provided has expired. Please request a new password reset.",
    headingText: "Token expired",
    icon: <MdOutlineSentimentDissatisfied className="warning" />,
  },
  INITIAL: {
    descriptionText:
      "Please enter your new password. Make sure it is strong and secure.",
    headingText: "Enter new password",
    icon: <PiPasswordDuotone className="with-background" />,
  },
  LOADING: {
    descriptionText: "Please wait while we process your request.",
    headingText: "Loading...",
    icon: <PiSpinnerGapLight className="loading" />,
  },
  SUCCESS: {
    descriptionText:
      "Your password has been reset successfully. You can now log in with your new password.",
    headingText: "Password reset successful",
    icon: <IoMdCheckmark className="success" />,
  },
};

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";
  const [operationState, setOperationState] =
    useState<OperationState>("LOADING");
  const [valid, setValid] = useState<boolean>(false);

  const content = useMemo(() => {
    return Content[operationState];
  }, [operationState]);

  const validateToken = useCallback(() => {
    const _validated = validateJWTSync(token);
    if (!_validated) {
      return false;
    }
    return true;
  }, [token]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirm") as string;

      if (!password || !confirmPassword) return;
      if (!valid) {
        setOperationState("ERROR");
        return;
      }
      setOperationState("LOADING");
      const response = await resetPasswordAction(token, password);
      if (response.message === API_MESSAGE.Unauthorized) {
        setOperationState("EXPIRED");
        return;
      }
      if (response.message === API_MESSAGE.UncategorizedError) {
        setOperationState("ERROR");
        return;
      }
      setOperationState("SUCCESS");
      setValid(false);
    },
    [token, valid, setOperationState],
  );

  useEffect(() => {
    if (!token) {
      setOperationState("ERROR");
      return;
    }
    const isValid = validateToken();
    if (!isValid) {
      setOperationState("EXPIRED");
      return;
    }
    setOperationState("INITIAL");
  }, [token]);

  return (
    <S.PageRoot>
      <S.FormContainer>
        <Form.Root onSubmit={handleSubmit}>
          <S.FormHeading>
            {content.icon}
            <h1>{content.headingText}</h1>
          </S.FormHeading>
          <S.FormDescription>{content.descriptionText}</S.FormDescription>
          <ShouldRender if={operationState === "INITIAL"}>
            <UpdatePasswordFields setValid={setValid} new />
            <Form.Submit
              className="submit-button"
              type="submit"
              disabled={!valid}
            >
              Reset Password
            </Form.Submit>
          </ShouldRender>

          <ShouldRender
            if={(["ERROR", "EXPIRED"] as OperationState[]).includes(
              operationState,
            )}
          >
            <S.ForwardLinkContainer>
              <Link href={ROUTES.ForgotPassword} tabIndex={0}>
                Send new reset link
                <MdArrowBackIosNew />
              </Link>
            </S.ForwardLinkContainer>
          </ShouldRender>
          <ShouldRender if={"SUCCESS" === operationState}>
            <S.ForwardLinkContainer>
              <Link href={ROUTES.Login} tabIndex={0}>
                Login with new password
                <MdArrowBackIosNew />
              </Link>
            </S.ForwardLinkContainer>
          </ShouldRender>
        </Form.Root>
      </S.FormContainer>
    </S.PageRoot>
  );
}
