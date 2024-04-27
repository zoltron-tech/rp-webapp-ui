import { ShouldRender } from "@/components/common";
import classNames from "classnames";
import { FC, InputHTMLAttributes, ReactElement, useState } from "react";
import { FaRegCircleCheck } from "react-icons/fa6";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { ImSpinner } from "react-icons/im";
import { PiWarning } from "react-icons/pi";
import { VscError } from "react-icons/vsc";

import { Logger } from "@/utils/services";
import * as S from "./styles";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  label: string;
  name: string;
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
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  pattern?: string;
  onEnter?: () => void;
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
  onEnter,
  ...rest
}) => {
  const [hidden, setHidden] = useState(true);
  const [passwordType, setPasswordType] = useState("password");
  const isPassword = type === "password";
  const error = messageType === "error" && message;
  const success = messageType === "success" && message;
  const warning = messageType === "warning" && message;
  const processing = messageType === "processing" && message;

  const passwordClickHandler = (): void => {
    setHidden(!hidden);
    if (hidden) setPasswordType("text");
    if (!hidden) setPasswordType("password");
  };

  Logger.info("Input rendered");

  return (
    <S.InputWrapper className={classNames({ textarea: type === "textarea" })}>
      <S.InputContainer
        className={classNames({ textarea: type === "textarea" })}
      >
        <S.Input
          key={defaultValue}
          aria-label={label}
          className={classNames({
            "left-icon": icon,
            "right-icon": isPassword || icon,
            textarea: type === "textarea",
          })}
          type={isPassword ? passwordType : type}
          placeholder={placeholder || " "}
          value={value}
          readOnly={readOnly}
          defaultValue={defaultValue}
          onChange={(val): void => {
            Logger.debug("onChange", val?.target?.value, val.target.name);
            if (onChange) onChange(val);
          }}
          onKeyDown={(e): void => {
            if (e.key === "Enter" && onEnter) {
              Logger.debug("onEnter");
              onEnter();
            } else if (e.key === "Escape") {
              Logger.debug("onEscape");
              e.currentTarget.blur();
            }
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

        <ShouldRender if={isPassword && !icon}>
          <S.RightIconBox
            className={classNames({ visible: !hidden })}
            onClick={passwordClickHandler}
          >
            {hidden ? <GoEyeClosed /> : <GoEye />}
          </S.RightIconBox>
        </ShouldRender>
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
