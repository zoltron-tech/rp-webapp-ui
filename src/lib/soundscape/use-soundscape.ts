"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SoundCue } from "@/types";

/**
 * The reader's soundscape engine.
 *
 * One `AudioContext`; each active cue is a `MediaElementAudioSourceNode` into
 * its own `GainNode`, into a master gain. As the reader's passage position
 * moves into a cue's range the cue seeks to its clip start, plays, and ramps
 * up over `fadeInSec`; leaving the range ramps down over `fadeOutSec` and then
 * pauses.
 *
 * Browsers block audio until a user gesture, so nothing starts until the
 * reader taps the enable toggle — which is also the master mute, remembered
 * per reader.
 */

const STORAGE_KEY = "nw:soundscape-enabled";

/** Never let a chapter open more than this many simultaneous streams. */
const MAX_CONCURRENT_CUES = 4;

/**
 * How far ahead of the reader a cue's audio starts downloading. Everything
 * else stays `preload="none"`, so opening a chapter with a dozen cues doesn't
 * fetch a dozen tracks.
 */
const PRELOAD_LOOKAHEAD_PASSAGES = 1;

/** A gain ramp needs a non-zero target — exponential ramps can't reach 0. */
const SILENCE = 0.0001;

interface Voice {
  element: HTMLAudioElement;
  gain: GainNode;
  /** Whether this cue is currently inside the reader's range. */
  active: boolean;
}

const isInRange = (cue: SoundCue, position: number) =>
  position >= cue.startThreadOrdinal && position <= cue.endThreadOrdinal;

const isNear = (cue: SoundCue, position: number) =>
  position >= cue.startThreadOrdinal - PRELOAD_LOOKAHEAD_PASSAGES &&
  position <= cue.endThreadOrdinal + PRELOAD_LOOKAHEAD_PASSAGES;

interface Options {
  cues: SoundCue[];
  /** The passage the reader is on (0-based), from whichever reading mode. */
  position: number;
}

