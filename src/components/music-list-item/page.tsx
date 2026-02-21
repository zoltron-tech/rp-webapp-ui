"use client";

import { Flex } from "@novelist-world/ui";
import classNames from "classnames";
import type { FC } from "react";
import { FaPause, FaPlay, FaRegCopy } from "react-icons/fa";
import { useMusicContext } from "@/context";
import { useUIContext } from "@/hooks";
import type { Song } from "@/types/music";
import * as S from "./styles";

type Props = React.HTMLProps<HTMLDivElement> & {
  song: Song;
};

export const MusicListItem: FC<Props> = ({ song, className, ...rest }) => {
  const {
    playSong,
    pauseSong,
    isPlaying,
    isActiveSong,
    progress,
    seek,
    getCurrentTime,
    getDuration,
    formatTime,
  } = useMusicContext();
  const { successToast } = useUIContext();
  const playing = isPlaying(song.id);
  const active = isActiveSong(song.id);

  const handleCopySongName = () => {
    if (song.name) {
      navigator.clipboard.writeText(song.name);
      successToast("Song info copied to clipboard");
    }
  };

  const togglePlay = async () => {
    if (playing) {
      pauseSong();
    } else {
      await playSong(song.id, song.url, song.name);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    seek(percentage);
  };

  return (
    <S.CardWrapper
      className={classNames([className])}
      $isPlaying={active}
      $hasTags={song.tags.length > 0}
      {...rest}
    >
      <S.Card>
        <S.Info>
          <Flex>
            <S.PlayButton onClick={togglePlay}>
              {playing ? <FaPause /> : <FaPlay />}
            </S.PlayButton>
            <Flex direction="column">
              <S.SongNameWrapper>
                <S.SongName>{song.name}</S.SongName>
              </S.SongNameWrapper>
              <S.SongDescription>{song.description}</S.SongDescription>
            </Flex>
          </Flex>
          {active && (
            <S.ProgressBarContainer>
              <S.TimeDisplay>{formatTime(getCurrentTime())}</S.TimeDisplay>
              <S.ProgressBar onClick={handleSeek}>
                <S.ProgressFill style={{ width: `${progress}%` }} />
              </S.ProgressBar>
              <S.TimeDisplay>{formatTime(getDuration())}</S.TimeDisplay>
            </S.ProgressBarContainer>
          )}
          <S.SongTags>
            {song.tags.map((tag) => (
              <S.SongTag key={tag.id} $color={tag.color}>
                {tag.label}
              </S.SongTag>
            ))}
          </S.SongTags>
        </S.Info>

        <S.CopyButton onClick={handleCopySongName}>
          <FaRegCopy />
        </S.CopyButton>
      </S.Card>
    </S.CardWrapper>
  );
};
