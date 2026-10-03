"use client";

import classNames from "classnames";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { FaPause, FaPlay, FaRegCopy } from "react-icons/fa";
import { useUIContext } from "@/hooks";
import * as S from "./styles";

type Props = React.HTMLProps<HTMLDivElement> & {
  url: string;
  name: string;
};

export const InlineMusicPlayer: FC<Props> = ({
  url,
  name,
  className,
  ...rest
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const { successToast, errorToast } = useUIContext();

  const handleCopySongName = () => {
    if (name) {
      navigator.clipboard.writeText(name);
      successToast("Song info copied to clipboard");
    }
  };

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(name);
    successToast("Song info copied to clipboard");
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      await audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;

    const { currentTime, duration } = audioRef.current;
    if (!duration) return;

    setProgress((currentTime / duration) * 100);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;

    audioRef.current.currentTime = percentage * audioRef.current.duration;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  return (
    <S.CardWrapper className={classNames([className])} {...rest}>
      <S.Card>
        <S.PlayButton onClick={togglePlay}>
          {isPlaying ? <FaPause /> : <FaPlay />}
        </S.PlayButton>

        <S.Info>
          <S.SongNameWrapper>
            <S.SongName>
              {name} ➤ {name}
            </S.SongName>
          </S.SongNameWrapper>

          <S.ProgressBar onClick={handleSeek}>
            <S.ProgressFill style={{ width: `${progress}%` }} />
          </S.ProgressBar>
        </S.Info>

        <S.CopyButton onClick={handleCopySongName}>
          <FaRegCopy />
        </S.CopyButton>
        <S.Audio
          ref={audioRef}
          src={url}
          onEnded={() => {
            setIsPlaying(false);
            setProgress(0);
          }}
        />
      </S.Card>
    </S.CardWrapper>
  );
};
