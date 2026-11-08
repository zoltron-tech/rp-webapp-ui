"use client";

import { ShouldRender } from "@novelist-world/ui";
import type { ProfileSong, Song, SpotifyTrack } from "@nw/types/music";
import classNames from "classnames";
import { Dialog } from "radix-ui";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { FaSpotify } from "react-icons/fa6";
import {
  MdLibraryMusic,
  MdMusicNote,
  MdPause,
  MdPlayArrow,
  MdSearch,
} from "react-icons/md";
import {
  getSpotifyIframeApi,
  type SpotifyEmbedController,
} from "@/components/profile-song/spotify-iframe-api";
import { useGlobalState } from "@/context/store/stores";
import { useUIContext } from "@/hooks/use-ui-context";
import { getOwnMusicAction } from "../[slug]/music/action";
import {
  searchSpotifyTracksAction,
  setProfileSongAction,
} from "./profile-song.actions";
import * as S from "./styled";

type Tab = "library" | "spotify";

/** Seconds as m:ss for the seek-bar labels. */
const mmss = (seconds: number) => {
  const s = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * With `commit={false}` it may return a Promise (the caller saves the pick
   * itself): the row spins meanwhile, and a result of `false` keeps the picker
   * open.
   */
  onSelected: (song: ProfileSong) => unknown;
  /** Dialog heading. Defaults to the profile-song wording. */
  title?: string;
  /**
   * When true (default) the pick is persisted as the caller's profile song via
   * `setProfileSongAction`. When false the pick is resolved locally and handed
   * back through `onSelected` without any server write — used when the song is
   * part of a larger form (e.g. a storyboard event) saved elsewhere.
   */
  commit?: boolean;
};

