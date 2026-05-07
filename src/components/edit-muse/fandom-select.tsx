"use client";

import classNames from "classnames";
import { Dialog, Form } from "radix-ui";
import {
  type ChangeEvent,
  type FC,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { GrRadialSelected } from "react-icons/gr";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { searchFandomsAction } from "@/app/rp/muse/actions";
import { useGlobalState } from "@/context/store/stores";
import type { Fandom } from "@/types";
import * as S from "./styled";

interface FandomSelectProps {
  value: Fandom | null;
  onChange: (fandom: Fandom) => void;
}

export const FandomSelect: FC<FandomSelectProps> = forwardRef(
  ({ value, onChange, ...props }, forwardedRef) => {
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

    // Scroll selected item into view after fandoms load
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

    // Load fandoms on open
    useEffect(() => {
      if (open) {
        setSearch("");
        fetchFandoms("");
        // Focus search input after dialog animation
        const t = setTimeout(() => searchRef.current?.focus(), 80);
        return () => clearTimeout(t);
      }
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
      <S.FandomSelect
        name="fandom"
        {...props}
        ref={forwardedRef as React.ForwardedRef<HTMLDivElement>}
      >
        <Form.Label className="form-label">Fandom</Form.Label>
        <Form.Control asChild>
          {/* hidden input keeps the form value in sync */}
          <input type="hidden" value={value?.id ?? ""} readOnly />
        </Form.Control>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button type="button" className="select-trigger">
              <span className="select-value">
                {value?.id
                  ? value.id.replaceAll("_", " ")
                  : "Search and select fandom…"}
              </span>
              <MdOutlineKeyboardArrowDown className="select-icon" />
            </button>
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

        <Form.Message className="form-message" match="valueMissing">
          Please select a fandom
        </Form.Message>
      </S.FandomSelect>
    );
  },
);
