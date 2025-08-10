import { FC } from "react";
import * as S from "./styled";
import Link from "next/link";

export const TermsAndConditions: FC = () => {
  return (
    <S.TermsAndConditions>
      By joining, you agree to the <strong>Noverlist World</strong>&nbsp;
      <Link href="#" tabIndex={0}>
        Terms of Service
      </Link>{" "}
      and to occasionally receive emails from us. Please read our{" "}
      <Link href={"#"} tabIndex={0}>
        Privacy Policy
      </Link>{" "}
      to learn how we use your personal data.
    </S.TermsAndConditions>
  );
};
