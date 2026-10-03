"use client";

import type { CreateUpdateMuse, Fandom, Muse } from "@nw/types";
import { useState } from "react";
import { BsCheck, BsX } from "react-icons/bs";
import { MdAdd } from "react-icons/md";
import { updateMuseAction } from "@/app/rp/muse/actions";
import { useGlobalState, useGlobalStoreSet } from "@/context/store/stores";
import { useUIContext } from "@/hooks/use-ui-context";
import * as S from "./styles";

/** Shared "create a fandomless character on the fly" flow used by both the
 *  create-ice-breaker sender picker and the reply sender picker.
 *  Adds the new muse to the global store's novelist.muses immediately, so
 *  every other reader of that store (sender pickers, composers) sees it
 *  without a refetch. */
export function useQuickAddMuse(onCreated: (muse: Muse) => void) {
  const { errorToast } = useUIContext();
  const novelist = useGlobalState("novelist");
  const setGlobalState = useGlobalStoreSet();
  const [addingMuse, setAddingMuse] = useState(false);
  const [newMuseName, setNewMuseName] = useState("");
  const [creatingMuse, setCreatingMuse] = useState(false);

  const openAddMuse = () => setAddingMuse(true);

  const cancelAddMuse = () => {
    setAddingMuse(false);
    setNewMuseName("");
  };

  const handleCreateMuse = async () => {
    const trimmedName = newMuseName.trim();
    if (!trimmedName || creatingMuse) return;

    const payload: CreateUpdateMuse = {
      accent: null,
      cardBackground: null,
      connections: [],
      extraAttributes: null,
      fandom: "FANDOMLESS" as unknown as Fandom,
      firstName: trimmedName,
      image: null,
      lastName: "",
      nicknames: [],
      note: null,
      privacy: "PUBLIC",
      song: null,
      story: null,
      tags: null,
      useAccent: false,
      useExtraImages: false,
      video: null,
      wallpaper: null,
    };

    setCreatingMuse(true);
    const result = await updateMuseAction(null, payload);
    setCreatingMuse(false);

    if ("message" in result) {
      errorToast("Failed to create character. Please try again.");
      return;
    }

    if (novelist) {
      setGlobalState({
        novelist: {
          ...novelist,
          museCount: novelist.museCount + 1,
          muses: [...novelist.muses, result],
        },
      });
    }

    onCreated(result);
    cancelAddMuse();
  };

  return {
    addingMuse,
    cancelAddMuse,
    creatingMuse,
    handleCreateMuse,
    newMuseName,
    openAddMuse,
    reset: cancelAddMuse,
    setNewMuseName,
  };
}

export function QuickAddMuseButton({ onClick }: { onClick: () => void }) {
  return (
    <S.IceBreakerAddMuseButton
      type="button"
      onClick={onClick}
      aria-label="Add a character"
    >
      <span className="icon">
        <MdAdd size={18} />
      </span>
      <span className="name">Add a character</span>
    </S.IceBreakerAddMuseButton>
  );
}

type QuickAddMuseFormProps = {
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  disabled: boolean;
};

export function QuickAddMuseForm({
  value,
  onChange,
  onConfirm,
  onCancel,
  disabled,
}: QuickAddMuseFormProps) {
  return (
    <S.IceBreakerAddMuseFormRow>
      <S.IceBreakerQuickAddInput
        autoFocus
        placeholder="Character's first name"
        value={value}
        maxLength={40}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onConfirm();
          if (event.key === "Escape") onCancel();
        }}
      />
      <S.IceBreakerTrayActionButton
        type="button"
        $variant="cancel"
        aria-label="Cancel"
        onClick={onCancel}
      >
        <BsX size={16} />
      </S.IceBreakerTrayActionButton>
      <S.IceBreakerTrayActionButton
        type="button"
        $variant="confirm"
        aria-label="Create character"
        disabled={disabled}
        onClick={onConfirm}
      >
        <BsCheck size={18} />
      </S.IceBreakerTrayActionButton>
    </S.IceBreakerAddMuseFormRow>
  );
}
