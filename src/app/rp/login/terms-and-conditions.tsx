import { FC } from "react";
import * as S from "./styled";
import Link from "next/link";

export const TermsAndConditions: FC = () => {
  return (
    <S.TermsAndConditions>
      By joining, you agree to the<strong>&nbsp;Noverlist World</strong>
      <Link href="/rp/terms" tabIndex={0}>
        &nbsp;Terms of Service&nbsp;
      </Link>
      and to occasionally receive emails from us. Please read our
      <Link href={"/rp/privacy-policy"} tabIndex={0}>
        &nbsp;Privacy Policy&nbsp;
      </Link>
      to learn how we process your data.
    </S.TermsAndConditions>
  );
};
