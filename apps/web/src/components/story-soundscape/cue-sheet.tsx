"use client";

import type { SoundCue } from "@nw/types";
import type { Song } from "@nw/types/music";
import { type FC, useEffect, useRef, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { LuMusic, LuRepeat } from "react-icons/lu";
import { ResponsiveSheet } from "@/components/common/responsive-sheet";
import * as F from "@/components/common/responsive-sheet/styles";
import * as S from "./styles";
import { WaveformTrimmer } from "./waveform-trimmer";

/** Cue accents — the same palette the timeline lanes and codex entries use. */
export const CUE_COLORS = [
  "#e5484d",
  "#f76b15",
  "#ffb224",
  "#46a758",
  "#12a594",
  "#0091ff",
  "#6e56cf",
  "#e93d82",
];

type Props = {
  open: boolean;
  /** Null when adding a cue; it spans `defaultRange`. */
  cue: SoundCue | null;
  defaultRange: { start: number; end: number };
  /** The author's uploaded library. */
  songs: Song[];
  loadingSongs: boolean;
  passageCount: number;
  canEdit: boolean;
  onClose: () => void;
  onSave: (cue: SoundCue) => unknown;
  onDelete?: (cue: SoundCue) => unknown;
};

/**
 * A cue's detail: what it plays, over which passages, and how it fades.
 *
 * Only the author's own uploaded songs are offered. Spotify is excluded on
 * purpose — its embed player has no programmatic seek or volume, which a
 * clipped, fading cue needs.
 */
export const CueSheet: FC<Props> = ({
  open,
  cue,
  defaultRange,
  songs,
  loadingSongs,
  passageCount,
  canEdit,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState("");
  const [songId, setSongId] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [clipStart, setClipStart] = useState<number | null>(null);
  const [clipEnd, setClipEnd] = useState<number | null>(null);
  const [volume, setVolume] = useState(1);
  const [isLoop, setIsLoop] = useState(false);
  const [fadeIn, setFadeIn] = useState(2);
  const [fadeOut, setFadeOut] = useState(2);
  // Held while a delete is in flight: no second delete, no save, no closing.
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!cue || !onDelete || deleting) return;
    setDeleting(true);
    try {
      await onDelete(cue);
    } finally {
      setDeleting(false);
    }
  };

  /** Read when the sheet opens, never depended on: the parent builds this
   *  inline, so a fresh object arrives on every render and depending on it
   *  would reset the form under the author — including after a failed save. */
  const defaultRangeRef = useRef(defaultRange);
  defaultRangeRef.current = defaultRange;

  useEffect(() => {
    if (!open) return;
    setName(cue?.name ?? "");
    setSongId(cue?.songId ?? null);
    setColor(cue?.color ?? CUE_COLORS[0]);
    setStart(cue?.startThreadOrdinal ?? defaultRangeRef.current.start);
    setEnd(cue?.endThreadOrdinal ?? defaultRangeRef.current.end);
    setClipStart(cue?.clipStartSec ?? null);
    setClipEnd(cue?.clipEndSec ?? null);
    setVolume(cue?.volume ?? 1);
    setIsLoop(cue?.isLoop ?? false);
    setFadeIn(cue?.fadeInSec ?? 2);
    setFadeOut(cue?.fadeOutSec ?? 2);
  }, [open, cue]);

  const trimmed = name.trim();
  const selectedSong = songs.find((song) => song.id === songId) ?? null;
  const lastPassage = Math.max(0, passageCount - 1);

  return (
    <ResponsiveSheet
      open={open}
      wide
      title={cue ? "Cue" : "New cue"}
      confirmDisabled={trimmed.length === 0 || !songId || deleting}
      onConfirm={
        canEdit
          ? () =>
              onSave({
                clipEndSec: clipEnd,
                clipStartSec: clipStart,
                color,
                endThreadOrdinal: Math.max(start, end),
                fadeInSec: fadeIn,
                fadeOutSec: fadeOut,
                id: cue?.id ?? null,
                isLoop,
                name: trimmed,
                songId,
                sourceType: "LIBRARY_SONG",
                startThreadOrdinal: Math.min(start, end),
                volume,
              })
          : undefined
      }
      onClose={() => {
        if (!deleting) onClose();
      }}
    >
      {!canEdit ? (
        <F.Hint>Only members of this story can change its soundscape.</F.Hint>
      ) : (
        <>
          <F.Field>
            Name
            <F.TextInput
              value={name}
              maxLength={80}
              placeholder="Tide against the sea wall"
              onChange={(e) => setName(e.target.value)}
            />
          </F.Field>

          <F.Field as="div">
            Audio — from your uploaded music
            <S.SongList>
              {loadingSongs && <F.Hint>Loading your library…</F.Hint>}
              {!loadingSongs && songs.length === 0 && (
                <F.Hint>
                  You haven't uploaded any music yet. Add a track to your
                  library and it will show up here.
                </F.Hint>
              )}
              {songs.map((song) => (
                <S.SongItem
                  key={song.id}
                  type="button"
                  $active={songId === song.id}
                  onClick={() => {
                    setSongId(song.id);
                    // A different track makes the old clip meaningless.
                    if (song.id !== cue?.songId) {
                      setClipStart(null);
                      setClipEnd(null);
                    }
                    if (!trimmed) setName(song.name);
                  }}
                >
                  <LuMusic size={15} />
                  <span>{song.name}</span>
                </S.SongItem>
              ))}
            </S.SongList>
          </F.Field>

          {selectedSong && (
            <F.Field as="div">
              Clip
              <WaveformTrimmer
                src={selectedSong.url}
                clipStart={clipStart}
                clipEnd={clipEnd}
                onChange={({ start: from, end: to }) => {
                  setClipStart(from);
                  setClipEnd(to);
                }}
              />
            </F.Field>
          )}

          <F.Field as="div">
            Starts at passage
            <F.RangeRow>
              <input
                type="range"
                min={0}
                max={lastPassage}
                step={1}
                value={start}
                aria-label="Starts at passage"
                onChange={(e) => setStart(Number(e.target.value))}
              />
              <F.RangeValue>P{start + 1}</F.RangeValue>
            </F.RangeRow>
          </F.Field>

          <F.Field as="div">
            Ends at passage
            <F.RangeRow>
              <input
                type="range"
                min={0}
                max={lastPassage}
                step={1}
                value={end}
                aria-label="Ends at passage"
                onChange={(e) => setEnd(Number(e.target.value))}
              />
              <F.RangeValue>P{end + 1}</F.RangeValue>
            </F.RangeRow>
          </F.Field>

          <F.Field as="div">
            Volume
            <F.RangeRow>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                aria-label="Volume"
                onChange={(e) => setVolume(Number(e.target.value))}
              />
              <F.RangeValue>{Math.round(volume * 100)}%</F.RangeValue>
            </F.RangeRow>
          </F.Field>

          <F.Field as="div">
            Fade in
            <F.RangeRow>
              <input
                type="range"
                min={0}
                max={20}
                step={0.5}
                value={fadeIn}
                aria-label="Fade in"
                onChange={(e) => setFadeIn(Number(e.target.value))}
              />
              <F.RangeValue>{fadeIn.toFixed(1)}s</F.RangeValue>
            </F.RangeRow>
          </F.Field>

          <F.Field as="div">
            Fade out
            <F.RangeRow>
              <input
                type="range"
                min={0}
                max={20}
                step={0.5}
                value={fadeOut}
                aria-label="Fade out"
                onChange={(e) => setFadeOut(Number(e.target.value))}
              />
              <F.RangeValue>{fadeOut.toFixed(1)}s</F.RangeValue>
            </F.RangeRow>
          </F.Field>

          <F.ToggleRow
            type="button"
            $active={isLoop}
            aria-pressed={isLoop}
            onClick={() => setIsLoop((v) => !v)}
          >
            <LuRepeat size={16} />
            Loop — for ambience shorter than the passages it covers
          </F.ToggleRow>

          <F.Field as="div">
            Colour
            <F.SwatchRow>
              {CUE_COLORS.map((swatch) => (
                <F.Swatch
                  key={swatch}
                  type="button"
                  $color={swatch}
                  $active={color === swatch}
                  aria-label={`Colour ${swatch}`}
                  aria-pressed={color === swatch}
                  onClick={() => setColor(swatch)}
                />
              ))}
            </F.SwatchRow>
          </F.Field>

          {cue && onDelete && (
            <F.DangerButton
              type="button"
              disabled={deleting}
              aria-busy={deleting}
              onClick={handleDelete}
            >
              <FaRegTrashCan size={13} />
              Delete cue
            </F.DangerButton>
          )}
        </>
      )}
    </ResponsiveSheet>
  );
};
