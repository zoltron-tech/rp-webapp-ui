import { FC } from "react";
import * as S from "./styled";
import {
  PiSpinnerGap,
  PiSpinnerGapBold,
  PiSpinnerGapLight,
} from "react-icons/pi";

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
