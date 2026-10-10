import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";

/**
 * One thing plays at a time, and nothing plays on a screen nobody is looking at.
 *
 * Two rules, one place. Every player in the app — a profile's song, a muse's
 * featured track, a clip in a chat bubble or a feed card, the gallery viewer's
 * video — registers here while it plays:
 *
 * 1. **Starting one pauses the rest.** Two soundtracks for one pair of ears is
 *    noise, and two decoders for one screen is battery. A song and a clip on
 *    the same phone are still two players, so the slot is module-wide rather
 *    than per screen or per kind.
 *
 * 2. **Leaving pauses.** A song that kept playing after its profile was
 *    popped, or a clip still running under the screen pushed over it, is the
 *    bug this file exists for. The hook pauses its player when the screen it
 *    is on loses focus — pushed over, tab switched, popped — and when the app
 *    goes to the background.
 *
 * The slot holds a `pause` and nothing else: what a player *is* (an
 * `expo-video` instance, a Spotify embed in a web view) stays its own
 * business, and a released `expo-video` player throws on any call, so every
 * pause here is guarded.
 */

export interface Playable {
  pause: () => void;
}

let current: Playable | null = null;

const quietly = (handle: Playable) => {
  try {
    handle.pause();
  } catch {
    // Released, or already gone: nothing left to pause.
  }
};

/** Make `handle` the one playing, pausing whatever was. */
export const claimPlayback = (handle: Playable) => {
  if (current && current !== handle) quietly(current);
  current = handle;
};

/** `handle` is no longer on screen; the slot is free if it was its. */
export const releasePlayback = (handle: Playable) => {
  if (current === handle) current = null;
};

/** Pause whatever is playing, wherever it is. */
export const stopPlayback = () => {
  if (current) quietly(current);
  current = null;
};

/**
 * Puts a player under the two rules.
 *
 * `playing` is the player's own report (a `playingChange` event, an embed's
 * playback update): when it turns true the player takes the slot, and the one
 * that had it is paused. `pause` is read through a ref, so the latest closure
 * is always the one called and the handle's identity never changes.
 */
export const usePlaybackSlot = (pause: () => void, playing: boolean) => {
  const handle = useRef<Playable>({ pause });
  handle.current.pause = pause;

  useEffect(() => {
    if (playing) claimPlayback(handle.current);
  }, [playing]);

  // Gone from the tree: not the one playing, whatever it was doing.
  useEffect(() => {
    const own = handle.current;
    return () => releasePlayback(own);
  }, []);

  // The screen this player is on went behind another, or was left.
  useFocusEffect(
    useCallback(() => {
      const own = handle.current;
      return () => quietly(own);
    }, []),
  );

  // The app itself went behind another.
  useEffect(() => {
    const own = handle.current;
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") quietly(own);
    });
    return () => subscription.remove();
  }, []);
};
