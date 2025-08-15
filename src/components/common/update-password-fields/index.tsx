import { PasswordChecks } from "@/components/password-checks";
import { verifyPasswordPattern, verifyPasswordsMatch } from "@/utils/helpers";
import { FC, useState, ChangeEventHandler, useCallback } from "react";
import { PasswordField } from "../password-field";

type ResetPasswordPageProps = {
  setValid: (valid: boolean) => void;
  new?: boolean; // Optional prop to indicate if this is for a new password
  disabled?: boolean; // Optional prop to disable the fields
};

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
      <PasswordField
        label={isNew ? "New password" : "Password"}
        name="password"
        value={password}
        onChange={setPassword}
        disabled={disabled}
        show-character-count
      />
      <PasswordField
        label={"Confirm password"}
        name="confirm"
        value={confirmPassword}
        disabled={disabled}
        onChange={setConfirmPassword}
      />
      <PasswordChecks password={password} confirmPassword={confirmPassword} />
    </>
  );
};
