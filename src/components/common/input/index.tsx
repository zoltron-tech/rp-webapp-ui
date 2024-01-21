import classNames from "classnames";
import {
  FC,
  HTMLInputTypeAttribute,
  InputHTMLAttributes,
  ReactElement,
  useState,
} from "react";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { VscError } from "react-icons/vsc";
import { FaRegCircleCheck } from "react-icons/fa6";
import { PiWarning } from "react-icons/pi";
import { ImSpinner } from "react-icons/im";
import { ShouldRender } from "@/components/common";

import * as S from "./styles";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string | boolean | number;
  defaultValue?: string | boolean | number;
  readOnly?: boolean;
  icon?: ReactElement;
  iconColor?: string;
  message?: any;
  messageType?: "error" | "success" | "warning" | "processing";
  inputProps?: any;
  onChange?: (val?: string) => void;
  pattern?: string;
};

export const Input: FC<Props> = ({
  type = "text",
  icon,
  iconColor,
  label,
  defaultValue,
  value,
  readOnly,
  inputProps,
  placeholder,
  message,
  messageType,
  onChange,
  ...rest
}) => {
  const [hidden, setHidden] = useState(true);
  const [passwordType, setPasswordType] = useState("password");
  const isPassword = type === "password";
  const error = messageType === "error" && message;
  const success = messageType === "success" && message;
  const warning = messageType === "warning" && message;
  const processing = messageType === "processing" && message;

  return (
    <S.InputWrapper>
      <S.InputContainer>
        <S.Input
          key={defaultValue}
          aria-label={label}
          className={classNames({
            "left-icon": icon,
            "right-icon": isPassword || icon,
          })}
          type={isPassword ? passwordType : type}
          placeholder={placeholder || " "}
          value={value}
          readOnly={readOnly}
          defaultValue={defaultValue}
          onChange={(val): void => {
            if (onChange) onChange(val?.target?.value);
          }}
          {...inputProps}
          {...rest}
        />
        <S.InputLabel>{label}</S.InputLabel>

        <ShouldRender if={!!icon}>
          <S.RightIconBox
            color={iconColor}
            className={classNames({ visible: true })}
          >
            {icon}
          </S.RightIconBox>
        </ShouldRender>

        {isPassword && (
          <S.RightIconBox
            className={classNames({ visible: !hidden })}
            onClick={(): void => {
              setHidden(!hidden);
              if (hidden) setPasswordType("text");
              if (!hidden) setPasswordType("password");
            }}
          >
            {hidden ? <GoEyeClosed /> : <GoEye />}
          </S.RightIconBox>
        )}
      </S.InputContainer>
      <S.Message
        className={classNames({
          show: !!message,
          error,
          success,
          warning,
          processing,
        })}
      >
        <ShouldRender if={error}>
          <VscError />
        </ShouldRender>
        <ShouldRender if={success}>
          <FaRegCircleCheck />
        </ShouldRender>
        <ShouldRender if={warning}>
          <PiWarning />
        </ShouldRender>
        <ShouldRender if={processing}>
          <ImSpinner />
        </ShouldRender>
        {message}
      </S.Message>
    </S.InputWrapper>
  );
};

export default Input;
