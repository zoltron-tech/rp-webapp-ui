"use client";

import type { ProfileSong } from "@nw/types/music";
import classNames from "classnames";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { FaPause, FaPlay, FaRegCopy } from "react-icons/fa";
import { useUIContext } from "@/hooks";
import {
  getSpotifyIframeApi,
  type SpotifyEmbedController,
} from "../profile-song/spotify-iframe-api";
import * as S from "./styles";

type Props = React.HTMLProps<HTMLDivElement> & {
  song: ProfileSong;
};

/**
 * Inline pill song player for prompts. Reuses InlineMusicPlayer styling but
 * drives a ProfileSong: LIBRARY tracks play through a hidden <audio>, SPOTIFY
 * tracks through an off-screen Spotify IFrame controller.
 */
export const PromptSongPlayer: FC<Props> = ({ song, className, ...rest }) => {
  const isSpotify = song.source === "SPOTIFY" && !!song.spotifyTrackId;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const embedHostRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);

  const [ready, setReady] = useState(!isSpotify);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  /** Spotify track duration in seconds (for seeking). */
  const [spotifyDuration, setSpotifyDuration] = useState(0);
  const { successToast } = useUIContext();

  const name = [song.title, song.artist].filter(Boolean).join(" - ");
  const playable = isSpotify ? true : !!song.url;

  const handleCopySongName = () => {
    if (name) {
      navigator.clipboard.writeText(name);
      successToast("Song info copied to clipboard");
    }
  };

  const togglePlay = async () => {
    if (isSpotify) {
      controllerRef.current?.togglePlay();
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      await audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);

    if (isSpotify) {
      if (spotifyDuration > 0) {
        controllerRef.current?.seek(spotifyDuration * ratio);
      }
      return;
    }
    const audio = audioRef.current;
    if (audio && Number.isFinite(audio.duration)) {
      audio.currentTime = audio.duration * ratio;
    }
  };

  // ── Spotify: build an off-screen controller ────────────────────────────
  useEffect(() => {
    if (!isSpotify || !song.spotifyTrackId) return;
    let controller: SpotifyEmbedController | null = null;
    let cancelled = false;

    getSpotifyIframeApi().then((api) => {
      if (cancelled || !embedHostRef.current) return;
      api.createController(
        embedHostRef.current,
        { height: 1, uri: `spotify:track:${song.spotifyTrackId}`, width: 1 },
        (embedController) => {
          controller = embedController;
          controllerRef.current = embedController;
          embedController.addListener("ready", () => setReady(true));
          embedController.addListener("playback_update", (e) => {
            setIsPlaying(!e.data.isPaused);
            setSpotifyDuration(e.data.duration / 1000);
            setProgress(
              e.data.duration > 0
                ? (e.data.position / e.data.duration) * 100
                : 0,
            );
          });
        },
      );
    });

    return () => {
      cancelled = true;
      controller?.destroy();
      controllerRef.current = null;
    };
  }, [isSpotify, song.spotifyTrackId]);

  // ── Library: wire native audio events ──────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (isSpotify || !audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, [isSpotify]);

  if (!playable) return null;

  return (
    <S.CardWrapper className={classNames([className])} {...rest}>
      <S.Card>
        <S.PlayButton onClick={togglePlay} disabled={!ready}>
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

        {!isSpotify && song.url && (
          // biome-ignore lint/a11y/useMediaCaption: user-uploaded music has no captions
          <S.Audio ref={audioRef} src={song.url} preload="metadata" />
        )}
        {isSpotify && <S.HiddenEmbed ref={embedHostRef} aria-hidden />}
      </S.Card>
    </S.CardWrapper>
  );
};
