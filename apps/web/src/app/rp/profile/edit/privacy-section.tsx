"use client";

import type { ProfilePrivacy, ProfilePrivacyLevel } from "@nw/types/books";
import { Separator } from "radix-ui";
import { useEffect, useState } from "react";
import { BsArrowLeft } from "react-icons/bs";
import { IoBookOutline } from "react-icons/io5";
import { MdOutlineInfo, MdOutlineLock } from "react-icons/md";
import { RiGroupLine } from "react-icons/ri";
import {
  getProfilePrivacyAction,
  setProfilePrivacyAction,
} from "@/app/rp/books/actions";
import { failed } from "@/components/bookshelf/use-shelf-actions";
import { useUIContext } from "@/hooks/use-ui-context";
import * as S from "./styled";

type Props = {
  onBack: () => void;
};

const LEVELS: { value: ProfilePrivacyLevel; label: string }[] = [
  { label: "Everyone", value: "PUBLIC" },
  { label: "Friends", value: "FRIENDS" },
  { label: "Only me", value: "ONLY_ME" },
];

type LevelKey = Exclude<keyof ProfilePrivacy, "shelfOnProfile">;

const ROWS: {
  key: LevelKey;
  label: string;
  hint: string;
  icon: React.ReactNode;
}[] = [
  {
    hint: "The books you've read, are reading and want to read, and your favorites.",
    icon: <IoBookOutline />,
    key: "shelf",
    label: "Bookshelf",
  },
  {
    hint: "Your character roster. Also hides characters that are individually public; characters you've set to Only me stay hidden either way.",
    icon: <RiGroupLine />,
    key: "muses",
    label: "Characters",
  },
  {
    hint: "The About block on your profile. Your featured song stays visible.",
    icon: <MdOutlineInfo />,
    key: "about",
    label: "About me",
  },
];

/**
 * Profile privacy (BOOKSHELF_PLAN.md §1.4, §4.4): one knob each for the
 * bookshelf, the character roster and About me. Saves on change.
 */
export function PrivacySection({ onBack }: Props) {
  const { successToast, errorToast } = useUIContext();
  const [privacy, setPrivacy] = useState<ProfilePrivacy | null>(null);
  const [saving, setSaving] = useState<keyof ProfilePrivacy | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProfilePrivacyAction().then((result) => {
      if (cancelled) return;
      if (failed(result)) {
        errorToast("Couldn't load your privacy settings.");
        return;
      }
      setPrivacy(result);
    });
    return () => {
      cancelled = true;
    };
  }, [errorToast]);

  /** Any one field; the whole object is what the endpoint takes. */
  const save = async (next: ProfilePrivacy, key: keyof ProfilePrivacy) => {
    if (!privacy || saving) return;
    const before = privacy;
    // Optimistic: the control answers at once, and is put back on failure.
    setPrivacy(next);
    setSaving(key);
    const result = await setProfilePrivacyAction(next);
    setSaving(null);
    if (failed(result)) {
      setPrivacy(before);
      errorToast("Couldn't save that. Try again.");
      return;
    }
    setPrivacy(result);
    successToast("Privacy updated");
  };

  const change = (key: LevelKey, value: ProfilePrivacyLevel) => {
    if (!privacy || privacy[key] === value) return;
    save({ ...privacy, [key]: value }, key);
  };

  const toggleShelfOnProfile = () => {
    if (!privacy) return;
    save(
      { ...privacy, shelfOnProfile: !privacy.shelfOnProfile },
      "shelfOnProfile",
    );
  };

  return (
    <>
      <S.TopBar>
        <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
          <S.BackButton type="button" onClick={onBack}>
            <BsArrowLeft size={18} />
          </S.BackButton>
          <S.FormHeading>
            <MdOutlineLock />
            <h1>Profile privacy</h1>
          </S.FormHeading>
        </div>
      </S.TopBar>

      <Separator.Root className="separator" orientation="horizontal" />

      <S.AccountSectionBody>
        <S.AccountGroup>
          <S.AccountGroupHeading>
            <MdOutlineLock />
            Who can see
          </S.AccountGroupHeading>

          {ROWS.map((row) => (
            <S.PrivacyRow key={row.key}>
              <S.PrivacyRowMain>
                <S.PrivacyRowLabel>
                  {row.icon}
                  {row.label}
                </S.PrivacyRowLabel>
                <S.PrivacyRowHint>{row.hint}</S.PrivacyRowHint>
              </S.PrivacyRowMain>
              <S.PrivacySegments aria-label={`${row.label} visibility`}>
                {LEVELS.map((level) => {
                  const active = privacy?.[row.key] === level.value;
                  return (
                    <S.PrivacySegment
                      key={level.value}
                      type="button"
                      aria-pressed={active}
                      $active={active}
                      disabled={!privacy || saving === row.key}
                      onClick={() => change(row.key, level.value)}
                    >
                      {level.label}
                    </S.PrivacySegment>
                  );
                })}
              </S.PrivacySegments>
            </S.PrivacyRow>
          ))}
        </S.AccountGroup>

        <S.AccountGroup>
          <S.AccountGroupHeading>
            <IoBookOutline />
            On your profile
          </S.AccountGroupHeading>
          <S.PrivacyRow>
            <S.PrivacyRowMain>
              <S.PrivacyRowLabel>
                <IoBookOutline />
                Show bookshelf on profile
              </S.PrivacyRowLabel>
              <S.PrivacyRowHint>
                Off hides the Bookshelf section from your profile page for
                everyone, whatever the setting above. Your shelf is still
                reachable from the menu and by link, under that setting.
              </S.PrivacyRowHint>
            </S.PrivacyRowMain>
            <S.Switch
              type="button"
              role="switch"
              aria-checked={privacy?.shelfOnProfile ?? true}
              aria-label="Show bookshelf on profile"
              disabled={!privacy || saving === "shelfOnProfile"}
              onClick={toggleShelfOnProfile}
            >
              <span />
            </S.Switch>
          </S.PrivacyRow>
        </S.AccountGroup>
      </S.AccountSectionBody>
    </>
  );
}
