"use client";

import { useCallback, useRef, useState } from "react";
import { BsArrowLeft } from "react-icons/bs";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { MdOutlineCategory, MdOutlineMedicalInformation } from "react-icons/md";
import { updateMuseAction } from "@/app/rp/muse/actions";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import type { Fandom, Muse } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import { Flex } from "../edit-muse-card/styles";
import * as S from "./styled";
import { type AttributeSuggestion, filterSuggestions } from "./suggestions";

type AttributePair = {
  id: string;
  key: string;
  value: string;
};

type Props = {
  museId: string;
  muse: Muse;
};

let _nextId = 0;
const nextId = () => String(++_nextId);

function recordToPairs(record: Record<string, string> | null): AttributePair[] {
  if (!record) return [];
  return Object.entries(record).map(([key, value]) => ({
    id: nextId(),
    key,
    value,
  }));
}

function pairsToRecord(pairs: AttributePair[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const pair of pairs) {
    const trimmedKey = pair.key.trim();
    if (trimmedKey) {
      result[trimmedKey] = pair.value;
    }
  }
  return result;
}

export default function EditMuseExtraAttributesDataCard({
  museId,
  muse,
}: Props) {
  const initialAttributes = muse.extraAttributes;
  const user = useGlobalState("user");
  const { routeToPage } = usePageRouter();
  const { successToast, errorToast } = useUIContext();

  const [pairs, setPairs] = useState<AttributePair[]>(() =>
    recordToPairs(initialAttributes),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<
    Record<string, { key?: string; value?: string }>
  >({});

  // Suggestion state
  const [focusedRowId, setFocusedRowId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AttributeSuggestion[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleKeyChange = useCallback((id: string, value: string) => {
    setPairs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, key: value } : p)),
    );
    setRowErrors((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id].key;
      return next;
    });
    setSuggestions(filterSuggestions(value));
    setSuggestionIndex(0);
  }, []);

  const handleValueChange = useCallback((id: string, value: string) => {
    setPairs((prev) => prev.map((p) => (p.id === id ? { ...p, value } : p)));
    setRowErrors((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id].value;
      return next;
    });
  }, []);

  const handleRemove = useCallback((id: string) => {
    setPairs((prev) => prev.filter((p) => p.id !== id));
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const handleAdd = useCallback(() => {
    setPairs((prev) => [{ id: nextId(), key: "", value: "" }, ...prev]);
  }, []);

  const handleSuggestionSelect = useCallback((id: string, label: string) => {
    setPairs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, key: label } : p)),
    );
    setRowErrors((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id].key;
      return next;
    });
    setSuggestions([]);
    setFocusedRowId(null);
  }, []);

  const handleKeyInputFocus = useCallback(
    (id: string, currentValue: string) => {
      setFocusedRowId(id);
      setSuggestions(filterSuggestions(currentValue));
      setSuggestionIndex(0);
    },
    [],
  );

  const handleKeyInputBlur = useCallback(() => {
    setTimeout(() => {
      setFocusedRowId(null);
      setSuggestions([]);
    }, 150);
  }, []);

  const handleKeyInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
      if (!suggestions.length) return;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSuggestionIndex((prev) =>
          prev <= 0 ? suggestions.length - 1 : prev - 1,
        );
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSuggestionIndex((prev) =>
          prev >= suggestions.length - 1 ? 0 : prev + 1,
        );
      } else if (e.key === "Enter" || e.key === "Tab") {
        if (suggestions[suggestionIndex]) {
          e.preventDefault();
          handleSuggestionSelect(id, suggestions[suggestionIndex].label);
        }
      } else if (e.key === "Escape") {
        setSuggestions([]);
        setFocusedRowId(null);
      }
    },
    [suggestions, suggestionIndex, handleSuggestionSelect],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      // Per-row validation
      const newRowErrors: Record<string, { key?: string; value?: string }> = {};
      const seenKeys = new Set<string>();
      const duplicateKeys = new Set<string>();

      for (const pair of pairs) {
        const trimmedKey = pair.key.trim();
        if (trimmedKey) {
          if (seenKeys.has(trimmedKey)) duplicateKeys.add(trimmedKey);
          seenKeys.add(trimmedKey);
        }
      }

      for (const pair of pairs) {
        const trimmedKey = pair.key.trim();
        const rowError: { key?: string; value?: string } = {};
        if (!trimmedKey) rowError.key = "Key is required";
        else if (duplicateKeys.has(trimmedKey)) rowError.key = "Duplicate key";
        if (!pair.value.trim()) rowError.value = "Value is required";
        if (Object.keys(rowError).length) newRowErrors[pair.id] = rowError;
      }

      if (Object.keys(newRowErrors).length) {
        setRowErrors(newRowErrors);
        setError("Please fix the errors above before saving.");
        return;
      }

      setRowErrors({});

      const extraAttributes = pairsToRecord(pairs);

      const payload = {
        accent: muse.accent,
        cardBackground: muse.cardBackground,
        connections: muse.connections ?? [],
        extraAttributes,
        fandom: muse.fandom.id as unknown as Fandom,
        firstName: muse.firstName,
        image: muse.image ?? "",
        lastName: muse.lastName,
        nicknames: muse.nicknames ?? [],
        note: muse.note,
        privacy: muse.privacy,
        song: muse.song,
        story: muse.story,
        tags: null,
        useAccent: muse.useAccent,
        useExtraImages: muse.useExtraImages,
        video: muse.video,
        wallpaper: muse.wallpaper,
      };

      setLoading(true);
      const result = await updateMuseAction(museId, payload);
      setLoading(false);

      if ("message" in result) {
        setError("Failed to save extra attributes. Please try again.");
        errorToast("Failed to save extra attributes.");
        return;
      }

      successToast("Extra attributes saved successfully.");
      routeToPage(ROUTES.Profile.Muses.Edit(museId));
    },
    [pairs, museId, muse, routeToPage, successToast, errorToast],
  );

  const handleCancel = useCallback(() => {
    routeToPage(ROUTES.Profile.Muses.Edit(museId));
  }, [routeToPage, museId]);

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        alignItems: "center",
        display: "flex",
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        minHeight: 0,
        width: "100%",
      }}
    >
      <S.FormWrapper>
        {/* Fixed top bar */}
        <S.TopBar>
          <S.BackButton type="button" onClick={handleCancel}>
            <BsArrowLeft />
          </S.BackButton>
          <MdOutlineMedicalInformation className="icon" size={28} />
          <S.PageTitle>Extra Attributes</S.PageTitle>
          {pairs.length > 0 && (
            <S.AttributeCount>{pairs.length}</S.AttributeCount>
          )}
        </S.TopBar>

        {/* Scrollable content */}
        <S.ScrollBody>
          <S.AddButton type="button" onClick={handleAdd}>
            <FiPlus />
            Add attribute
          </S.AddButton>

          {pairs.length === 0 && (
            <S.EmptyState>
              <MdOutlineCategory className="icon" size={48} />
              <p>No extra attributes yet.</p>
              <p>Tap &quot;Add attribute&quot; above to get started.</p>
            </S.EmptyState>
          )}

          {pairs.map((pair) => {
            const showDropdown =
              focusedRowId === pair.id && suggestions.length > 0;

            return (
              <S.AttributeCard key={pair.id}>
                <S.CardFields>
                  {/* Key field */}
                  <S.KeyInputWrapper>
                    <S.InputLabel htmlFor={`key-${pair.id}`}>Key</S.InputLabel>
                    <S.KeyInput
                      id={`key-${pair.id}`}
                      type="text"
                      placeholder="e.g. House"
                      value={pair.key}
                      $hasError={Boolean(rowErrors[pair.id]?.key)}
                      onChange={(e) => handleKeyChange(pair.id, e.target.value)}
                      onFocus={() => handleKeyInputFocus(pair.id, pair.key)}
                      onBlur={handleKeyInputBlur}
                      onKeyDown={(e) => handleKeyInputKeyDown(e, pair.id)}
                      autoComplete="off"
                      autoCapitalize="words"
                    />
                    {rowErrors[pair.id]?.key && (
                      <S.FieldError>{rowErrors[pair.id].key}</S.FieldError>
                    )}
                    {showDropdown && (
                      <S.SuggestionsDropdown ref={dropdownRef}>
                        {suggestions.map((s, index) => (
                          <S.SuggestionItem
                            key={s.label}
                            type="button"
                            $focused={index === suggestionIndex}
                            onMouseEnter={() => setSuggestionIndex(index)}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSuggestionSelect(pair.id, s.label);
                            }}
                          >
                            {s.label}
                          </S.SuggestionItem>
                        ))}
                      </S.SuggestionsDropdown>
                    )}
                  </S.KeyInputWrapper>

                  {/* Value field */}
                  <S.FieldGroup>
                    <S.InputLabel htmlFor={`val-${pair.id}`}>
                      Value
                    </S.InputLabel>
                    <S.ValueInput
                      id={`val-${pair.id}`}
                      type="text"
                      placeholder="e.g. Gryffindor"
                      value={pair.value}
                      $hasError={Boolean(rowErrors[pair.id]?.value)}
                      onChange={(e) =>
                        handleValueChange(pair.id, e.target.value)
                      }
                    />
                    {rowErrors[pair.id]?.value && (
                      <S.FieldError>{rowErrors[pair.id].value}</S.FieldError>
                    )}
                  </S.FieldGroup>
                </S.CardFields>

                <S.RemoveButton
                  type="button"
                  onClick={() => handleRemove(pair.id)}
                  aria-label="Remove attribute"
                >
                  <FiTrash2 />
                  Remove
                </S.RemoveButton>
              </S.AttributeCard>
            );
          })}
        </S.ScrollBody>

        {/* Fixed bottom action bar */}
        <S.ActionBar>
          <Flex direction="column" gap="8px">
            {error && <S.ErrorBanner>{error}</S.ErrorBanner>}
            <Flex justify="flex-end" gap="8px">
              <S.CancelButton
                type="button"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </S.CancelButton>
              <S.SubmitButton type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </S.SubmitButton>
            </Flex>
          </Flex>
        </S.ActionBar>
      </S.FormWrapper>
    </form>
  );
}
