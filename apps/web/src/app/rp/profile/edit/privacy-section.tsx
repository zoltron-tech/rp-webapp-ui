"use client";

import type { ProfilePrivacy, ProfilePrivacyLevel } from "@nw/types/books";
import { Separator } from "radix-ui";
import { type ReactNode, useEffect, useState } from "react";
import { BsArrowLeft } from "react-icons/bs";
import { IoBookOutline } from "react-icons/io5";
import {
  MdOutlineHistory,
  MdOutlineInfo,
  MdOutlineLock,
} from "react-icons/md";
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

/** The three "who can see" knobs, each a level. */
type LevelKey = Exclude<keyof ProfilePrivacy, SwitchKey>;
/** The two on/off knobs. */
type SwitchKey = Extract<keyof ProfilePrivacy, "shelfOnProfile" | "recordActivity">;

const ROWS: {
  key: LevelKey;
  label: string;
  hint: string;
  icon: ReactNode;
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

/** One on/off row: label and hint on the left, the switch on the right. */
function SwitchRow({
  checked,
  disabled,
  hint,
  icon,
  label,
  onToggle,
}: {
  checked: boolean;
  disabled: boolean;
  hint: ReactNode;
  icon: ReactNode;
  label: string;
  onToggle: () => void;
}) {
  return (
    <S.PrivacyRow>
      <S.PrivacyRowMain>
        <S.PrivacyRowLabel>
          {icon}
          {label}
        </S.PrivacyRowLabel>
        <S.PrivacyRowHint>{hint}</S.PrivacyRowHint>
      </S.PrivacyRowMain>
      <S.Switch
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={onToggle}
      >
        <span />
      </S.Switch>
    </S.PrivacyRow>
  );
}

/**
 * Profile privacy (BOOKSHELF_PLAN.md §1.4, §4.4), in three groups: who can
 * see each part of the profile, whether what you do is recorded as activity
 * at all, and what the profile page itself shows. Saves on change.
 *
 * The activity switch lives here rather than under Account because it is a
 * question of what other people see of you, the same question as the rows
 * above it; and here rather than on the Activity tab because it governs
 * what gets written, not what is shown.
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

  const toggle = (key: SwitchKey) => {
    if (!privacy) return;
    save({ ...privacy, [key]: !privacy[key] }, key);
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
            <MdOutlineHistory />
            Your activity
          </S.AccountGroupHeading>
          <SwitchRow
            checked={privacy?.recordActivity ?? true}
            disabled={!privacy || saving === "recordActivity"}
            hint="On, what you do — posts, characters, stories, uploads, profile edits — shows on your profile's Activity tab and in your friends' feeds. Off stops new entries. What is already there stays until you delete it from your Activity tab."
            icon={<MdOutlineHistory />}
            label="Record my activity"
            onToggle={() => toggle("recordActivity")}
          />
        </S.AccountGroup>

        <S.AccountGroup>
          <S.AccountGroupHeading>
            <IoBookOutline />
            On your profile
          </S.AccountGroupHeading>
          <SwitchRow
            checked={privacy?.shelfOnProfile ?? true}
            disabled={!privacy || saving === "shelfOnProfile"}
            hint="Off hides the Bookshelf section from your profile page for everyone, whatever the setting above. Your shelf is still reachable from the menu and by link, under that setting."
            icon={<IoBookOutline />}
            label="Show bookshelf on profile"
            onToggle={() => toggle("shelfOnProfile")}
          />
        </S.AccountGroup>
      </S.AccountSectionBody>
    </>
  );
}
