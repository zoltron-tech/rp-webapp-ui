import { FC, useRef } from "react";

import { useUIContext } from "@/hooks";
import classNames from "classnames";
import * as S from "./styles";

type Props = {
  username?: string;
  primary?: boolean;
};

export const Username: FC<Props> = ({ username, primary }) => {
  const usernameRef = useRef<HTMLInputElement>(null);
  const { successToast } = useUIContext();

  return (
    <S.Container
      className={classNames({ primary })}
      ref={usernameRef}
      onClick={() => {
        const username = usernameRef.current?.innerText;
        if (username) {
          navigator.clipboard.writeText(username);
          successToast("Username copied to clipboard");
        }
      }}
    >
      {username || ""}
    </S.Container>
  );
};
