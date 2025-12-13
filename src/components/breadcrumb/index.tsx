import { ShouldRender } from "@novelist-world/ui";
import { type FC, memo, useCallback } from "react";
import { MdOutlineArrowRight } from "react-icons/md";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styled";

type Props = {
  label?: string;
  username: string;
};

export const BreadCrumb: FC<Props> = memo(({ username, label = "" }) => {
  const { routeToPage } = usePageRouter();

  const toUserProfile = useCallback(() => {
    if (!username) return;
    routeToPage(ROUTES.Profile.View(username).Index);
  }, [username, routeToPage]);

  return (
    <S.Breadcrumbs>
      <MdOutlineArrowRight />
      <S.Maintext>
        <S.UsernameLink onClick={toUserProfile}>{username}</S.UsernameLink>
        <ShouldRender if={Boolean(label)}>
          <Slash />
          {label}
        </ShouldRender>
      </S.Maintext>
    </S.Breadcrumbs>
  );
});

const Slash = memo(() => (
  <S.BreadcrumbDivider>&nbsp;/&nbsp;</S.BreadcrumbDivider>
));
