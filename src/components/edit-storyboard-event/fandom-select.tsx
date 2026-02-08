"use client";

import classNames from "classnames";
import { Form, Select } from "radix-ui";
import { type FC, forwardRef, useEffect, useState } from "react";
import { GrRadialSelected } from "react-icons/gr";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { searchFandomsAction } from "@/app/rp/muse/actions";
import { useGlobalState } from "@/context/store/stores";
import type { Fandom } from "@/types";
import { FANDOMLESS } from "@/utils/constants";
import * as S from "./styled";

interface FandomSelectProps {
  value: Fandom | null;
  onChange: (fandom: Fandom) => void;
}

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

export const FandomSelect: FC<FandomSelectProps> = forwardRef(
  ({ value, onChange, ...props }, forwardedRef) => {
    const [fandomSearch, setFandomSearch] = useState("");
    const [fandoms, setFandoms] = useState<Fandom[]>([]);
    const [loading, setLoading] = useState(false);

    const theme = useGlobalState("theme");
    const accent = useGlobalState("accent");

    const debouncedSearch = useDebounce(fandomSearch, 400);

    // Fetch fandoms whenever search changes, including initial load
    useEffect(() => {
      const fetchFandoms = async () => {
        setLoading(true);
        const result = await searchFandomsAction(fandomSearch);

        if (result && !("message" in result)) {
          // Sort by id ascending
          const sorted = [...result].sort((a, b) => a.id.localeCompare(b.id));
          setFandoms(sorted);
        } else {
          setFandoms([]);
        }

        setLoading(false);
      };

      const timeout = setTimeout(fetchFandoms, 300);
      return () => clearTimeout(timeout);
    }, [fandomSearch]);

    return (
      <S.FandomSelect
        name="fandom"
        {...props}
        ref={forwardedRef as React.ForwardedRef<HTMLDivElement>}
      >
        <Form.Label className="form-label">Fandom</Form.Label>
        <Form.Control asChild>
          <Select.Root
            value={value?.id ?? ""}
            onValueChange={(id) => {
              const selected = fandoms.find((f) => f.id === id) || null;
              onChange(selected || FANDOMLESS);
            }}
          >
            <Select.Trigger className="select-trigger">
              <Select.Value placeholder="Search and select fandom…">
                {value?.id.replaceAll("_", " ")}
              </Select.Value>
              <Select.Icon>
                <MdOutlineKeyboardArrowDown className="select-icon" />
              </Select.Icon>
            </Select.Trigger>

            <S.FandomSelectPortal>
              <Select.Content
                position="popper"
                side="bottom"
                className={classNames("select-content", theme, accent)}
              >
                {/* <S.FandomDropdownSearchInput
                  type="text"
                  className={classNames("select-input", theme, accent)}
                  placeholder="Search fandoms..."
                  value={fandomSearch}
                  onChange={(e) => setFandomSearch(e.target.value)}
                /> */}

                <Select.Viewport className="select-viewport">
                  {loading && (
                    <S.DropdownMessage className="dropdown-message">
                      Searching...
                    </S.DropdownMessage>
                  )}
                  {!loading && fandoms.length === 0 && debouncedSearch && (
                    <S.DropdownMessage className="dropdown-message">
                      No results
                    </S.DropdownMessage>
                  )}
                  {!loading &&
                    fandoms.map((fandom) => (
                      <SelectItem key={fandom.id} fandom={fandom} />
                    ))}
                </Select.Viewport>
              </Select.Content>
            </S.FandomSelectPortal>
          </Select.Root>
        </Form.Control>

        <Form.Message className="form-message" match="valueMissing">
          Please select a fandom
        </Form.Message>
      </S.FandomSelect>
    );
  },
);

const SelectItem: FC<{ fandom: Fandom }> = forwardRef(
  ({ fandom, ...props }, forwardedRef) => {
    return (
      <Select.Item
        key={fandom.id}
        value={fandom.id}
        className="select-item"
        {...props}
        ref={forwardedRef as React.ForwardedRef<HTMLDivElement>}
      >
        <Select.ItemIndicator className="select-item-indicator">
          <GrRadialSelected />
        </Select.ItemIndicator>
        <Select.ItemText>{fandom.id.replaceAll("_", " ")}</Select.ItemText>
      </Select.Item>
    );
  },
);
