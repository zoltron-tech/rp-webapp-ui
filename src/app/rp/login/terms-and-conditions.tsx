import Link from "next/link";
import type { FC } from "react";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styled";

export const TermsAndConditions: FC = () => {
  return (
    <S.TermsAndConditions>
      By joining, you agree to the<strong>&nbsp;Noverlist World</strong>
      <Link href={ROUTES.Terms} tabIndex={0}>
        &nbsp;Terms of Service&nbsp;
      </Link>
      and to occasionally receive emails from us. Please read our
      <Link href={ROUTES.PrivacyPolicy} tabIndex={0}>
        &nbsp;Privacy Policy&nbsp;
      </Link>
      to learn how we process your data.
    </S.TermsAndConditions>
  );
};
