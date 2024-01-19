import classNames from "classnames";
import { FC, ReactElement, useState } from "react";
import * as S from "./styles";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { MdErrorOutline, MdOutlineError } from "react-icons/md";
import { VscError } from "react-icons/vsc";
import { ShouldRender } from "..";
import { FaRegCircleCheck } from "react-icons/fa6";
import { PiWarning } from "react-icons/pi";
import { ImSpinner } from "react-icons/im";

interface Props {
  label: string;
  type: string;
  placeholder?: string;
  value?: string | boolean | number;
  defaultValue?: string | boolean | number;
  readOnly?: boolean;
  icon?: ReactElement;
  message?: any;
  messageType?: "error" | "success" | "warning" | "processing";
  minDate?: string;
  maxDate?: string;
  inputProps?: any;
  onChange?: (val?: string) => void;
  pattern?: string;
}

export const Input: FC<Props> = (props) => {
  const [hidden, setHidden] = useState(true);
  const [passwordType, setPasswordType] = useState("password");
  const {
    icon,
    label,
    defaultValue,
    type,
    value,
    readOnly,
    inputProps,
    placeholder,
    message,
    messageType,
    minDate,
    maxDate,
    onChange,
    ...rest
  } = props;
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
            "right-icon": isPassword,
          })}
          type={isPassword ? passwordType : type}
          placeholder={placeholder || " "}
          value={value}
          readOnly={readOnly}
          defaultValue={defaultValue}
          min={minDate}
          max={maxDate}
          onChange={(val): void => {
            if (onChange) onChange(val?.target?.value);
          }}
          {...inputProps}
          {...rest}
        />
        <S.InputLabel>{label}</S.InputLabel>
        {isPassword && (
          <S.RightIconBox
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
