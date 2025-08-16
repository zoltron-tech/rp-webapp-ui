import classNames from "classnames";
import { type FC, type HTMLProps, useRef } from "react";
import { useUIContext } from "@/hooks";
import { Logger } from "@/utils/services";
import * as S from "./styles";

type Props = HTMLProps<HTMLDivElement> & {
  username?: string;
  primary?: boolean;
};

export const Username: FC<Props> = ({
  username,
  primary,
  className,
  ...rest
}) => {
  const usernameRef = useRef<HTMLInputElement>(null);
  const { successToast } = useUIContext();

  const clickHandler = () => {
    const username = usernameRef.current?.innerText;
    if (username) {
      navigator.clipboard.writeText(username);
      successToast("Username copied to clipboard");
    }
  };

  Logger.info("Username rendered");

  return (
    <S.Container
      className={classNames([className, { primary }])}
      ref={usernameRef}
      onClick={clickHandler}
      {...rest}
    >
      {username || ""}
    </S.Container>
  );
};
