"use client";
import { Muse } from "@/types/novelist";
import { FC, useRef } from "react";

import { Logger } from "@/utils/services";
import { useRouter } from "next/navigation";

import * as S from "./styles";
import classNames from "classnames";
import { Flex } from "@novelist-world/ui";

type Props = React.HTMLProps<HTMLDivElement> & {
  muse?: Muse | null;
};
export const VideoCard: FC<Props> = ({ muse, className, ...rest }) => {
  const { push } = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const onAvatarClick = () => {
    if (!muse) return;
    push(`/rp/muse/${muse.id}`);
  };

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.setAttribute("controls", "controls");
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.removeAttribute("controls");
    }
  };

  Logger.info("MuseCard rendered");

  if (!muse) return <></>;

  return (
    <S.CardWrapper
      className={classNames([
        className,
        {
          new: !muse.firstName,
        },
      ])}
      {...rest}
    >
      <S.VideoContainer>
        <Flex direction="column">
          <S.Video
            ref={videoRef}
            className="video"
            src={muse.video + "#t=0.3"}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          ></S.Video>
        </Flex>
        <S.RowFlex direction="row" justify="space-between">
          <S.Avatar
            src={muse.image || ""}
            alt=""
            onClick={onAvatarClick}
            hoverable
          ></S.Avatar>
          <S.VideoAutherName>{muse.firstName}</S.VideoAutherName>
        </S.RowFlex>
      </S.VideoContainer>
    </S.CardWrapper>
  );
};

export default VideoCard;
