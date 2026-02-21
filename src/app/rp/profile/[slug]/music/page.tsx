"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  MdOutlineCloudUpload,
  MdOutlineKeyboardDoubleArrowRight,
} from "react-icons/md";
import { BreadCrumb } from "@/components/breadcrumb";
import { MusicListItem } from "@/components/music-list-item/page";
import { useGlobalState } from "@/context/store/stores";
import { useCustomEvents, useUIContext } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Song } from "@/types/music";
import { EVENTS } from "@/utils/constants/custom-events";
import { getOwnMusicAction } from "./action";
import * as S from "./styles";

export default function SongsListPage({}) {
  const params = useParams();
  const user = useGlobalState("user");
  const authState = useGlobalState("authState");
  const [songs, setSongs] = useState<Song[] | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(
    new Set(),
  );
  const username = params?.slug as string;
  const { baseDataLoader } = usePageRouter();
  const { on, off } = useCustomEvents(EVENTS.MUSE.base);
  const { successToast } = useUIContext();
  const { routeToPage } = usePageRouter();

  const fetchMusic = async () => {
    const _songs = await baseDataLoader(() => getOwnMusicAction());
    setSongs(_songs);
  };

  const toggleDescription = (songId: string) => {
    setExpandedDescriptions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(songId)) {
        newSet.delete(songId);
      } else {
        newSet.add(songId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (authState === "LOADING" || songs) return;

    fetchMusic();
  }, [authState]);

  return (
    <S.Container>
      <BreadCrumb label="Music" username={username} />
      <S.SeeMoreLink onClick={() => routeToPage(`/rp/profile/music/create`)}>
        <span>
          Upload a new song
          <MdOutlineCloudUpload size={20} />
        </span>
      </S.SeeMoreLink>
      <S.SongListContainer>
        {songs?.map((song) => {
          return <MusicListItem key={song.id} song={song} />;
        })}
      </S.SongListContainer>
    </S.Container>
  );
}
