"use client";

import type { ProfileSong } from "@nw/types/music";
import { type FC, useEffect, useMemo, useRef, useState } from "react";
import { FaMusic, FaPause, FaPlay } from "react-icons/fa";
import {
  getSpotifyIframeApi,
  type SpotifyEmbedController,
} from "../profile-song/spotify-iframe-api";
import * as S from "./styled";

type Props = {
  song: ProfileSong;
};

/** Static waveform silhouette — bars fill up to the current playback ratio. */
const WAVE_BARS = [40, 70, 100, 55, 80, 35, 65, 90, 45, 75, 30, 60, 85, 50];

/**
 * Rich featured-song card for a prompt: album art with a play overlay, stacked
 * title/artist, a seekable waveform, and a Library/Spotify source badge.
 * LIBRARY tracks play through a hidden <audio>; SPOTIFY tracks through an
 * off-screen Spotify IFrame controller (mirrors PromptSongPlayer).
 */
export const PromptFeaturedSong: FC<Props> = ({ song }) => {
  const isSpotify = song.source === "SPOTIFY" && !!song.spotifyTrackId;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const embedHostRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);

  const [ready, setReady] = useState(!isSpotify);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [spotifyDuration, setSpotifyDuration] = useState(0);

  const playable = isSpotify ? true : !!song.url;
  const sourceLabel = isSpotify ? "Spotify" : "Library";

  const activeBars = useMemo(
    () => Math.round((progress / 100) * WAVE_BARS.length),
    [progress],
  );

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
    const ratio = Math.min(
      Math.max((e.clientX - rect.left) / rect.width, 0),
      1,
    );

    if (isSpotify) {
      if (spotifyDuration > 0)
        controllerRef.current?.seek(spotifyDuration * ratio);
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
      if (audio.duration)
        setProgress((audio.currentTime / audio.duration) * 100);
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
    <S.SongCard>
      <S.SongArt
        type="button"
        className={isPlaying ? "playing" : undefined}
        onClick={togglePlay}
        disabled={!ready}
        aria-label={isPlaying ? "Pause song" : "Play song"}
      >
        {song.imageUrl ? (
          <img src={song.imageUrl} alt="" />
        ) : (
          <span className="song-art-note">
            <FaMusic />
          </span>
        )}
        <span className="song-art-play">
          {isPlaying ? <FaPause /> : <FaPlay />}
        </span>
      </S.SongArt>

      <S.SongInfo>
        <S.SongTitle>{song.title}</S.SongTitle>
        {song.artist && <S.SongArtist>{song.artist}</S.SongArtist>}
        <S.SongWave onClick={handleSeek}>
          {WAVE_BARS.map((h, i) => (
            <i
              key={`wave-${i}`}
              className={i < activeBars ? "on" : undefined}
              style={{ height: `${h}%` }}
            />
          ))}
        </S.SongWave>
      </S.SongInfo>

      <S.SongSource>{sourceLabel}</S.SongSource>

      {!isSpotify && song.url && (
        // biome-ignore lint/a11y/useMediaCaption: user-uploaded music has no captions
        <audio ref={audioRef} src={song.url} preload="metadata" hidden />
      )}
      {isSpotify && <S.SongHiddenEmbed ref={embedHostRef} aria-hidden />}
    </S.SongCard>
  );
};
