"use client";

import classNames from "classnames";
import { Dialog } from "radix-ui";
import {
  type ChangeEvent,
  type FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { GrRadialSelected } from "react-icons/gr";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { searchFandomsAction } from "@/app/rp/muse/actions";
import { useGlobalState } from "@/context/store/stores";
import type { Fandom } from "@/types";
import * as S from "./styled";

interface FandomPickerProps {
  value: Fandom | null;
  onChange: (fandom: Fandom | null) => void;
}

/**
 * Standalone fandom picker for a story: a trigger showing the current fandom
 * and a search dialog to pick a new one. Mirrors the muse fandom picker, but
 * self-contained (no radix Form context) and allows clearing (stories may have
 * no fandom).
 */
export const FandomPicker: FC<FandomPickerProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [fandoms, setFandoms] = useState<Fandom[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const theme = useGlobalState("theme");
  const accent = useGlobalState("accent");

  const fetchFandoms = useCallback(async (query: string) => {
    setLoading(true);
    const result = await searchFandomsAction(query);
    if (result && !("message" in result)) {
      setFandoms([...result].sort((a, b) => a.id.localeCompare(b.id)));
    } else {
      setFandoms([]);
    }
    setLoading(false);
  }, []);

  // Scroll the selected item into view once results load.
  useEffect(() => {
    if (!open || !value?.id || fandoms.length === 0) return;
    const t = setTimeout(() => {
      const el = listRef.current?.querySelector(
        '[data-selected="true"]',
      ) as HTMLElement | null;
      el?.scrollIntoView({ block: "nearest" });
    }, 50);
    return () => clearTimeout(t);
  }, [fandoms, open, value?.id]);

  useEffect(() => {
    if (!open) return;
    setSearch("");
    fetchFandoms("");
    const t = setTimeout(() => searchRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, [open, fetchFandoms]);

  const handleSearchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setSearch(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchFandoms(val), 300);
    },
    [fetchFandoms],
  );

  const handleSelect = useCallback(
    (fandom: Fandom) => {
      onChange(fandom);
      setOpen(false);
    },
    [onChange],
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <S.PickerTrigger type="button" data-empty={!value?.id}>
          <HiOutlineMagnifyingGlass className="picker-lead" />
          <span className="picker-value">
            {value?.id
              ? value.name || value.id.replaceAll("_", " ")
              : "Search and select a fandom…"}
          </span>
          <MdOutlineKeyboardArrowDown className="picker-icon" />
        </S.PickerTrigger>
      </Dialog.Trigger>

      <Dialog.Portal>
        <S.FandomDialogOverlay />
        <S.FandomDialogContent className={classNames(theme, accent)}>
          <S.FandomDialogHeader>
            <S.FandomDialogTitle>Select a Fandom</S.FandomDialogTitle>
            <Dialog.Close asChild>
              <S.FandomDialogCloseBtn type="button" aria-label="Close">
                ✕
              </S.FandomDialogCloseBtn>
            </Dialog.Close>
          </S.FandomDialogHeader>

          <S.FandomDialogSearch
            ref={searchRef}
            type="text"
            placeholder="Search fandoms…"
            value={search}
            onChange={handleSearchChange}
            spellCheck={false}
          />

          <S.FandomDialogList ref={listRef}>
            {loading && (
              <S.FandomDialogMessage>Searching…</S.FandomDialogMessage>
            )}
            {!loading && fandoms.length === 0 && (
              <S.FandomDialogMessage>
                {search ? "No fandoms found" : "No fandoms available"}
              </S.FandomDialogMessage>
            )}
            {!loading &&
              fandoms.map((fandom) => (
                <S.FandomDialogItem
                  key={fandom.id}
                  type="button"
                  $selected={fandom.id === value?.id}
                  data-selected={fandom.id === value?.id}
                  onClick={() => handleSelect(fandom)}
                >
                  {fandom.id === value?.id && (
                    <GrRadialSelected className="selected-icon" />
                  )}
                  {fandom.name || fandom.id.replaceAll("_", " ")}
                </S.FandomDialogItem>
              ))}
          </S.FandomDialogList>

          <S.FandomDialogFooter>
            <Dialog.Close asChild>
              <S.FandomDialogCancelBtn type="button">
                Cancel
              </S.FandomDialogCancelBtn>
            </Dialog.Close>
          </S.FandomDialogFooter>
        </S.FandomDialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default FandomPicker;
