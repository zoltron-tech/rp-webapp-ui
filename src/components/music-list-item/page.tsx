"use client";

import { Flex, ShouldRender } from "@novelist-world/ui";
import classNames from "classnames";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { FaPause, FaPlay, FaRegCopy, FaRegEdit } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { RiFlagFill } from "react-icons/ri";
import { deleteSongAction } from "@/app/rp/profile/[slug]/music/action";
import { reportAction } from "@/app/rp/thread/actions";
import { useMusicContext } from "@/context";
import { useGlobalState } from "@/context/store/stores";
import { useCustomEvents, useUIContext } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Tag } from "@/types/common";
import type { Song } from "@/types/music";
import { API_MESSAGE } from "@/utils/constants";
import { EVENTS } from "@/utils/constants/custom-events";
import { ROUTES } from "@/utils/constants/routes";
import { AvatarNew } from "../common/avatar-new";
import { Username } from "../common/username";
import { AppAlertDialog } from "../dialog";
import { AppDropdownMenu } from "../profile-more-dropdown";
import { UpdateSongInfoForm } from "../update-song-info";
import * as S from "./styles";

type Props = React.HTMLProps<HTMLDivElement> & {
  song: Song;
};

export const MusicListItem: FC<Props> = ({ song, className, ...rest }) => {
  // Get music state directly from global store
  const musicState = useGlobalState("musicPlayer");
  const { playingSongId, progress } = musicState;

  // Get music control functions from context
  const {
    playSong,
    pauseSong,
    isPlaying,
    isActiveSong,
    seek,
    getCurrentTime,
    getDuration,
    formatTime,
  } = useMusicContext();

  const playing = isPlaying(song.id);
  const novelist = useGlobalState("novelist");
  const authState = useGlobalState("authState");
  const active = isActiveSong(song.id);
  const isOwner = song.novelist.id === novelist?.id;
  const { successToast, errorToast, warningToast } = useUIContext();
  const [showEditSongAlert, setShowEditSongAlert] = useState(false);
  const [showDeleteSongAlert, setShowDeleteSongAlert] = useState(false);
  const [showReportSongAlert, setShowReportSongAlert] = useState(false);
  const { emit } = useCustomEvents(EVENTS.SONG.base);
  const [editSongPayload, setEditSongPayload] = useState<{
    id: string;
    name: string;
    description?: string | null;
    tags?: Tag[];
  }>();
  const songNameRef = useRef<HTMLDivElement>(null);
  const songNameWrapperRef = useRef<HTMLDivElement>(null);
  const [isNameOverflow, setIsNameOverflow] = useState(false);

  const { routeToPage } = usePageRouter();

  const onAuthorAvatarClick = (username: string) => {
    if (username) routeToPage(ROUTES.Profile.View(username).Index);
  };

  useEffect(() => {
    const checkOverflow = () => {
      if (songNameRef.current && songNameWrapperRef.current) {
        const isOverflow =
          songNameRef.current.scrollWidth >
          songNameWrapperRef.current.clientWidth;
        setIsNameOverflow(isOverflow);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow, { passive: true });
    return () => window.removeEventListener("resize", checkOverflow);
  }, [song.name]);

  const dropdownItems = isOwner
    ? [
        {
          icon: <FaRegCopy />,
          label: "Copy song info",
          onClick: () => {
            handleCopySongName();
          },
        },
        {
          icon: <FaRegEdit />,
          label: "Edit song info",
          onClick: () => {
            setEditSongPayload({
              description: song.description,
              id: song.id,
              name: song.name,
              tags: song.tags,
            });
            setShowEditSongAlert(true);
          },
        },
        {
          separator: true,
        },
        {
          icon: <FaRegTrashCan />,
          label: "Delete this song",
          onClick: () => setShowDeleteSongAlert(true),
          variant: "danger" as const,
        },
      ]
    : [
        {
          icon: <RiFlagFill />,
          label: "Report this song",
          onClick: () => setShowReportSongAlert(true),
          variant: "danger" as const,
        },
      ];

  const handleReportSong = useCallback(async () => {
    if (!song.id) return;

    const response = await reportAction(song.id, "", "SONG");
    if (response?.message === API_MESSAGE.Success) {
      successToast(`Reported successfully`);
    } else {
      errorToast("There was an issue while reporting this song.");
    }
  }, [song.id, successToast, errorToast]);

  const handleDeleteSong = useCallback(async () => {
    if (!song.id) return;

    const response = await deleteSongAction(song.id);
    if (response?.message === API_MESSAGE.Success) {
      successToast(`Deleted successfully`);
      setShowDeleteSongAlert(false);
      emit(EVENTS.SONG.DELETED, {
        id: song.id,
      });
    } else {
      errorToast("There was an issue while deleting this song.");
    }
  }, [song.id, successToast, errorToast]);

  const handleCopySongName = () => {
    if (song.name) {
      navigator.clipboard.writeText(
        song.name + (song.description ? ` - ${song.description}` : ""),
      );
      successToast("Song info copied to clipboard");
    }
  };

  const togglePlay = async () => {
    if (playing) {
      pauseSong();
    } else {
      await playSong(song.id, song.url, song.name);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    seek(percentage);
  };

  return (
    <S.CardWrapper
      className={classNames([className])}
      $isPlaying={active}
      $hasTags={song.tags.length > 0}
      $hasDescription={Boolean(song.description?.trim())}
      {...rest}
    >
      <UpdateSongInfoForm
        payload={song}
        open={showEditSongAlert}
        setOpen={setShowEditSongAlert}
      />
      <S.Card>
        <S.Info>
          <Flex>
            <S.PlayButton
              onClick={togglePlay}
              aria-label={playing ? "Pause song" : "Play song"}
            >
              {playing ? <FaPause /> : <FaPlay />}
            </S.PlayButton>
            <Flex direction="column" justify="flex-start" align="flex-start">
              <S.SongNameWrapper ref={songNameWrapperRef}>
                <S.SongName
                  ref={songNameRef}
                  $isOverflow={isNameOverflow}
                  $isPlaying={playing}
                >
                  {song.name}
                </S.SongName>
              </S.SongNameWrapper>
              <S.AuthorPill
                onClick={() => onAuthorAvatarClick(song.novelist.username)}
              >
                <AvatarNew
                  src={song.novelist.image}
                  alt={song.novelist.username}
                />
                <S.AuthorName>{song.novelist.firstName}</S.AuthorName>
              </S.AuthorPill>
              <S.SongDescription>{song.description}</S.SongDescription>
            </Flex>
          </Flex>
          {active && (
            <S.ProgressBarContainer>
              <S.TimeDisplay>{formatTime(getCurrentTime())}</S.TimeDisplay>
              <S.ProgressBar onClick={handleSeek}>
                <S.ProgressFill style={{ width: `${progress}%` }} />
              </S.ProgressBar>
              <S.TimeDisplay>{formatTime(getDuration())}</S.TimeDisplay>
            </S.ProgressBarContainer>
          )}
          <S.SongTags>
            {song.tags.map((tag) => (
              <S.SongTag key={tag.id} $color={tag.color}>
                {tag.label}
              </S.SongTag>
            ))}
          </S.SongTags>
        </S.Info>
      </S.Card>
      <S.HeaderDropdownMenuContainer>
        <ShouldRender if={authState === "LOGGED_IN"}>
          <AppDropdownMenu
            trigger={<BsThreeDots size={18} />}
            items={dropdownItems}
          />
        </ShouldRender>
      </S.HeaderDropdownMenuContainer>
      <AppAlertDialog
        heading={`Report this song?`}
        text={`We strive to maintain a safe and welcoming community. If you notice any misconduct from anyone, please report it. Our team will review the issue and take appropriate action as quickly as possible.`}
        open={showReportSongAlert}
        onOpenChange={setShowReportSongAlert}
        onConfirm={handleReportSong}
        actionButtonLabel="Report"
      />
      <AppAlertDialog
        heading={`Delete this song?`}
        text={`Deleting the song will remove all of its threads and replies too. Are you sure you want to delete this song?`}
        open={showDeleteSongAlert}
        onOpenChange={setShowDeleteSongAlert}
        onConfirm={handleDeleteSong}
        actionButtonLabel="Delete"
      />
    </S.CardWrapper>
  );
};
