import type { SoundCue } from "@nw/types";
import { createVideoPlayer, type VideoPlayer } from "expo-video";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePlaybackSlot } from "@/lib/playback";

/**
 * The reader's soundscape — web's `useSoundscape`, on `expo-video` players.
 *
 * As the reader's passage moves into a cue's range the cue seeks to its clip
 * start, plays, and fades up over `fadeInSec`. Leaving the range fades it down
 * over `fadeOutSec`, then its player is released.
 *
 * Off until the reader asks for it: unrequested sound is worse than none. Web
 * has the same rule because a browser blocks audio before a gesture.
 *
 * Volume ramps are steps on a timer, because a player has no gain node. Twenty
 * a second is smoother than a listener can resolve and costs almost nothing.
 *
 * It takes the app's one playback slot, so a clip or a song starting elsewhere
 * stops it, and it stops when the screen loses focus.
 */

/** Never let a chapter open more than this many streams at once. */
const MAX_CONCURRENT_CUES = 4;
const FADE_STEP_MS = 50;

interface Voice {
  active: boolean;
  cue: SoundCue;
  fade: ReturnType<typeof setInterval> | null;
  player: VideoPlayer;
  subscription: { remove: () => void };
}

const inRange = (cue: SoundCue, position: number) =>
  position >= cue.startThreadOrdinal && position <= cue.endThreadOrdinal;

const quietly = (work: () => void) => {
  try {
    work();
  } catch {
    // A released player throws on any call; there is nothing left to do.
  }
};

export const useSoundscape = ({
  cues,
  position,
}: {
  cues: SoundCue[];
  /** The passage the reader is on, 0-based. */
  position: number;
}) => {
  const [enabled, setEnabled] = useState(false);
  const [activeCount, setActiveCount] = useState(0);
  const voices = useRef(new Map<string, Voice>());

  const release = useCallback((id: string) => {
    const voice = voices.current.get(id);
    if (!voice) return;
    if (voice.fade) clearInterval(voice.fade);
    voice.subscription.remove();
    quietly(() => voice.player.release());
    voices.current.delete(id);
  }, []);

  const releaseAll = useCallback(() => {
    for (const id of [...voices.current.keys()]) release(id);
    setActiveCount(0);
  }, [release]);

  /** A straight ramp to `to` over `seconds`, then `done`. */
  const ramp = useCallback(
    (voice: Voice, to: number, seconds: number, done?: () => void) => {
      if (voice.fade) clearInterval(voice.fade);
      voice.fade = null;
      const steps = Math.ceil((seconds * 1000) / FADE_STEP_MS);
      if (steps <= 0) {
        quietly(() => {
          voice.player.volume = to;
        });
        done?.();
        return;
      }
      const from = voice.player.volume;
      let step = 0;
      voice.fade = setInterval(() => {
        step += 1;
        quietly(() => {
          voice.player.volume = from + (to - from) * (step / steps);
        });
        if (step >= steps) {
          if (voice.fade) clearInterval(voice.fade);
          voice.fade = null;
          done?.();
        }
      }, FADE_STEP_MS);
    },
    [],
  );

  const start = useCallback(
    (cue: SoundCue) => {
      if (!cue.id || !cue.audioUrl) return;
      const player = createVideoPlayer(cue.audioUrl);
      const begin = cue.clipStartSec ?? 0;
      const finish = cue.clipEndSec ?? null;
      player.volume = 0;
      player.loop = cue.isLoop && finish === null;
      player.timeUpdateEventInterval = 0.25;
      if (begin > 0) player.currentTime = begin;

      // A clip's end has no native stop, so the position is watched.
      const subscription = player.addListener(
        "timeUpdate",
        ({ currentTime }) => {
          if (finish === null || currentTime < finish) return;
          quietly(() => {
            if (cue.isLoop) player.currentTime = begin;
            else player.pause();
          });
        },
      );

      const voice: Voice = {
        active: true,
        cue,
        fade: null,
        player,
        subscription,
      };
      voices.current.set(cue.id, voice);
      player.play();
      ramp(voice, cue.volume, cue.fadeInSec);
    },
    [ramp],
  );

  // What should be sounding at this passage, against what is.
  useEffect(() => {
    if (!enabled) return;
    const wanted = cues
      .filter((cue) => cue.id && inRange(cue, position))
      .slice(0, MAX_CONCURRENT_CUES);
    const wantedIds = new Set(wanted.map((cue) => cue.id as string));

    for (const [id, voice] of voices.current) {
      if (wantedIds.has(id)) {
        if (!voice.active) {
          voice.active = true;
          ramp(voice, voice.cue.volume, voice.cue.fadeInSec);
        }
      } else if (voice.active) {
        voice.active = false;
        ramp(voice, 0, voice.cue.fadeOutSec, () => release(id));
      }
    }
    for (const cue of wanted) {
      if (!voices.current.has(cue.id as string)) start(cue);
    }
    setActiveCount(wanted.length);
  }, [cues, enabled, position, ramp, release, start]);

  // A chapter's end, or another chapter: nothing outlives the screen.
  useEffect(() => releaseAll, [releaseAll]);

  const stop = useCallback(() => {
    setEnabled(false);
    releaseAll();
  }, [releaseAll]);

  usePlaybackSlot(stop, enabled && activeCount > 0);

  const toggle = useCallback(() => {
    if (enabled) stop();
    else setEnabled(true);
  }, [enabled, stop]);

  return { activeCount, enabled, toggle };
};