export const useSoundscape = ({ cues, position }: Options) => {
  // Off until the reader asks for it: browsers block audio before a gesture,
  // and unrequested sound is worse than none.
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);

  const contextRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const voicesRef = useRef(new Map<string, Voice>());

  // Remember the reader's choice, but never auto-start: the stored preference
  // decides what the toggle shows, and the tap is what actually resumes the
  // context.
  const [remembered, setRemembered] = useState(false);
  useEffect(() => {
    try {
      setRemembered(window.localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      // Private browsing can refuse storage; the toggle still works.
    }
  }, []);

  const teardown = useCallback(() => {
    for (const voice of voicesRef.current.values()) {
      voice.element.pause();
      voice.element.src = "";
    }
    voicesRef.current.clear();
    contextRef.current?.close().catch(() => {
      // Closing an already-closed context is not worth surfacing.
    });
    contextRef.current = null;
    masterRef.current = null;
    setReady(false);
  }, []);

  const enable = useCallback(async () => {
    if (contextRef.current) {
      await contextRef.current.resume();
      setEnabled(true);
      return;
    }
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;

    const context = new Ctor();
    // Mobile Safari starts the context suspended even inside a gesture.
    await context.resume();
    const master = context.createGain();
    master.gain.value = 1;
    master.connect(context.destination);

    contextRef.current = context;
    masterRef.current = master;
    setReady(true);
    setEnabled(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // See above.
    }
  }, []);

  const disable = useCallback(() => {
    setEnabled(false);
    teardown();
    try {
      window.localStorage.setItem(STORAGE_KEY, "false");
    } catch {
      // See above.
    }
  }, [teardown]);

  const toggle = useCallback(() => {
    if (enabled) disable();
    else enable();
  }, [enabled, disable, enable]);

  // Tear the graph down when the chapter (or the component) goes away.
  useEffect(() => teardown, [teardown]);

  /** Builds — or reuses — the audio graph for one cue. */
  const voiceFor = useCallback((cue: SoundCue): Voice | null => {
    const context = contextRef.current;
    const master = masterRef.current;
    if (!context || !master || !cue.id || !cue.audioUrl) return null;

    const existing = voicesRef.current.get(cue.id);
    if (existing) return existing;

    const element = new Audio();
    element.crossOrigin = "anonymous";
    element.preload = "none";
    element.loop = false;
    element.src = cue.audioUrl;

    const gain = context.createGain();
    gain.gain.value = SILENCE;
    context.createMediaElementSource(element).connect(gain);
    gain.connect(master);

    const voice: Voice = { active: false, element, gain };
    voicesRef.current.set(cue.id, voice);
    return voice;
  }, []);

  // The trigger loop: everything the engine does follows from the reader's
  // current passage.
  useEffect(() => {
    if (!enabled || !ready) return;
    const context = contextRef.current;
    if (!context) return;

    const now = context.currentTime;
    // Nearest cues win when more are in range than can be played at once —
    // a wall of overlapping tracks is noise, not a soundscape.
    const inRange = cues
      .filter((cue) => cue.id && cue.audioUrl && isInRange(cue, position))
      .slice(0, MAX_CONCURRENT_CUES);
    const playing = new Set(inRange.map((cue) => cue.id));

    for (const cue of cues) {
      if (!cue.id || !cue.audioUrl) continue;
      const wanted = playing.has(cue.id);
      const voice = voicesRef.current.get(cue.id);

      if (wanted) {
        const target = voiceFor(cue);
        if (!target) continue;
        if (!target.active) {
          target.active = true;
          target.element.preload = "auto";
          target.element.loop = cue.isLoop;
          target.element.currentTime = cue.clipStartSec ?? 0;
          target.gain.gain.cancelScheduledValues(now);
          target.gain.gain.setValueAtTime(SILENCE, now);
          target.gain.gain.linearRampToValueAtTime(
            Math.max(SILENCE, cue.volume),
            now + Math.max(0.01, cue.fadeInSec),
          );
          target.element.play().catch(() => {
            // Autoplay can still be refused (a background tab, say); the next
            // position change tries again.
            target.active = false;
          });
        } else {
          // Volume can change while a cue is playing.
          target.gain.gain.linearRampToValueAtTime(
            Math.max(SILENCE, cue.volume),
            now + 0.1,
          );
        }
        continue;
      }

      if (voice?.active) {
        voice.active = false;
        const fade = Math.max(0.01, cue.fadeOutSec);
        voice.gain.gain.cancelScheduledValues(now);
        voice.gain.gain.setValueAtTime(voice.gain.gain.value, now);
        voice.gain.gain.linearRampToValueAtTime(SILENCE, now + fade);
        const element = voice.element;
        window.setTimeout(() => {
          // Only pause if the reader hasn't wandered back in the meantime.
          if (!voicesRef.current.get(cue.id ?? "")?.active) element.pause();
        }, fade * 1000);
      } else if (voice && !isNear(cue, position)) {
        // Well out of range — stop holding the download open.
        voice.element.preload = "none";
      }
    }
  }, [cues, position, enabled, ready, voiceFor]);

  // The clip end is enforced here rather than with `loop`, because a clip is a
  // *slice*: looping the element would restart the whole track, not the slice.
  useEffect(() => {
    if (!enabled || !ready) return;

    const tick = window.setInterval(() => {
      for (const cue of cues) {
        if (!cue.id || cue.clipEndSec == null) continue;
        const voice = voicesRef.current.get(cue.id);
        if (!voice?.active) continue;
        if (voice.element.currentTime < cue.clipEndSec) continue;

        if (cue.isLoop) {
          voice.element.currentTime = cue.clipStartSec ?? 0;
        } else {
          voice.element.pause();
        }
      }
    }, 200);

    return () => window.clearInterval(tick);
  }, [cues, enabled, ready]);

  return {
    /** How many cues are audible right now — drives the toggle's badge. */
    activeCount: enabled
      ? cues.filter((cue) => cue.audioUrl && isInRange(cue, position)).length
      : 0,
    /** True once the reader has turned the soundscape on. */
    enabled,
    /** Whether the reader had it on last time, for the toggle's hint. */
    remembered,
    toggle,
  };
};
