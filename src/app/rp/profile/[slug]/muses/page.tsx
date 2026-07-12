"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FiGrid, FiList } from "react-icons/fi";
import { HiUserAdd } from "react-icons/hi";
import { getAllMusesByUsernameAction } from "@/app/rp/muse/actions";
import { BreadCrumb } from "@/components/breadcrumb";
import { AddNewButton, FilterSearch } from "@/components/common";
import { AppAlertDialog } from "@/components/dialog";
import MuseListItem from "@/components/muse-list-item";
import { MusePreviewCard } from "@/components/muse-preview-card";
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
  const [visibility, setVisibility] = useState<string[]>([
    "PUBLIC",
    "FRIENDS",
    "ONLY_ME",
  ]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);
  const museLimit = novelist?.tier.museLimit ?? 0;
  // Alternate verses count toward the limit just like root characters, so
  // this uses the raw (unfiltered, un-grouped) fetch count — same figure
  // shown in the breadcrumb.
  const atMuseLimit = (muses?.length ?? 0) >= museLimit;

  const backgroundTiles = useMemo(
    () =>
      muses?.map((muse) => ({
        image: muse.avatar?.src || muse.image || "",
        left: 5 + Math.random() * 80,
        rotation: -45 + Math.random() * 90,
        scale: 1.5 + Math.random() * 2.5,
        top: 5 + Math.random() * 80,
      })) ?? [],
    [muses],
  );

  const filteredMuses = muses?.filter((m) => {
    if (
      search &&
      !`${m.firstName} ${m.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
      return false;
    if (m.privacy === "PUBLIC") return visibility.includes("PUBLIC");
    if (m.privacy === "FRIENDS") return visibility.includes("FRIENDS");
    if (m.privacy === "ONLY_ME") return visibility.includes("ONLY_ME");
    return true;
  });

  // A muse's alternate verses are separate rows in the backend response, but
  // they're the same character to the user — group them under one card so
  // the list shows one entry per character family, with the verses reachable
  // from small badges on that card instead of cluttering the grid.
  const museFamilies = useMemo(() => {
    if (!filteredMuses) return [];
    const groups = new Map<string, Muse[]>();
    for (const m of filteredMuses) {
      const key = m.originalVerseId ?? m.id;
      if (!key) continue;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)?.push(m);
    }
    return Array.from(groups.values())
      .map((members) => {
        const sorted = [...members].sort(
          (a, b) => (a.verseNumber ?? 1) - (b.verseNumber ?? 1),
        );
        const root = sorted.find((m) => !m.originalVerseId) ?? sorted[0];
        const verses = sorted.filter((m) => m.id !== root.id);
        return { root, verses };
      })
      .sort((a, b) => a.root.firstName.localeCompare(b.root.firstName));
  }, [filteredMuses]);

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
      <BreadCrumb
        label={`Characters ${isCurrentUser ? `(${muses?.length ?? 0} / ${novelist?.tier.museLimit ?? 0})` : ""}`}
        username={username}
      />
      {isCurrentUser && (
        <AddNewButton
          label="Add a new character"
          icon={<HiUserAdd size={18} />}
          onClick={() => {
            if (atMuseLimit) {
              setLimitDialogOpen(true);
              return;
            }
            routeToPage(ROUTES.Profile.Muses.Create);
          }}
        />
      )}
      <AppAlertDialog
        heading="Character limit reached"
        text={`You've reached your plan's limit of ${museLimit} characters (alternate verses count toward this too). Upgrade your tier or remove a character to add a new one.`}
        open={limitDialogOpen}
        onOpenChange={setLimitDialogOpen}
        showConfirm={false}
        closeButtonText="Close"
      />
      <FilterSearch
        value={search}
        onChange={setSearch}
        placeholder="Search characters..."
        filters={
          isCurrentUser
            ? [
                { id: "PUBLIC", label: "Public" },
                { id: "FRIENDS", label: "Friends" },
                { id: "ONLY_ME", label: "Only me" },
              ]
            : undefined
        }
        activeFilters={visibility}
        onFilterChange={isCurrentUser ? setVisibility : undefined}
      />
      {/* View mode toggle (grid / list) */}
      <S.ViewToggleRow>
        <S.ToggleButton
          type="button"
          $active={viewMode === "grid"}
          aria-pressed={viewMode === "grid"}
          title="Grid view"
          onClick={() => setViewMode("grid")}
        >
          <FiGrid size={16} />
        </S.ToggleButton>
        <S.ToggleButton
          type="button"
          $active={viewMode === "list"}
          aria-pressed={viewMode === "list"}
          title="List view"
          onClick={() => setViewMode("list")}
        >
          <FiList size={16} />
        </S.ToggleButton>
      </S.ViewToggleRow>

      <S.MuseListContainer>
        {viewMode === "grid" ? (
          museFamilies.map(({ root, verses }) => (
            <MusePreviewCard key={root?.id} muse={root} verses={verses} />
          ))
        ) : (
          <S.ListWrapper>
            {museFamilies.map(({ root, verses }) => (
              <MuseListItem key={root?.id} muse={root} verses={verses} />
            ))}
          </S.ListWrapper>
        )}
      </S.MuseListContainer>
    </S.Container>
  );
}
