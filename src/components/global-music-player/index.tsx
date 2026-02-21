"use client";

import type { FC } from "react";
import { FaPause, FaPlay, FaXmark } from "react-icons/fa6";
import { useMusicContext } from "@/context";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styles";

export const GlobalMusicPlayer: FC = () => {
  const {
    playingSongId,
    playingSongName,
    progress,
    isAnyPlaying,
    togglePlayPause,
    seek,
    getCurrentTime,
    getDuration,
    formatTime,
    clearSong,
  } = useMusicContext();

  const novelist = useGlobalState("novelist");
  const { routeToPage } = usePageRouter();

  // Don't render if no song is active
  if (!playingSongId || !playingSongName) {
    return null;
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    seek(percentage);
  };

  const handleClose = () => {
    clearSong();
  };

  const toMusicPage = () => {
    routeToPage(ROUTES.Profile.View(novelist?.username || "").Music);
  };

  return (
    <S.Container>
      <S.PlayButton onClick={togglePlayPause}>
        {isAnyPlaying() ? <FaPause /> : <FaPlay />}
      </S.PlayButton>

      <S.SongInfo>
        <S.SongNameClickable onClick={toMusicPage}>
          {playingSongName}
        </S.SongNameClickable>
        <S.TimeAndProgress>
          <S.TimeDisplay>{formatTime(getCurrentTime())}</S.TimeDisplay>
          <S.ProgressBarWrapper onClick={handleSeek}>
            <S.ProgressBar style={{ width: `${progress}%` }} />
          </S.ProgressBarWrapper>
          <S.TimeDisplay>{formatTime(getDuration())}</S.TimeDisplay>
        </S.TimeAndProgress>
      </S.SongInfo>

      <S.CloseButton onClick={handleClose}>
        <FaXmark />
      </S.CloseButton>
    </S.Container>
  );
};
