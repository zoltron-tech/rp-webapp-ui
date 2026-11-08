"use client";

import type { Fandom, Muse } from "@nw/types";
import { useParams } from "@/lib/navigation";
import { usernameFromHandle } from "@/utils/constants/profile-handle";
import { personName } from "@nw/utils";
import { useEffect, useMemo, useState } from "react";
import { FiGrid, FiList } from "react-icons/fi";
import { HiUserAdd } from "react-icons/hi";
import { getAllMusesByUsernameAction } from "@/app/rp/muse/actions";
import { NoMatchesArt } from "@/components/book-art";
import { BreadCrumb } from "@/components/breadcrumb";
import { AddNewButton, FilterSearch } from "@/components/common";
import { AppAlertDialog } from "@/components/dialog";
import MuseListItem from "@/components/muse-list-item";
import { MusePreviewCard } from "@/components/muse-preview-card";
import { useGlobalState } from "@/context/store/stores";
import { useCustomEvents, useUIContext } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import {
  type CustomEventType,
  EVENTS,
  type MuseDeletedPayload,
} from "@/utils/constants/custom-events";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styles";

const FANDOMLESS_ID = "FANDOMLESS";

/** The fandomless bucket's stored name is a full sentence — too long for a
 *  chip, so it gets a short label here. */
const fandomLabel = (fandom: Fandom) =>
  fandom.id === FANDOMLESS_ID ? "Fandomless" : fandom.name;

export default function MusesListPage({}) {
  const params = useParams();
  const [muses, setMuses] = useState<Muse[] | null>(null);
  const authState = useGlobalState("authState");
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  // The route param is a handle (`@tokyo`), not a bare username.
  const username = usernameFromHandle(params?.handle as string);
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
  // Empty = no fandom filter (show all). Ids are Fandom.id.
  const [selectedFandoms, setSelectedFandoms] = useState<string[]>([]);
  const [groupByFandom, setGroupByFandom] = useState(false);
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);
  const museLimit = novelist?.tier.museLimit ?? 0;
  // Alternate verses count toward the limit just like root characters, so
  // this uses the raw (unfiltered, un-grouped) fetch count — same figure
  // shown in the breadcrumb.
  const atMuseLimit = (muses?.length ?? 0) >= museLimit;

  const filteredMuses = muses?.filter((m) => {
    if (
      search &&
      !personName(m.firstName, m.lastName)
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

  // Fandom chips are built from the search/visibility-filtered families but
  // *before* the fandom filter is applied — otherwise selecting one fandom
  // would remove every other chip and trap the user in that selection.
  const fandomOptions = useMemo(() => {
    const byId = new Map<
      string,
      { id: string; name: string; color: string; count: number }
    >();
    for (const { root } of museFamilies) {
      const fandom = root.fandom;
      if (!fandom?.id) continue;
      const existing = byId.get(fandom.id);
      if (existing) {
        existing.count += 1;
        continue;
      }
      byId.set(fandom.id, {
        color: fandom.color || "var(--accent)",
        count: 1,
        id: fandom.id,
        name: fandomLabel(fandom),
      });
    }
    // Fandomless originals sort last; everything else alphabetically.
    return Array.from(byId.values()).sort((a, b) => {
      if (a.id === FANDOMLESS_ID) return 1;
      if (b.id === FANDOMLESS_ID) return -1;
      return a.name.localeCompare(b.name);
    });
  }, [museFamilies]);

  // Drop selections whose fandom is no longer represented (e.g. after the
  // search box narrows the roster or a character is deleted).
  useEffect(() => {
    if (!selectedFandoms.length) return;
    const available = new Set(fandomOptions.map((f) => f.id));
    const next = selectedFandoms.filter((id) => available.has(id));
    if (next.length !== selectedFandoms.length) setSelectedFandoms(next);
  }, [fandomOptions, selectedFandoms]);

  const visibleFamilies = useMemo(
    () =>
      selectedFandoms.length
        ? museFamilies.filter(({ root }) =>
            selectedFandoms.includes(root.fandom?.id),
          )
        : museFamilies,
    [museFamilies, selectedFandoms],
  );

  // One bucket per fandom, in the same order as the chips above.
  const fandomGroups = useMemo(() => {
    if (!groupByFandom) return [];
    const buckets = new Map<string, typeof visibleFamilies>();
    for (const family of visibleFamilies) {
      const id = family.root.fandom?.id ?? FANDOMLESS_ID;
      if (!buckets.has(id)) buckets.set(id, []);
      buckets.get(id)?.push(family);
    }
    return fandomOptions
      .filter((fandom) => buckets.has(fandom.id))
      .map((fandom) => ({
        families: buckets.get(fandom.id) ?? [],
        fandom,
      }));
  }, [groupByFandom, visibleFamilies, fandomOptions]);

  const toggleFandom = (id: string) =>
    setSelectedFandoms((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );

  const renderFamilies = (families: typeof museFamilies) => (
    <S.MuseListContainer>
      {viewMode === "grid" ? (
        families.map(({ root, verses }) => (
          <MusePreviewCard key={root?.id} muse={root} verses={verses} />
        ))
      ) : (
        <S.ListWrapper>
          {families.map(({ root, verses }) => (
            <MuseListItem key={root?.id} muse={root} verses={verses} />
          ))}
        </S.ListWrapper>
      )}
    </S.MuseListContainer>
  );

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
        text={`You've reached your limit of ${museLimit} characters (alternate verses count toward this too). Remove a character to add a new one.`}
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
      {/* Fandom filter chips — hidden when there's nothing to choose between */}
      {fandomOptions.length > 1 && (
        <S.FandomFilterRow>
          <S.FandomFilterLabel>Fandoms:</S.FandomFilterLabel>
          {fandomOptions.map((fandom) => {
            const active = selectedFandoms.includes(fandom.id);
            return (
              <S.FandomChip
                key={fandom.id}
                type="button"
                $color={fandom.color}
                $active={active}
                aria-pressed={active}
                onClick={() => toggleFandom(fandom.id)}
              >
                <span className="name">{fandom.name}</span>
                <span className="count">{fandom.count}</span>
              </S.FandomChip>
            );
          })}
          {selectedFandoms.length > 0 && (
            <S.FandomChipReset
              type="button"
              onClick={() => setSelectedFandoms([])}
            >
              Clear
            </S.FandomChipReset>
          )}
        </S.FandomFilterRow>
      )}

      {/* Group-by toggle + view mode toggle (grid / list) */}
      <S.ViewToggleRow>
        <S.GroupByLabel>
          <input
            type="checkbox"
            checked={groupByFandom}
            onChange={() => setGroupByFandom((prev) => !prev)}
          />
          Group by fandom
        </S.GroupByLabel>
        <S.ViewToggleButtons>
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
        </S.ViewToggleButtons>
      </S.ViewToggleRow>

      {groupByFandom
        ? fandomGroups.map(({ fandom, families }) => (
            <S.FandomGroup key={fandom.id} $color={fandom.color}>
              <S.FandomGroupHeader $color={fandom.color}>
                {fandom.name}
                <span className="count">({families.length})</span>
              </S.FandomGroupHeader>
              {renderFamilies(families)}
            </S.FandomGroup>
          ))
        : renderFamilies(visibleFamilies)}

      {muses !== null && visibleFamilies.length === 0 && (
        <S.EmptyResultWrap>
          <NoMatchesArt />
          <S.EmptyResult>
            No characters match the current filters.
          </S.EmptyResult>
        </S.EmptyResultWrap>
      )}
    </S.Container>
  );
}
