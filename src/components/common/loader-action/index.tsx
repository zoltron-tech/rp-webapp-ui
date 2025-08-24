import classNames from "classnames";
import type { FC, ReactNode } from "react";
import { PiSpinnerGapBold } from "react-icons/pi";
import * as S from "./styled";

type LoaderActionProps = {
  text: ReactNode;
  loadingText: ReactNode;
  loading?: boolean;
};
export const LoaderAction: FC<LoaderActionProps> = ({
  text,
  loadingText,
  loading = false,
}) => {
  return (
    <S.LoaderActionRoot className={classNames("loader-action", { loading })}>
      {loading ? (
        <>
          <PiSpinnerGapBold className="loader-icon" />
          {loadingText}
        </>
      ) : (
        text
      )}
    </S.LoaderActionRoot>
  );
};
