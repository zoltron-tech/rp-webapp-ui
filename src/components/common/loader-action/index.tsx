import type { FC } from "react";
import { PiSpinnerGapBold } from "react-icons/pi";
import * as S from "./styled";

type LoaderActionProps = {
  text: string;
  loadingText: string;
  loading?: boolean;
};
export const LoaderAction: FC<LoaderActionProps> = ({
  text,
  loadingText,
  loading = false,
}) => {
  return (
    <S.LoaderActionRoot>
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
