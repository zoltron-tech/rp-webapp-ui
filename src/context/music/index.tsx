"use client";

import type { StoreState } from "@nw/types/state";
import type { FC, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { StoreContext } from "@/context/store/context";
import { useGlobalStoreSet } from "@/context/store/stores";

interface MusicContextType {
  playingSongId: string | null;
  playingSongUrl: string | null;
  playingSongName: string | null;
  progress: number;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  playSong: (
    songId: string,
    songUrl: string,
    songName: string,
  ) => Promise<void>;
  pauseSong: () => void;
  clearSong: () => void;
  togglePlayPause: () => void;
  isPlaying: (songId: string) => boolean;
  isActiveSong: (songId: string) => boolean;
  isAnyPlaying: () => boolean;
  getProgress: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  formatTime: (seconds: number) => string;
  seek: (percentage: number) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const setStoreState = useGlobalStoreSet();

  // Get store context to read state without subscribing to changes
  const store = useContext(StoreContext<StoreState>("global-store"));
  const getStoreState = useCallback(() => store.get().musicPlayer, [store]);

  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return;

    const { currentTime, duration: dur } = audioRef.current;
    if (!dur) return;

    const newProgress = (currentTime / dur) * 100;
    const currentState = getStoreState();

    setStoreState({
      musicPlayer: {
        currentTime,
        duration: dur,
        playingSongId: currentState.playingSongId,
        playingSongName: currentState.playingSongName,
        playingSongUrl: currentState.playingSongUrl,
        progress: newProgress,
      },
    });
  }, [setStoreState, getStoreState]);

  const handleEnded = useCallback(() => {
    setStoreState({
      musicPlayer: {
        currentTime: 0,
        duration: 0,
        playingSongId: null,
        playingSongName: null,
        playingSongUrl: null,
        progress: 0,
      },
    });
  }, [setStoreState]);

  const playSong = useCallback(
    async (songId: string, songUrl: string, songName: string) => {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
        audioRef.current.addEventListener("ended", handleEnded);
      }

      const currentState = getStoreState();

      // If same song and it's paused, just resume
      if (
        currentState.playingSongId === songId &&
        currentState.playingSongUrl === songUrl
      ) {
        if (audioRef.current.paused) {
          await audioRef.current.play();
        }
        return;
      }

      // Stop current song and play new one
      audioRef.current.pause();
      audioRef.current.src = songUrl;
      await audioRef.current.play();
      setStoreState({
        musicPlayer: {
          currentTime: 0,
          duration: audioRef.current.duration || 0,
          playingSongId: songId,
          playingSongName: songName,
          playingSongUrl: songUrl,
          progress: 0,
        },
      });
    },
    [setStoreState, getStoreState, handleTimeUpdate, handleEnded],
  );

  const pauseSong = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    // Don't clear playingSongId - preserve state for navigation
  }, []);

  const clearSong = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setStoreState({
      musicPlayer: {
        currentTime: 0,
        duration: 0,
        playingSongId: null,
        playingSongName: null,
        playingSongUrl: null,
        progress: 0,
      },
    });
  }, [setStoreState]);

  const isPlaying = useCallback(
    (songId: string) => {
      const currentState = getStoreState();
      if (currentState.playingSongId !== songId) return false;
      // Check if audio is actually playing (not paused)
      return audioRef.current ? !audioRef.current.paused : false;
    },
    [getStoreState],
  );

  const isActiveSong = useCallback(
    (songId: string) => {
      const currentState = getStoreState();
      return currentState.playingSongId === songId;
    },
    [getStoreState],
  );

  const isAnyPlaying = useCallback(() => {
    return audioRef.current ? !audioRef.current.paused : false;
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, []);

  const getProgress = useCallback(() => {
    const currentState = getStoreState();
    return currentState.progress;
  }, [getStoreState]);

  const getCurrentTime = useCallback(() => {
    return audioRef.current?.currentTime || 0;
  }, []);

  const getDuration = useCallback(() => {
    return audioRef.current?.duration || 0;
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    if (!Number.isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const seek = useCallback((percentage: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = percentage * audioRef.current.duration;
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      audioRef,
      clearSong,
      formatTime,
      getCurrentTime,
      getDuration,
      getProgress,
      isActiveSong,
      isAnyPlaying,
      isPlaying,
      pauseSong,
      // These are read from store on-demand, not subscribed
      get playingSongId() {
        return getStoreState().playingSongId;
      },
      get playingSongName() {
        return getStoreState().playingSongName;
      },
      get playingSongUrl() {
        return getStoreState().playingSongUrl;
      },
      playSong,
      get progress() {
        return getStoreState().progress;
      },
      seek,
      togglePlayPause,
    }),
    [
      clearSong,
      formatTime,
      getCurrentTime,
      getDuration,
      getProgress,
      isActiveSong,
      isAnyPlaying,
      isPlaying,
      pauseSong,
      playSong,
      seek,
      togglePlayPause,
      getStoreState,
    ],
  );

  return (
    <MusicContext.Provider value={contextValue}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusicContext = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error("useMusicContext must be used within a MusicProvider");
  }
  return context;
};
