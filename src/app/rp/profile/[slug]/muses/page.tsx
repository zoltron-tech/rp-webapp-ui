"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { HiUserAdd } from "react-icons/hi";
import { getAllMusesByUsernameAction } from "@/app/rp/muse/actions";
import { BreadCrumb } from "@/components/breadcrumb";
import { AddNewButton } from "@/components/common";
import { MuseCard } from "@/components/muse-card";
import { useGlobalState } from "@/context/store/stores";
import { useCustomEvents, useUIContext } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Muse } from "@/types";
import {
  type CustomEventType,
  EVENTS,
  type MuseDeletedPayload,
} from "@/utils/constants/custom-events";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styles";

export default function MusesListPage({}) {
  const params = useParams();
  const [muses, setMuses] = useState<Muse[] | null>(null);
  const authState = useGlobalState("authState");
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const username = params?.slug as string;
  const isCurrentUser = user?.username === username;
  const { baseDataLoader } = usePageRouter();
  const { on, off } = useCustomEvents(EVENTS.MUSE.base);
  const { successToast } = useUIContext();
  const { routeToPage } = usePageRouter();
  const [visibility, setVisibility] = useState({
    FRIENDS: true,
    ONLY_ME: true,
    PUBLIC: true,
  });
  const [search, setSearch] = useState("");

  const backgroundTiles = useMemo(
    () =>
      muses?.map((muse) => ({
        image: muse.image || "",
        left: 5 + Math.random() * 80,
        rotation: -45 + Math.random() * 90,
        scale: 1.5 + Math.random() * 2.5,
        top: 5 + Math.random() * 80,
      })) ?? [],
    [muses],
  );

  const displayedMuses = muses?.filter((m) => {
    if (
      search &&
      !`${m.firstName} ${m.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
      return false;
    if (m.privacy === "PUBLIC") return visibility.PUBLIC;
    if (m.privacy === "FRIENDS") return visibility.FRIENDS;
    if (m.privacy === "ONLY_ME") return visibility.ONLY_ME;
    return true;
  });

  const fetchMuses = async () => {
    const _muses = await baseDataLoader(() =>
      getAllMusesByUsernameAction(username),
    );
    setMuses(_muses);
  };

  useEffect(() => {
    if (authState === "LOADING" || muses) return;

    fetchMuses();
  }, [authState]);

  useEffect(() => {
    const handleMuseDeleted = (e: CustomEventType<MuseDeletedPayload>) => {
      const museId = e.detail.id;
      const name = e.detail.name;

      setMuses((prev) => prev?.filter((muse) => muse.id !== museId) || []);
      successToast(`${name} removed successfully.`);
    };

    on(EVENTS.MUSE.DELETED, handleMuseDeleted);

    return () => {
      off(EVENTS.MUSE.DELETED, handleMuseDeleted);
    };
  }, [on]);

  return (
    <S.Container>
      {/* ✨ Background mesh */}
      <S.BackgroundContainer>
        {backgroundTiles.map((tile, i) => (
          <S.BackgroundTile
            key={i}
            image={tile.image}
            top={tile.top}
            left={tile.left}
            rotation={tile.rotation}
            scale={tile.scale}
          />
        ))}
      </S.BackgroundContainer>
      <BreadCrumb label="Characters" username={username} />
      {isCurrentUser && (
        <AddNewButton
          label="Add a new character"
          icon={<HiUserAdd size={18} />}
          onClick={() => routeToPage(ROUTES.Profile.Muses.Create)}
        />
      )}
      <S.SearchWrapper>
        <S.SearchInput
          type="search"
          placeholder="Search characters..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <S.SearchIcon>
          <FiSearch size={16} />
        </S.SearchIcon>
      </S.SearchWrapper>
      {isCurrentUser && (
        <S.FilterRow>
          <label>
            <input
              type="checkbox"
              checked={visibility.PUBLIC}
              onChange={(e) =>
                setVisibility((prev) => ({
                  ...prev,
                  PUBLIC: e.target.checked,
                }))
              }
            />
            Public
          </label>
          <label>
            <input
              type="checkbox"
              checked={visibility.FRIENDS}
              onChange={(e) =>
                setVisibility((prev) => ({
                  ...prev,
                  FRIENDS: e.target.checked,
                }))
              }
            />
            Friends
          </label>
          <label>
            <input
              type="checkbox"
              checked={visibility.ONLY_ME}
              onChange={(e) =>
                setVisibility((prev) => ({
                  ...prev,
                  ONLY_ME: e.target.checked,
                }))
              }
            />
            Only me
          </label>
        </S.FilterRow>
      )}
      <S.MuseListContainer>
        {displayedMuses?.map((muse) => (
          <MuseCard key={muse?.id} muse={muse}></MuseCard>
        ))}
      </S.MuseListContainer>
    </S.Container>
  );
}
