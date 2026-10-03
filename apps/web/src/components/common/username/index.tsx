import classNames from "classnames";
import { type FC, type HTMLProps, useRef } from "react";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import { Logger } from "@/utils/services";
import * as S from "./styles";

type Props = HTMLProps<HTMLDivElement> & {
  username?: string;
  primary?: boolean;
  accentOverride?: string;
};

export const Username: FC<Props> = ({
  username,
  primary,
  accentOverride,
  className,
  ...rest
}) => {
  const usernameRef = useRef<HTMLInputElement>(null);
  const { routeToPage } = usePageRouter();

  const onAuthorAvatarClick = () => {
    const username = usernameRef.current?.innerText;
    if (username) routeToPage(ROUTES.Profile.View(username).Index);
  };

  Logger.info("Username rendered");

  return (
    <S.Container
      className={classNames([className, { primary }])}
      accent={accentOverride}
      ref={usernameRef}
      onClick={onAuthorAvatarClick}
      {...rest}
    >
      {username || ""}
    </S.Container>
  );
};
