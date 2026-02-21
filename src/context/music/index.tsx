"use client";

import type { FC, ReactNode } from "react";
import { createContext, useContext, useRef, useState } from "react";

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
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [playingSongUrl, setPlayingSongUrl] = useState<string | null>(null);
  const [playingSongName, setPlayingSongName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSong = async (
    songId: string,
    songUrl: string,
    songName: string,
  ) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
      audioRef.current.addEventListener("ended", handleEnded);
    }

    // If same song and it's paused, just resume
    if (playingSongId === songId && playingSongUrl === songUrl) {
      if (audioRef.current.paused) {
        await audioRef.current.play();
      }
      return;
    }

    // Stop current song and play new one
    audioRef.current.pause();
    audioRef.current.src = songUrl;
    await audioRef.current.play();
    setPlayingSongId(songId);
    setPlayingSongUrl(songUrl);
    setPlayingSongName(songName);
    setProgress(0);
  };

  const pauseSong = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    // Don't clear playingSongId - preserve state for navigation
  };

  const clearSong = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayingSongId(null);
    setPlayingSongUrl(null);
    setPlayingSongName(null);
    setProgress(0);
  };

  const isPlaying = (songId: string) => {
    if (playingSongId !== songId) return false;
    // Check if audio is actually playing (not paused)
    return audioRef.current ? !audioRef.current.paused : false;
  };

  const isActiveSong = (songId: string) => {
    return playingSongId === songId;
  };

  const isAnyPlaying = () => {
    return audioRef.current ? !audioRef.current.paused : false;
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  const getProgress = () => progress;

  const getCurrentTime = () => {
    return audioRef.current?.currentTime || 0;
  };

  const getDuration = () => {
    return audioRef.current?.duration || 0;
  };

  const formatTime = (seconds: number): string => {
    if (!Number.isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const seek = (percentage: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = percentage * audioRef.current.duration;
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;

    const { currentTime, duration } = audioRef.current;
    if (!duration) return;

    setProgress((currentTime / duration) * 100);
  };

  const handleEnded = () => {
    setPlayingSongId(null);
    setPlayingSongUrl(null);
    setPlayingSongName(null);
    setProgress(0);
  };

  return (
    <MusicContext.Provider
      value={{
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
        playingSongId,
        playingSongName,
        playingSongUrl,
        playSong,
        progress,
        seek,
        togglePlayPause,
      }}
    >
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
