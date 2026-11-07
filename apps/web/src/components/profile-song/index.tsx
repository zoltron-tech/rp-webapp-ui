"use client";

import type { ProfileSong } from "@nw/types/music";
import { type FC, useEffect, useRef, useState } from "react";
import {
  MdMusicNote,
  MdOutlinedFlag,
  MdPause,
  MdPlayArrow,
} from "react-icons/md";
import { reportAction } from "@/app/rp/thread/actions";
import { AppAlertDialog } from "@/components/dialog";
import { useUIContext } from "@/hooks";
import { API_MESSAGE } from "@/utils/constants";
import { REPORT_SENT_TOAST } from "@/utils/report";
import {
  getSpotifyIframeApi,
  type SpotifyEmbedController,
} from "./spotify-iframe-api";
import * as S from "./styled";

type Props = {
  song: ProfileSong;
  /** Slimmer, compact pill (smaller art + tighter padding). */
  slim?: boolean;
  /** Fill the parent's width (used stacked above the About section). */
  block?: boolean;
  /** Square off the bottom corners so it attaches to content below. */
  flushBottom?: boolean;
  /**
   * Accent color override. When set (e.g. a muse's own accent), it drives the
   * pill gradient, play button, and progress bar in place of the global accent.
   */
  accent?: string;
  /**
   * Someone else's song: show a Report flag for an uploaded (LIBRARY) one.
   * Spotify tracks are licensed through Spotify and get none.
   */
  reportable?: boolean;
};

/**
 * Compact, pill-shaped profile song player with our own play controls.
 *
 * LIBRARY uploads play through a hidden <audio>. SPOTIFY tracks drive an
 * off-screen Spotify IFrame API controller (`togglePlay` / `seek`) so the
 * chunky official embed never shows — only our pill does.
 */
export const ProfileSongPlayer: FC<Props> = ({
  song,
  slim,
  block,
  flushBottom,
  accent,
  reportable = false,
}) => {
  const isSpotify = song.source === "SPOTIFY" && !!song.spotifyTrackId;
  const reportId =
    reportable && song.source === "LIBRARY" ? song.songId : null;
  const { successToast, errorToast } = useUIContext();
  const [confirmingReport, setConfirmingReport] = useState(false);

  const handleReport = async () => {
    if (!reportId) return;
    const response = await reportAction(reportId, "", "SONG");
    if (response?.message === API_MESSAGE.Success) {
      successToast(REPORT_SENT_TOAST);
    } else {
      errorToast("There was an issue while reporting this song.");
    }
  };

  const [ready, setReady] = useState(!isSpotify);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const embedHostRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);

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
            setPlaying(!e.data.isPaused);
            setPosition(e.data.position);
            setDuration(e.data.duration);
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
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => setPosition(audio.currentTime * 1000);
    const onMeta = () => setDuration(audio.duration * 1000);
    const onEnded = () => {
      setPlaying(false);
      setPosition(0);
    };
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
    };
  }, [isSpotify]);

  const playable = isSpotify ? true : !!song.url;

  const togglePlay = () => {
    if (isSpotify) {
      controllerRef.current?.togglePlay();
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  };

  const seekToRatio = (ratio: number) => {
    const clamped = Math.min(Math.max(ratio, 0), 1);
    if (isSpotify) {
      if (duration > 0) controllerRef.current?.seek((duration / 1000) * clamped);
      return;
    }
    const audio = audioRef.current;
    if (audio && Number.isFinite(audio.duration)) {
      audio.currentTime = audio.duration * clamped;
    }
  };

  const onProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width > 0) seekToRatio((e.clientX - rect.left) / rect.width);
  };

  const pct = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <S.Wrapper
      $slim={slim}
      $block={block}
      style={accent ? ({ "--accent": accent } as React.CSSProperties) : undefined}
    >
      <S.Pill $slim={slim} $block={block} $flushBottom={flushBottom}>
        <S.Art $slim={slim}>
          {song.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={song.imageUrl} alt="" />
          ) : (
            <MdMusicNote size={20} color="var(--text-secondary)" />
          )}
          {playing && (
            <S.Equalizer aria-hidden>
              <span />
              <span />
              <span />
            </S.Equalizer>
          )}
        </S.Art>

        <S.Info>
          <S.Title>{song.title}</S.Title>
          {song.artist && <S.Artist>{song.artist}</S.Artist>}
          {/* Always reserved when playable so the pill height is identical
              regardless of source — LIBRARY tracks resolve `duration` instantly
              (preload=metadata) while SPOTIFY stays 0 until play — and so the
              pill doesn't grow (layout shift) the moment playback starts. */}
          {playable && (
            <S.Progress onClick={onProgressClick}>
              <S.ProgressFill style={{ width: `${pct}%` }} />
            </S.Progress>
          )}
        </S.Info>

        {reportId && (
          <S.ReportButton
            type="button"
            onClick={() => setConfirmingReport(true)}
            aria-label={`Report ${song.title}`}
            title="Report this song"
          >
            <MdOutlinedFlag size={16} />
          </S.ReportButton>
        )}

        {playable && (
          <S.PlayButton
            $slim={slim}
            type="button"
            disabled={!ready}
            onClick={togglePlay}
            aria-label={playing ? `Pause ${song.title}` : `Play ${song.title}`}
          >
            {!ready ? (
              <S.Spinner />
            ) : playing ? (
              <MdPause size={20} />
            ) : (
              <MdPlayArrow size={22} />
            )}
          </S.PlayButton>
        )}
      </S.Pill>

      {/* Hidden native audio for LIBRARY tracks */}
      {!isSpotify && song.url && (
        // biome-ignore lint/a11y/useMediaCaption: user-uploaded music has no captions
        <audio ref={audioRef} src={song.url} preload="metadata" />
      )}

      {/* Real Spotify iframe — driven off-screen, never shown to the user */}
      {isSpotify && <S.HiddenEmbed ref={embedHostRef} aria-hidden />}

      {reportId && (
        <AppAlertDialog
          heading={`Report ${song.title}?`}
          text="Report a song that isn't the uploader's to share, or that breaks the community rules. Our support team will review it."
          open={confirmingReport}
          onOpenChange={setConfirmingReport}
          onConfirm={handleReport}
          actionButtonLabel="Report"
        />
      )}
    </S.Wrapper>
  );
};