export const SongPickerDialog: FC<Props> = ({
  open,
  onOpenChange,
  onSelected,
  title = "Add a profile song",
  commit = true,
}) => {
  const accent = useGlobalState("accent");
  const theme = useGlobalState("theme");
  const { errorToast } = useUIContext();

  const [tab, setTab] = useState<Tab>("library");
  const [ownSongs, setOwnSongs] = useState<Song[]>([]);
  const [ownLoading, setOwnLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Preview playback ─────────────────────────────────────────────────────
  // A single active preview at a time. LIBRARY tracks play through one shared
  // <audio>; SPOTIFY tracks drive one off-screen iframe controller (loadUri).
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewLoadingKey, setPreviewLoadingKey] = useState<string | null>(
    null,
  );
  // Playhead of the active preview, in seconds. Feeds the row seek bar.
  const [previewPosition, setPreviewPosition] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);
  // The song/track the Select button will commit — set on row click,
  // independent of play/pause state.
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const spotifyHostRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);
  const loadedTrackRef = useRef<string | null>(null);
  // Key of the library track currently driving <audio>, so buffering events
  // (which carry no key) know which row to flag as loading.
  const libKeyRef = useRef<string | null>(null);
  // Which media is currently driving the preview — lets us ignore stray
  // events from the other (e.g. an audio "pause" fired while switching).
  const activeMediaRef = useRef<"audio" | "spotify" | null>(null);

  const stopAllPreview = useCallback(() => {
    audioRef.current?.pause();
    controllerRef.current?.pause();
  }, []);

  useEffect(() => {
    if (!open) return;
    setTab("library");
    setQuery("");
    setResults([]);
    setOwnLoading(true);
    getOwnMusicAction().then((res) => {
      setOwnSongs(Array.isArray(res) ? res : []);
      setOwnLoading(false);
    });
  }, [open]);

  // Stop and reset any preview when the dialog closes.
  useEffect(() => {
    if (open) return;
    stopAllPreview();
    setPreviewKey(null);
    setPreviewPlaying(false);
    setPreviewLoadingKey(null);
    setPreviewPosition(0);
    setPreviewDuration(0);
    setSelectedSong(null);
    setSelectedTrack(null);
  }, [open, stopAllPreview]);

  // Switching tabs stops whatever is currently previewing.
  useEffect(() => {
    stopAllPreview();
  }, [tab, stopAllPreview]);

  // Tear the Spotify controller down on unmount.
  useEffect(
    () => () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
    },
    [],
  );

  // ── Library preview (native audio) ───────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // `waiting` fires while the browser buffers (initial fetch or a stall);
    // `playing` fires once audio actually starts. We only flip to the "playing"
    // cue on `playing`, so the loading spinner shows during the buffer gap.
    const onWaiting = () => {
      if (activeMediaRef.current === "audio")
        setPreviewLoadingKey(libKeyRef.current);
    };
    const onPlaying = () => {
      if (activeMediaRef.current !== "audio") return;
      setPreviewLoadingKey(null);
      setPreviewPlaying(true);
    };
    const onPause = () => {
      if (activeMediaRef.current !== "audio") return;
      setPreviewLoadingKey(null);
      setPreviewPlaying(false);
    };
    const onEnded = () => {
      if (activeMediaRef.current !== "audio") return;
      setPreviewLoadingKey(null);
      setPreviewPlaying(false);
      setPreviewPosition(0);
    };
    const onTime = () => {
      if (activeMediaRef.current === "audio")
        setPreviewPosition(audio.currentTime);
    };
    const onDuration = () => {
      if (activeMediaRef.current === "audio")
        setPreviewDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("durationchange", onDuration);
    return () => {
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("durationchange", onDuration);
    };
  }, []);

  const previewLibrary = (song: Song) => {
    const key = `lib-${song.id}`;
    setSelectedSong(song);
    setSelectedTrack(null);
    controllerRef.current?.pause();
    const audio = audioRef.current;
    if (!audio || !song.url) {
      setPreviewKey(key);
      return;
    }
    if (previewKey === key) {
      if (audio.paused) audio.play().catch(() => {});
      else audio.pause();
      return;
    }
    activeMediaRef.current = "audio";
    libKeyRef.current = key;
    audio.src = song.url;
    setPreviewKey(key);
    setPreviewPlaying(false);
    setPreviewLoadingKey(key);
    setPreviewPosition(0);
    setPreviewDuration(0);
    audio.play().catch(() => {});
  };

  const previewSpotify = (track: SpotifyTrack) => {
    const key = `sp-${track.id}`;
    setSelectedTrack(track);
    setSelectedSong(null);
    audioRef.current?.pause();
    const uri = `spotify:track:${track.id}`;
    activeMediaRef.current = "spotify";

    // Same track already loaded — just toggle.
    if (controllerRef.current && loadedTrackRef.current === track.id) {
      controllerRef.current.togglePlay();
      return;
    }

    setPreviewKey(key);
    setPreviewPosition(0);
    setPreviewDuration(0);

    // Controller exists but on a different track — swap and play.
    if (controllerRef.current) {
      loadedTrackRef.current = track.id;
      controllerRef.current.loadUri(uri);
      controllerRef.current.play();
      return;
    }

    // First Spotify preview — build the off-screen controller.
    setPreviewLoadingKey(key);
    loadedTrackRef.current = track.id;
    getSpotifyIframeApi().then((api) => {
      if (!spotifyHostRef.current) return;
      api.createController(
        spotifyHostRef.current,
        { height: 1, uri, width: 1 },
        (controller) => {
          controllerRef.current = controller;
          controller.addListener("ready", () => {
            setPreviewLoadingKey(null);
            controller.play();
          });
          controller.addListener("playback_update", (e) => {
            if (activeMediaRef.current !== "spotify") return;
            setPreviewLoadingKey(null);
            setPreviewKey(`sp-${loadedTrackRef.current}`);
            setPreviewPlaying(!e.data.isPaused);
            setPreviewPosition(e.data.position / 1000);
            setPreviewDuration(e.data.duration / 1000);
          });
        },
      );
    });
  };

  // Scrub the active preview to `seconds`, whichever media is driving it.
  const seekPreview = (seconds: number) => {
    if (activeMediaRef.current === "audio" && audioRef.current) {
      audioRef.current.currentTime = seconds;
    } else if (activeMediaRef.current === "spotify") {
      controllerRef.current?.seek(seconds);
    }
    setPreviewPosition(seconds);
  };

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const tracks = await searchSpotifyTracksAction(q);
    setResults(tracks);
    setSearching(false);
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(value), 400);
  };

  const commitPick = async (
    payload: Parameters<typeof setProfileSongAction>[0],
    key: string,
  ) => {
    // Resolve-only mode: hand a fully-formed song back to the parent form
    // without persisting anything server-side.
    if (!commit) {
      const outcome = onSelected({
        artist: payload.artist ?? null,
        externalUrl: payload.externalUrl ?? null,
        imageUrl: payload.imageUrl ?? null,
        songId: payload.songId ?? null,
        source: payload.source,
        spotifyTrackId: payload.spotifyTrackId ?? null,
        title: payload.title,
        url: payload.url ?? null,
      });
      if (outcome instanceof Promise) {
        setSavingId(key);
        const saved = await outcome.catch(() => false);
        setSavingId(null);
        if (saved === false) return;
      }
      onOpenChange(false);
      return;
    }

    setSavingId(key);
    const result = await setProfileSongAction(payload).catch(() => null);
    setSavingId(null);
    if (result && "source" in result) {
      onSelected(result);
      onOpenChange(false);
      return;
    }
    errorToast("Could not set that song. Please try again.");
  };

  const pickLibrary = (song: Song) =>
    commitPick(
      {
        imageUrl: null,
        songId: song.id,
        source: "LIBRARY",
        title: song.name,
        url: song.url,
      },
      `lib-${song.id}`,
    );

  const pickSpotify = (track: SpotifyTrack) =>
    commitPick(
      {
        artist: track.artist,
        externalUrl: track.externalUrl,
        imageUrl: track.imageUrl,
        source: "SPOTIFY",
        spotifyTrackId: track.id,
        title: track.title,
      },
      `sp-${track.id}`,
    );

  // Footer "Select" commits whichever row is currently selected.
  const confirmSelected = () => {
    if (selectedSong) pickLibrary(selectedSong);
    else if (selectedTrack) pickSpotify(selectedTrack);
  };

  const hasSelection = selectedSong !== null || selectedTrack !== null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <S.SongPickerOverlay />
        </Dialog.Overlay>
        <Dialog.Content asChild aria-describedby={undefined}>
          <S.SongPickerContent className={classNames([accent, theme])}>
            <Dialog.Title asChild>
              <S.SongPickerTitle>{title}</S.SongPickerTitle>
            </Dialog.Title>

          <S.SongPickerTabs>
            <S.SongPickerTab
              type="button"
              $active={tab === "library"}
              onClick={() => setTab("library")}
            >
              <MdLibraryMusic /> My music
            </S.SongPickerTab>
            <S.SongPickerTab
              type="button"
              $active={tab === "spotify"}
              onClick={() => setTab("spotify")}
            >
              <FaSpotify /> NW Library
            </S.SongPickerTab>
          </S.SongPickerTabs>

          {/* My uploaded music */}
          <ShouldRender if={tab === "library"}>
            <S.SongPickerList>
              <ShouldRender if={ownLoading}>
                <S.SongPickerEmpty>Loading your music…</S.SongPickerEmpty>
              </ShouldRender>
              <ShouldRender if={!ownLoading && ownSongs.length === 0}>
                <S.SongPickerEmpty>
                  You haven't uploaded any music yet.
                </S.SongPickerEmpty>
              </ShouldRender>
              {ownSongs.map((song) => {
                const key = `lib-${song.id}`;
                const isActive = previewKey === key;
                const isLoading = previewLoadingKey === key;
                return (
                  <S.SongPickerRow
                    key={song.id}
                    $active={isActive}
                    $disabled={savingId !== null}
                  >
                    <div className="row-main">
                      <S.SongPickerArt>
                        <MdMusicNote size={20} />
                      </S.SongPickerArt>
                      <S.SongPickerSelect
                        type="button"
                        disabled={savingId !== null}
                        onClick={() => previewLibrary(song)}
                      >
                        <S.SongPickerMeta>
                          <span className="title">{song.name}</span>
                          {song.description && (
                            <span className="sub">{song.description}</span>
                          )}
                        </S.SongPickerMeta>
                      </S.SongPickerSelect>
                      <ShouldRender if={savingId === key}>
                        <span className="saving">Setting…</span>
                      </ShouldRender>
                      <ShouldRender if={!!song.url && savingId !== key}>
                        <S.SongPickerPlay
                          type="button"
                          $active={isActive && previewPlaying}
                          $loading={isLoading}
                          onClick={() => previewLibrary(song)}
                          aria-label={
                            isLoading
                              ? `Loading preview of ${song.name}`
                              : isActive && previewPlaying
                                ? `Pause preview of ${song.name}`
                                : `Play preview of ${song.name}`
                          }
                        >
                          {isLoading ? (
                            <span className="spinner" />
                          ) : isActive && previewPlaying ? (
                            <MdPause size={18} />
                          ) : (
                            <MdPlayArrow size={20} />
                          )}
                        </S.SongPickerPlay>
                      </ShouldRender>
                    </div>
                    <ShouldRender if={isActive && !!song.url}>
                      <S.SongPickerSeek>
                        <time>{mmss(previewPosition)}</time>
                        <input
                          type="range"
                          min={0}
                          max={previewDuration || 0}
                          step={0.1}
                          value={Math.min(previewPosition, previewDuration || 0)}
                          onChange={(e) => seekPreview(Number(e.target.value))}
                          aria-label={`Seek preview of ${song.name}`}
                        />
                        <time className="end">{mmss(previewDuration)}</time>
                      </S.SongPickerSeek>
                    </ShouldRender>
                  </S.SongPickerRow>
                );
              })}
            </S.SongPickerList>
          </ShouldRender>

          {/* NW Library (Spotify) search */}
          <ShouldRender if={tab === "spotify"}>
            <S.SongPickerSearch>
              <MdSearch size={18} />
              <input
                type="text"
                placeholder="Search songs on Spotify…"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                // biome-ignore lint/a11y/noAutofocus: search is the sole action of this tab
                autoFocus
              />
            </S.SongPickerSearch>
            <S.SongPickerList>
              <ShouldRender if={searching}>
                <S.SongPickerEmpty>Searching…</S.SongPickerEmpty>
              </ShouldRender>
              <ShouldRender
                if={!searching && query.trim().length > 0 && results.length === 0}
              >
                <S.SongPickerEmpty>No tracks found.</S.SongPickerEmpty>
              </ShouldRender>
              {results.map((track) => {
                const key = `sp-${track.id}`;
                const isActive = previewKey === key;
                const isLoading = previewLoadingKey === key;
                return (
                  <S.SongPickerRow
                    key={track.id}
                    $active={isActive}
                    $disabled={savingId !== null}
                  >
                    <div className="row-main">
                      <S.SongPickerArt>
                        {track.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={track.imageUrl} alt="" />
                        ) : (
                          <MdMusicNote size={20} />
                        )}
                      </S.SongPickerArt>
                      <S.SongPickerSelect
                        type="button"
                        disabled={savingId !== null}
                        onClick={() => previewSpotify(track)}
                      >
                        <S.SongPickerMeta>
                          <span className="title">{track.title}</span>
                          {track.artist && (
                            <span className="sub">{track.artist}</span>
                          )}
                        </S.SongPickerMeta>
                      </S.SongPickerSelect>
                      <ShouldRender if={savingId === key}>
                        <span className="saving">Setting…</span>
                      </ShouldRender>
                      <ShouldRender if={savingId !== key}>
                        <S.SongPickerPlay
                          type="button"
                          $active={isActive && previewPlaying}
                          $loading={isLoading}
                          onClick={() => previewSpotify(track)}
                          aria-label={
                            isLoading
                              ? `Loading preview of ${track.title}`
                              : isActive && previewPlaying
                                ? `Pause preview of ${track.title}`
                                : `Play preview of ${track.title}`
                          }
                        >
                          {isLoading ? (
                            <span className="spinner" />
                          ) : isActive && previewPlaying ? (
                            <MdPause size={18} />
                          ) : (
                            <MdPlayArrow size={20} />
                          )}
                        </S.SongPickerPlay>
                      </ShouldRender>
                    </div>
                    <ShouldRender if={isActive}>
                      <S.SongPickerSeek>
                        <time>{mmss(previewPosition)}</time>
                        <input
                          type="range"
                          min={0}
                          max={previewDuration || 0}
                          step={0.1}
                          value={Math.min(previewPosition, previewDuration || 0)}
                          onChange={(e) => seekPreview(Number(e.target.value))}
                          aria-label={`Seek preview of ${track.title}`}
                        />
                        <time className="end">{mmss(previewDuration)}</time>
                      </S.SongPickerSeek>
                    </ShouldRender>
                  </S.SongPickerRow>
                );
              })}
            </S.SongPickerList>
          </ShouldRender>

            <S.SongPickerActions>
              <Dialog.Close asChild>
                <S.DialogCancelButton type="button">Close</S.DialogCancelButton>
              </Dialog.Close>
              <S.DialogSubmitButton
                type="button"
                disabled={!hasSelection || savingId !== null}
                onClick={confirmSelected}
              >
                {savingId !== null ? "Setting…" : "Select"}
              </S.DialogSubmitButton>
            </S.SongPickerActions>

            {/* Hidden preview players — never shown, drive the row play buttons */}
            {/* biome-ignore lint/a11y/useMediaCaption: user-uploaded music has no captions */}
            <audio ref={audioRef} preload="none" style={{ display: "none" }} />
            <div
              ref={spotifyHostRef}
              aria-hidden
              style={{
                height: 1,
                opacity: 0,
                overflow: "hidden",
                pointerEvents: "none",
                position: "absolute",
                width: 1,
              }}
            />
          </S.SongPickerContent>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
