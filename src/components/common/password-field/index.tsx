import classNames from "classnames";
import {
  Form,
  unstable_PasswordToggleField as PasswordToggleField,
} from "radix-ui";
import type { ComponentProps, FC } from "react";
import { PiEyeClosedLight, PiEyeDuotone } from "react-icons/pi";
import * as S from "./styled";

const MAX_PASSWORD_LENGTH = 30;
type PasswordFieldProps = ComponentProps<typeof PasswordToggleField.Input> & {
  "show-character-count"?: boolean;
  label?: string;
  value?: string;
};

export const PasswordField: FC<PasswordFieldProps> = ({
  label = "Password",
  name = "password",
  className,
  "show-character-count": showCharacterCount = false,
  ...props
}) => {
  return (
    <S.FormField className={classNames("field", className)} name={name}>
      <S.FieldHeader>
        <Form.Label>{label}</Form.Label>
        {showCharacterCount && (
          <span>
            ({props.value?.length || 0} / {MAX_PASSWORD_LENGTH} characters)
          </span>
        )}
      </S.FieldHeader>
      <PasswordToggleField.Root>
        <div className="password-field-inner">
          <PasswordToggleField.Input
            className="input"
            aria-label={label}
            name={name}
            maxLength={MAX_PASSWORD_LENGTH}
            required
            {...props}
          />
          <PasswordToggleField.Toggle id={`${name}-toggle`} className="toggle">
            <PasswordToggleField.Slot
              visible={<PiEyeDuotone />}
              hidden={<PiEyeClosedLight />}
            />
          </PasswordToggleField.Toggle>
        </div>
      </PasswordToggleField.Root>
    </S.FormField>
  );
};
