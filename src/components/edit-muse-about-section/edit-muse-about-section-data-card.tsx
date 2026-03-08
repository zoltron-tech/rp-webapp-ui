"use client";

import { useCallback, useState } from "react";
import {
  addMuseAboutSectionAction,
  updateMuseAboutSectionAction,
} from "@/app/rp/muse/actions";
import { RichTextEditor } from "@/components/rich-text-editor-input";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import { useUIContext } from "@/hooks/use-ui-context";
import type { MuseAboutSection } from "@/types";
import type { WithMessage } from "@/types/common";
import { ROUTES } from "@/utils/constants/routes";
import {
  useMuseAboutSectionState,
  useMuseAboutSectionStoreSet,
} from "./muse-about-section.store";
import * as S from "./styled";

export default function EditMuseAboutSectionDataCard() {
  const novelist = useGlobalState("novelist");
  const user = useGlobalState("user");
  const sectionId = useMuseAboutSectionState("id");
  const parentId = useMuseAboutSectionState("parentId");
  const ordinal = useMuseAboutSectionState("ordinal");
  const text = useMuseAboutSectionState("text");
  const setSectionState = useMuseAboutSectionStoreSet();
  const { successToast, errorToast } = useUIContext();
  const { routeToPage } = usePageRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOrdinalChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // Allow empty string during editing (defaults to 0)
      if (value === "") {
        setSectionState({ ordinal: 0 });
        setError(null);
        return;
      }

      const parsed = parseInt(value, 10);
      if (!Number.isNaN(parsed) && parsed >= 0) {
        setSectionState({ ordinal: parsed });
        setError(null);
      }
    },
    [setSectionState],
  );

  const handleTextChange = useCallback(
    (value: string) => {
      setSectionState({ text: value });
      setError(null);
    },
    [setSectionState],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!parentId) {
        setError("Invalid muse ID");
        return;
      }

      if (!text || text.trim() === "") {
        setError("Section text is required");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let response: MuseAboutSection | WithMessage;

        // If sectionId exists, update; otherwise, create
        if (sectionId) {
          response = await updateMuseAboutSectionAction(
            sectionId,
            text,
            ordinal,
          );
        } else {
          response = await addMuseAboutSectionAction(parentId, text, ordinal);
        }

        if ("message" in response) {
          setError("Failed to save section");
          errorToast("Failed to save section");
          return;
        }

        successToast(
          sectionId
            ? "Section updated successfully"
            : "Section created successfully",
        );
        setSectionState({
          id: response.id,
          image: response.image,
          ordinal: response.ordinal,
          parentId: response.parentId,
          text: response.text,
        });

        // Navigate back or close modal
        if (user?.username) {
          routeToPage(ROUTES.Profile.Muses.About(parentId || ""));
        }
      } catch (err) {
        setError("An error occurred while saving");
        errorToast("An error occurred while saving");
      } finally {
        setLoading(false);
      }
    },
    [
      parentId,
      text,
      ordinal,
      setSectionState,
      user,
      routeToPage,
      successToast,
      errorToast,
    ],
  );

  const handleCancel = useCallback(() => {
    if (user?.username) {
      routeToPage(ROUTES.Profile.Muses.About(parentId || ""));
    }
  }, [user, routeToPage, parentId]);

  console.log("EditMuseAboutSectionDataCard rendered with store data:", {
    ordinal,
    parentId,
    sectionId,
    text,
  });

  return (
    <S.Container>
      <form onSubmit={handleSubmit}>
        <S.FormGroup>
          <S.Label>Section Order</S.Label>
          <S.OrdinalInput
            type="number"
            value={ordinal}
            onChange={handleOrdinalChange}
            min="0"
            disabled={loading}
          />
        </S.FormGroup>

        <S.FormGroup>
          <S.Label>Section Content</S.Label>
          <RichTextEditor
            placeholder="Write the about section content..."
            value={text || ""}
            onChange={handleTextChange}
          />
        </S.FormGroup>

        {error && <S.ErrorMessage>{error}</S.ErrorMessage>}

        <S.ButtonGroup>
          <S.CancelButton
            type="button"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </S.CancelButton>
          <S.SubmitButton type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : sectionId
                ? "Update Section"
                : "Create Section"}
          </S.SubmitButton>
        </S.ButtonGroup>
      </form>
    </S.Container>
  );
}
