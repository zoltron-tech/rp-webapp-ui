import { PasswordChecks } from "@/components/password-checks";
import { verifyPasswordPattern, verifyPasswordsMatch } from "@/utils/helpers";
import {
  Form,
  unstable_PasswordToggleField as PasswordToggleField,
} from "radix-ui";
import { FC, useState, ChangeEventHandler, useCallback } from "react";
import { PiEyeDuotone, PiEyeClosedLight } from "react-icons/pi";

import * as S from "./styled";

type ResetPasswordPageProps = {
  setValid: (valid: boolean) => void;
  new?: boolean; // Optional prop to indicate if this is for a new password
  disabled?: boolean; // Optional prop to disable the fields
};

const MAX_PASSWORD_LENGTH = 30;
export const UpdatePasswordFields: FC<ResetPasswordPageProps> = ({
  setValid,
  new: isNew = false, // Default to false if not provided
  disabled = false, // Default to false if not provided
}) => {
  const [password, setPasswordState] = useState<string>("");
  const [confirmPassword, setConfirmPasswordState] = useState<string>("");

  const setPassword: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const value = event.target.value;
      setPasswordState(value);
      const isValid = verifyPasswordPattern(value);
      setValid(isValid && verifyPasswordsMatch(value, confirmPassword));
    },
    [confirmPassword]
  );

  const setConfirmPassword: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const value = event.target.value;
      setConfirmPasswordState(value);
      const isValid = verifyPasswordPattern(value);
      setValid(isValid && verifyPasswordsMatch(value, password));
    },
    [password]
  );

  return (
    <>
      <S.FormField className="field" name="password">
        <S.FieldHeader>
          <Form.Label>{isNew ? "New password" : "Password"}</Form.Label>
          <span>
            ({password.length || 0} / {MAX_PASSWORD_LENGTH} characters)
          </span>
        </S.FieldHeader>
        <PasswordToggleField.Root>
          <div className="password-field-inner">
            <PasswordToggleField.Input
              id="new-password"
              className="input"
              aria-label={isNew ? "New password" : "Password"}
              name="password"
              value={password}
              onChange={setPassword}
              maxLength={MAX_PASSWORD_LENGTH}
              disabled={disabled}
              required
            />
            <PasswordToggleField.Toggle
              id="new-password-toggle"
              className="toggle"
            >
              <PasswordToggleField.Slot
                visible={<PiEyeDuotone />}
                hidden={<PiEyeClosedLight />}
              />
            </PasswordToggleField.Toggle>
          </div>
        </PasswordToggleField.Root>
      </S.FormField>
      <S.FormField className="field" name="confirm">
        <Form.Label>Confirm password</Form.Label>
        <PasswordToggleField.Root>
          <div className="password-field-inner">
            <PasswordToggleField.Input
              id="confirm-password"
              className="input"
              aria-label="Confirm Password"
              name="confirm"
              value={confirmPassword}
              onChange={setConfirmPassword}
              maxLength={MAX_PASSWORD_LENGTH}
              disabled={disabled}
              required
            />
            <PasswordToggleField.Toggle
              id="confirm-password-toggle"
              className="toggle"
            >
              <PasswordToggleField.Slot
                visible={<PiEyeDuotone />}
                hidden={<PiEyeClosedLight />}
              />
            </PasswordToggleField.Toggle>
          </div>
        </PasswordToggleField.Root>
      </S.FormField>
      <PasswordChecks password={password} confirmPassword={confirmPassword} />
    </>
  );
};
