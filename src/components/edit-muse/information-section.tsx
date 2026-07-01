"use client";

import { Form, Separator } from "radix-ui";
import { type FormEventHandler, useCallback, useState } from "react";
import { BsArrowLeft } from "react-icons/bs";
import {
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { MdOutlineCategory, MdOutlineInfo } from "react-icons/md";
import { updateMuseAction } from "@/app/rp/muse/actions";
import { useUIContext } from "@/hooks/use-ui-context";
import type { Fandom } from "@/types";
import { LoaderAction } from "../common/loader-action";
import * as EA from "../edit-muse-extra-attributes/styled";
import { ErrorBox } from "../error-box";
import { FandomSelect } from "./fandom-select";
import { useMuseState, useMuseStoreSet } from "./muse.store";
import * as S from "./styled";

type AttributePair = { id: string; key: string; value: string };

let _nextAttrId = 0;
const nextAttrId = () => String(++_nextAttrId);

function recordToPairs(
  record: Record<string, string> | null | undefined,
): AttributePair[] {
  if (!record) return [];
  return Object.entries(record).map(([key, value]) => ({
    id: nextAttrId(),
    key,
    value,
  }));
}

function pairsToRecord(pairs: AttributePair[]): Record<string, string> {
  return Object.fromEntries(
    pairs.map(({ key, value }) => [key.trim(), value.trim()]),
  );
}

type Props = {
  isWizard?: boolean;
  stepIndex?: number;
  totalSteps?: number;
  onBack?: () => void;
  onDone: (savedId?: string) => void;
  onSkip?: () => void;
};

export function InformationSection({
  isWizard,
  stepIndex = 1,
  totalSteps = 3,
  onBack,
  onDone,
  onSkip,
}: Props) {
  const id = useMuseState("id");
  const firstName = useMuseState("firstName");
  const lastName = useMuseState("lastName");
  const nicknames = useMuseState("nicknames");
  const fandom = useMuseState("fandom");
  const image = useMuseState("image");
  const wallpaper = useMuseState("wallpaper");
  const cardBackground = useMuseState("cardBackground");
  const note = useMuseState("note");
  const story = useMuseState("story");
  const privacy = useMuseState("privacy");
  const accent = useMuseState("accent");
  const useAccent = useMuseState("useAccent");
  const useExtraImages = useMuseState("useExtraImages");
  const extraAttributes = useMuseState("extraAttributes");
  const setMuseState = useMuseStoreSet();
  const { successToast, errorToast } = useUIContext();

  const [nicknameInput, setNicknameInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Extra attributes state
  const [pairs, setPairs] = useState<AttributePair[]>(() =>
    recordToPairs(extraAttributes),
  );
  const [rowErrors, setRowErrors] = useState<
    Record<string, { key?: string; value?: string }>
  >({});

  const handleFirstNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMuseState({ firstName: e.target.value });
      setError(null);
    },
    [setMuseState],
  );

  const handleLastNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMuseState({ lastName: e.target.value });
      setError(null);
    },
    [setMuseState],
  );

  const handleFandomChange = useCallback(
    (value: Fandom) => {
      setMuseState({ fandom: value });
    },
    [setMuseState],
  );

  const addNickname = useCallback(() => {
    const trimmed = nicknameInput.trim();
    if (trimmed && nicknames.length < 5 && !nicknames.includes(trimmed)) {
      setMuseState({ nicknames: [...nicknames, trimmed] });
      setNicknameInput("");
    }
  }, [nicknameInput, nicknames, setMuseState]);

  // ── Extra attributes handlers ────────────────────────────────────────────
  const handleAttrKeyChange = useCallback((attrId: string, value: string) => {
    setPairs((prev) =>
      prev.map((p) => (p.id === attrId ? { ...p, key: value } : p)),
    );
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[attrId];
      return next;
    });
  }, []);

  const handleAttrValueChange = useCallback((attrId: string, value: string) => {
    setPairs((prev) =>
      prev.map((p) => (p.id === attrId ? { ...p, value } : p)),
    );
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[attrId];
      return next;
    });
  }, []);

  const handleAttrRemove = useCallback((attrId: string) => {
    setPairs((prev) => prev.filter((p) => p.id !== attrId));
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[attrId];
      return next;
    });
  }, []);

  const handleAttrAdd = useCallback(() => {
    setPairs((prev) => [{ id: nextAttrId(), key: "", value: "" }, ...prev]);
  }, []);

  const handleAttrMoveUp = useCallback((attrId: string) => {
    setPairs((prev) => {
      const idx = prev.findIndex((p) => p.id === attrId);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }, []);

  const handleAttrMoveDown = useCallback((attrId: string) => {
    setPairs((prev) => {
      const idx = prev.findIndex((p) => p.id === attrId);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }, []);

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      setError(null);

      if (!firstName?.trim()) {
        setError("First name is required.");
        return;
      }

      // Validate extra attributes
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
      const extraAttributes = pairs.length > 0 ? pairsToRecord(pairs) : null;

      const payload = {
        accent: useAccent && accent?.trim() ? accent.trim() : null,
        cardBackground: cardBackground ?? null,
        connections: [],
        extraAttributes,
        fandom: (fandom?.id ?? "FANDOMLESS") as unknown as Fandom,
        firstName: firstName?.trim() ?? "",
        image: image ?? "",
        lastName: lastName?.trim() ?? "",
        nicknames: nicknames ?? [],
        note: note ?? "",
        privacy,
        song: null,
        story: story ?? null,
        tags: null,
        useAccent,
        useExtraImages,
        video: null,
        wallpaper: wallpaper ?? null,
      };

      setLoading(true);
      const result = await updateMuseAction(id || null, payload);
      setLoading(false);

      if ("message" in result) {
        setError("Something went wrong. Please try again.");
        errorToast("Failed to save.");
        return;
      }

      const savedId = result.id ?? id ?? "";
      setMuseState({
        id: savedId,
        // Keep the store in sync so re-opening this section shows the correct attributes.
        ...(extraAttributes !== null && { extraAttributes }),
      });
      successToast("Information saved.");
      onDone(savedId);
    },
    [
      firstName,
      lastName,
      nicknames,
      fandom,
      image,
      wallpaper,
      cardBackground,
      note,
      story,
      privacy,
      accent,
      useAccent,
      useExtraImages,
      pairs,
      id,
      setMuseState,
      successToast,
      errorToast,
      onDone,
    ],
  );

  return (
    <S.FormContainer>
      <Form.Root onSubmit={handleSubmit}>
        {/* ── Top bar ─────────────────────────────────────────────────── */}
        <S.TopBar>
          <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
            {!isWizard && onBack && (
              <S.BackButton type="button" onClick={onBack}>
                <BsArrowLeft size={18} />
              </S.BackButton>
            )}
            <S.FormHeading>
              <MdOutlineInfo />
              <h1>Information</h1>
            </S.FormHeading>
          </div>
          {isWizard && (
            <S.StepBadge>
              Step {stepIndex + 2} of {totalSteps + 1}
            </S.StepBadge>
          )}
        </S.TopBar>

        {isWizard && (
          <S.StepDots>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <S.StepDot
                key={i}
                $active={i === stepIndex}
                $done={i < stepIndex}
              />
            ))}
          </S.StepDots>
        )}

        <Separator.Root className="separator" orientation="horizontal" />

        {/* ── Scrollable body ──────────────────────────────────────────── */}
        <S.InformationScrollBody>
          {/* Name fields */}
          <S.BasicInfoFields>
            <div className="name-fields">
              <Form.Field className="field" name="firstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  aria-label="First Name"
                  name="firstName"
                  type="text"
                  value={firstName ?? ""}
                  onChange={handleFirstNameChange}
                  required
                />
              </Form.Field>
              <Form.Field className="field" name="lastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  aria-label="Last Name"
                  name="lastName"
                  type="text"
                  value={lastName ?? ""}
                  onChange={handleLastNameChange}
                />
              </Form.Field>
            </div>
          </S.BasicInfoFields>

          <Separator.Root className="separator" orientation="horizontal" />

          {/* Fandom */}
          <S.FandomSelectWrapper>
            <FandomSelect value={fandom} onChange={handleFandomChange} />
          </S.FandomSelectWrapper>

          <Separator.Root className="separator" orientation="horizontal" />

          {/* Nicknames */}
          <S.NicknamesSection>
            <S.FieldHeader>
              <span
                style={{
                  color: "var(--text)",
                  fontSize: "var(--font-size-small)",
                  fontWeight: 600,
                }}
              >
                Nicknames
              </span>
              <span className="secondary-text">{nicknames.length}/5</span>
            </S.FieldHeader>
            <S.NicknamesInputRow>
              <input
                type="text"
                placeholder="Add a nickname"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                maxLength={30}
                disabled={nicknames.length >= 5}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addNickname();
                  }
                }}
              />
              <S.AddNicknameButton
                type="button"
                disabled={
                  nicknames.length >= 5 ||
                  !nicknameInput.trim() ||
                  nicknames.includes(nicknameInput.trim())
                }
                onClick={addNickname}
              >
                Add
              </S.AddNicknameButton>
            </S.NicknamesInputRow>
            {nicknames.length > 0 && (
              <S.NicknameTagsRow>
                {nicknames.map((name) => (
                  <S.NicknameTag key={name}>
                    {name}
                    <S.NicknameRemove
                      type="button"
                      aria-label={`Remove ${name}`}
                      onClick={() =>
                        setMuseState({
                          nicknames: nicknames.filter((n) => n !== name),
                        })
                      }
                    >
                      <FiX />
                    </S.NicknameRemove>
                  </S.NicknameTag>
                ))}
              </S.NicknameTagsRow>
            )}
            <S.NicknamesHint>
              {nicknames.length < 5
                ? "Press Enter or tap Add. Up to 5 nicknames."
                : "Maximum of 5 nicknames reached."}
            </S.NicknamesHint>
          </S.NicknamesSection>

          <Separator.Root className="separator" orientation="horizontal" />

          {/* ── Extra attributes ──────────────────────────────────────── */}
          <S.ExtraAttributesSection>
            <S.ExtraAttributesHeader>
              <S.ExtraAttributesTitle>
                <MdOutlineCategory size={18} />
                Extra Attributes
              </S.ExtraAttributesTitle>
              {pairs.length > 0 && (
                <EA.AttributeCount>{pairs.length}</EA.AttributeCount>
              )}
            </S.ExtraAttributesHeader>
            <S.ExtraAttributesDesc>
              Add custom key–value facts about your character (e.g. House →
              Gryffindor).
            </S.ExtraAttributesDesc>

            <EA.AddButton type="button" onClick={handleAttrAdd}>
              <FiPlus />
              Add attribute
            </EA.AddButton>

            {pairs.length === 0 && (
              <EA.EmptyState>
                <MdOutlineCategory size={40} />
                <p>No extra attributes yet.</p>
                <p>Tap &quot;Add attribute&quot; above to get started.</p>
              </EA.EmptyState>
            )}

            {pairs.map((pair, index) => {
              return (
                <EA.AttributeCard key={pair.id}>
                  <EA.CardFields>
                    {/* Key */}
                    <EA.KeyInputWrapper>
                      <EA.InputLabel htmlFor={`key-${pair.id}`}>
                        Key
                      </EA.InputLabel>
                      <EA.KeyInput
                        id={`key-${pair.id}`}
                        type="text"
                        placeholder="e.g. House"
                        value={pair.key}
                        $hasError={Boolean(rowErrors[pair.id]?.key)}
                        onChange={(e) =>
                          handleAttrKeyChange(pair.id, e.target.value)
                        }
                        autoComplete="off"
                        autoCapitalize="words"
                      />
                      {rowErrors[pair.id]?.key && (
                        <EA.FieldError>{rowErrors[pair.id].key}</EA.FieldError>
                      )}
                    </EA.KeyInputWrapper>

                    {/* Value */}
                    <EA.FieldGroup>
                      <EA.InputLabel htmlFor={`val-${pair.id}`}>
                        Value
                      </EA.InputLabel>
                      <EA.ValueInput
                        id={`val-${pair.id}`}
                        type="text"
                        placeholder="e.g. Gryffindor"
                        value={pair.value}
                        $hasError={Boolean(rowErrors[pair.id]?.value)}
                        onChange={(e) =>
                          handleAttrValueChange(pair.id, e.target.value)
                        }
                      />
                      {rowErrors[pair.id]?.value && (
                        <EA.FieldError>
                          {rowErrors[pair.id].value}
                        </EA.FieldError>
                      )}
                    </EA.FieldGroup>
                  </EA.CardFields>

                  <EA.CardActions>
                    <div style={{ display: "flex", gap: 4 }}>
                      <EA.OrderButton
                        type="button"
                        onClick={() => handleAttrMoveUp(pair.id)}
                        disabled={index === 0}
                        aria-label="Move up"
                      >
                        <FiChevronUp />
                      </EA.OrderButton>
                      <EA.OrderButton
                        type="button"
                        onClick={() => handleAttrMoveDown(pair.id)}
                        disabled={index === pairs.length - 1}
                        aria-label="Move down"
                      >
                        <FiChevronDown />
                      </EA.OrderButton>
                    </div>
                    <EA.RemoveButton
                      type="button"
                      onClick={() => handleAttrRemove(pair.id)}
                      aria-label="Remove attribute"
                    >
                      <FiTrash2 />
                      Remove
                    </EA.RemoveButton>
                  </EA.CardActions>
                </EA.AttributeCard>
              );
            })}
          </S.ExtraAttributesSection>

          {error && (
            <ErrorBox className="error">
              <p>{error}</p>
            </ErrorBox>
          )}
        </S.InformationScrollBody>

        {/* ── Actions ─────────────────────────────────────────────────── */}
        <Separator.Root className="separator" orientation="horizontal" />
        <S.WizardActions>
          {isWizard ? (
            <>
              <S.SkipButton type="button" onClick={onSkip}>
                Skip
              </S.SkipButton>
              <Form.Submit className="submit-button" disabled={loading}>
                <LoaderAction
                  loading={loading}
                  text="Save & Continue"
                  loadingText="Saving..."
                />
              </Form.Submit>
            </>
          ) : (
            <>
              <S.ResetButton type="button" onClick={onBack} disabled={loading}>
                Cancel
              </S.ResetButton>
              <Form.Submit className="submit-button" disabled={loading}>
                <LoaderAction
                  loading={loading}
                  text="Save"
                  loadingText="Saving..."
                />
              </Form.Submit>
            </>
          )}
        </S.WizardActions>
      </Form.Root>
    </S.FormContainer>
  );
}
