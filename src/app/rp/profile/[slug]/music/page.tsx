"use client";

import type { Song } from "@nw/types/music";
import { useParams } from "@/lib/navigation";
import { useEffect, useState } from "react";
import { MdOutlineCloudUpload } from "react-icons/md";
import { BreadCrumb } from "@/components/breadcrumb";
import { AddNewButton } from "@/components/common";
import { MusicListItem } from "@/components/music-list-item/page";
import { useMusicContext } from "@/context";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { useCustomEvents } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import {
  type CustomEventType,
  EVENTS,
  type ItemDeletedPayload,
  type SongUpdatedPayload,
} from "@/utils/constants/custom-events";
import { getOwnMusicAction } from "./action";
import * as S from "./styles";

export default function SongsListPage({}) {
  const params = useParams();
  const authState = useGlobalState("authState");
  const { playingSongId } = useGlobalState("musicPlayer");
  const setGlobalState = useGlobalStoreSet();
  const [songs, setSongs] = useState<Song[] | null>(null);
  const username = params?.slug as string;
  const { baseDataLoader } = usePageRouter();
  const { routeToPage } = usePageRouter();
  const { on, off } = useCustomEvents(EVENTS.SONG.base);
  const { clearSong } = useMusicContext();

  const fetchMusic = async () => {
    const _songs = await baseDataLoader(() => getOwnMusicAction());
    setSongs(_songs);
  };

  useEffect(() => {
    if (authState === "LOADING" || songs) return;

    fetchMusic();
  }, [authState, fetchMusic]);

  useEffect(() => {
    const handleSongDeleted = (e: CustomEventType<ItemDeletedPayload>) => {
      const songId = e.detail.id;

      setSongs((prev) => prev?.filter((song) => song.id !== songId) || []);

      if (playingSongId === songId) {
        clearSong();
      }
    };

    on(EVENTS.SONG.DELETED, handleSongDeleted);

    return () => {
      off(EVENTS.SONG.DELETED, handleSongDeleted);
    };
  }, [on, off, playingSongId, setGlobalState, clearSong]);

  useEffect(() => {
    const handleSongUpdated = (e: CustomEventType<SongUpdatedPayload>) => {
      const songId = e.detail.id;
      const songName = e.detail.name;
      const songDescription = e.detail.description;
      const songTags = e.detail.tags;

      setSongs((prev) => {
        if (!prev || prev.length === 0) return prev;
        return prev.map((song) => {
          if (song.id === songId) {
            return {
              ...song,
              description: songDescription ?? song.description,
              name: songName,
              tags: songTags ?? song.tags,
            };
          }
          return song;
        });
      });

      if (playingSongId === songId) {
        setGlobalState((prev) => ({
          musicPlayer: {
            ...prev.musicPlayer,
            playingSongName: songName,
          },
        }));
      }
    };

    on(EVENTS.SONG.UPDATED, handleSongUpdated);

    return () => {
      off(EVENTS.SONG.UPDATED, handleSongUpdated);
    };
  }, [on, off, playingSongId, setGlobalState]);

  return (
    <S.Container>
      <BreadCrumb label="Music" username={username} />
      <AddNewButton
        label="Upload a new song"
        icon={<MdOutlineCloudUpload size={20} />}
        onClick={() => routeToPage(`/rp/profile/music/create`)}
      />
      <S.SongListContainer>
        {songs?.map((song) => {
          return <MusicListItem key={song.id} song={song} />;
        })}
      </S.SongListContainer>
    </S.Container>
  );
}
