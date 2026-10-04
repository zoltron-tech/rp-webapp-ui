import { Ionicons } from "@expo/vector-icons";
import type { Muse } from "@nw/types";
import type { PrivacyLevel } from "@nw/types/prompt";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { type ActionItem, ActionMenu } from "@/components/action-menu";
import { ScoreIcon } from "@/components/badges";
import { PRIVACY_ICON, PRIVACY_LABEL } from "@/components/feed/privacy";
import { AttributeSheet } from "@/components/muse/edit/attribute-sheet";
import { FandomSheet } from "@/components/muse/edit/fandom-sheet";
import { ImageCropEditor } from "@/components/muse/edit/image-crop-editor";
import {
  MAX_NICKNAMES,
  NicknameSheet,
} from "@/components/muse/edit/nickname-sheet";
import { MUSE_AVATAR, MuseFace } from "@/components/muse/mini-header";
import {
  Divider,
  glassCard,
  MusePanel,
  PANEL,
  SectionEmpty,
  SectionLabel,
  Shimmer,
} from "@/components/muse/panel";
import { PennedBy } from "@/components/muse/penned-by";
import { useImageCropFlow } from "@/hooks/use-image-crop-flow";
import type { MuseEdit } from "@/hooks/use-muse-edit";
import { asColor, withAlpha } from "@/lib/color";
import type { MuseLook } from "@/lib/muse-appearance";
import { museName } from "@/lib/muse-appearance";
import { border, fontSize, radius, space } from "@/theme";

/**
 * Web's `MuseInfoSection`.
 *
 * The same column: the score chip and privacy mark in the corners, the face,
 * the name, who pens them, their nicknames, their fandom, then "Details" — the
 * free-form attributes laid out two to a row, or the blank card when there are
 * none.
 *
 * ## The owner edits in place, as on web
 *
 * Every editable thing is the thing itself: the camera on the avatar, the
 * privacy mark, the nickname row, the fandom chip and each detail card are
 * buttons for the owner and labels for everyone else. Web opens inline inputs
 * and dropdowns; a phone opens a tray (`AGENTS.md` — forms and pickers are
 * bottom sheets), and the tray writes through `useMuseEdit`, which patches the
 * cache so the card behind it updates the moment the save lands.
 */

const PRIVACY_OPTIONS: PrivacyLevel[] = ["PUBLIC", "FRIENDS", "ONLY_ME"];
const PRIVACY_HINT: Record<string, string> = {
  FRIENDS: "This character is visible to friends only",
  ONLY_ME: "This character is private",
  PUBLIC: "This character is public",
};

type Sheet =
  | { kind: "attribute"; target: { key: string; value: string } | null }
  | { kind: "attribute-menu"; key: string; value: string }
  | { kind: "avatar-menu" }
  | { kind: "fandom" }
  | { kind: "nicknames" }
  | { kind: "privacy" }
  | null;

export const MuseInfoSection = ({
  edit,
  isOwnMuse,
  look,
  motion,
  muse,
}: {
  edit: MuseEdit;
  isOwnMuse: boolean;
  look: MuseLook;
  motion: boolean;
  muse: Muse | null;
}) => {
  const { accent } = look;
  const [sheet, setSheet] = useState<Sheet>(null);
  const [busy, setBusy] = useState<"avatar" | "privacy" | string | null>(null);

  const avatarFlow = useImageCropFlow({
    onSave: edit.setAvatar,
    prefix: muse?.id,
  });

  const attributes = Object.entries(muse?.extraAttributes ?? {});
  const nicknames = muse?.nicknames ?? [];
  const fandom = muse?.fandom;
  const hasFandom = Boolean(fandom?.name && fandom.id !== "FANDOMLESS");
  const fandomColor = asColor(fandom?.color) ?? "#555555";
  const canChangePrivacy = isOwnMuse && !muse?.originalVerseId;

  const close = () => setSheet(null);

  const fail = (what: string) =>
    Alert.alert("Not saved", `${what} could not be saved. Try again.`);

  const removeAvatar = () => {
    Alert.alert(
      "Remove avatar?",
      "Remove this character's avatar photo? The card image will be used as fallback.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            setBusy("avatar");
            const ok = await edit.removeAvatar();
            setBusy(null);
            if (!ok) fail("The avatar");
          },
          style: "destructive",
          text: "Remove",
        },
      ],
    );
  };

  const changePrivacy = async (privacy: PrivacyLevel) => {
    close();
    if (!muse || privacy === muse.privacy) return;
    setBusy("privacy");
    const ok = await edit.setPrivacy(privacy);
    setBusy(null);
    if (!ok) fail("The privacy setting");
  };

  const removeAttribute = (key: string) => {
    close();
    Alert.alert("Remove detail?", `Remove "${key}"? This cannot be undone.`, [
      { style: "cancel", text: "Cancel" },
      {
        onPress: async () => {
          setBusy(key);
          const ok = await edit.removeAttribute(key);
          setBusy(null);
          if (!ok) fail("The detail");
        },
        style: "destructive",
        text: "Remove",
      },
    ]);
  };

  const avatarMenu: ActionItem[] = [
    {
      icon: "move-outline",
      label: "Adjust photo",
      onPress: () => {
        close();
        avatarFlow.open(muse?.avatar);
      },
    },
    {
      icon: "images-outline",
      label: "Choose a new photo",
      onPress: () => {
        close();
        void avatarFlow.replace();
      },
    },
    { separator: true },
    {
      icon: "trash-outline",
      label: "Remove photo",
      onPress: () => {
        close();
        removeAvatar();
      },
      variant: "danger",
    },
  ];

  const privacyMenu: ActionItem[] = PRIVACY_OPTIONS.map((option) => ({
    icon: PRIVACY_ICON[option],
    label: PRIVACY_LABEL[option],
    onPress: () => void changePrivacy(option),
    variant: option === muse?.privacy ? "positive" : "default",
  }));

  const attributeMenu = (key: string, value: string): ActionItem[] => [
    {
      icon: "create-outline",
      label: "Edit",
      onPress: () => setSheet({ kind: "attribute", target: { key, value } }),
    },
    { separator: true },
    {
      icon: "trash-outline",
      label: "Remove",
      onPress: () => removeAttribute(key),
      variant: "danger",
    },
  ];

  return (
    <>
      <MusePanel accent={accent} hideBackground={look.hideExpandedBackground}>
        {/* Web's `InfoScoreCorner` and `InfoPrivacyCorner`, in the same corners. */}
        <View style={styles.corners}>
          {typeof muse?.totalPoints === "number" ? (
            <View
              accessibilityLabel={`${muse.totalPoints} points. Score reflects how active this character is in the community.`}
              style={[
                styles.score,
                {
                  borderColor: accent
                    ? withAlpha(accent, 0.45)
                    : "rgba(255,255,255,0.2)",
                },
              ]}
            >
              <ScoreIcon size={12} />
              <Text style={styles.scoreLabel}>
                {muse.totalPoints.toLocaleString()}
              </Text>
            </View>
          ) : (
            <View />
          )}
          {muse ? (
            <Pressable
              accessibilityHint={
                canChangePrivacy
                  ? "Change who can see this character"
                  : muse.originalVerseId
                    ? "Privacy is inherited from the original character"
                    : PRIVACY_HINT[muse.privacy]
              }
              accessibilityLabel={`Visibility: ${PRIVACY_LABEL[muse.privacy] ?? muse.privacy}`}
              accessibilityRole={canChangePrivacy ? "button" : "text"}
              disabled={!canChangePrivacy || busy === "privacy"}
              hitSlop={space.xs}
              onPress={() => setSheet({ kind: "privacy" })}
              style={styles.privacy}
            >
              {busy === "privacy" ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Ionicons
                  color="rgba(255,255,255,0.7)"
                  name={PRIVACY_ICON[muse.privacy] ?? "earth-outline"}
                  size={13}
                />
              )}
              {canChangePrivacy ? (
                <Ionicons
                  color="rgba(255,255,255,0.5)"
                  name="chevron-down"
                  size={10}
                />
              ) : null}
            </Pressable>
          ) : null}
        </View>

        <View style={styles.header}>
          {muse ? (
            <View style={styles.avatarWrap}>
              <MuseFace muse={muse} size={MUSE_AVATAR} />
              {isOwnMuse ? (
                <Pressable
                  accessibilityLabel={
                    muse.avatar?.src ? "Change photo" : "Add a photo"
                  }
                  accessibilityRole="button"
                  disabled={busy === "avatar" || avatarFlow.saving}
                  hitSlop={space.xs}
                  onPress={() =>
                    muse.avatar?.src
                      ? setSheet({ kind: "avatar-menu" })
                      : avatarFlow.open(null)
                  }
                  style={({ pressed }) => [
                    styles.camera,
                    {
                      backgroundColor: accent
                        ? withAlpha(accent, 0.85)
                        : "rgba(0,0,0,0.65)",
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  {busy === "avatar" ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Ionicons color="#ffffff" name="camera" size={13} />
                  )}
                </Pressable>
              ) : null}
            </View>
          ) : (
            <Shimmer
              height={MUSE_AVATAR}
              radius={MUSE_AVATAR / 2}
              width={MUSE_AVATAR}
            />
          )}

          {muse ? (
            <Text
              style={[styles.name, { color: look.nameColor ?? PANEL.primary }]}
            >
              {museName(muse)}
            </Text>
          ) : (
            <Shimmer height={18} width={140} />
          )}

          <PennedBy
            accent={accent}
            novelist={muse?.pennedBy}
            textColor={look.pennedByColor}
          />

          {nicknames.length > 0 || isOwnMuse ? (
            <Pressable
              accessibilityLabel="Nicknames"
              accessibilityRole={isOwnMuse ? "button" : "text"}
              disabled={!isOwnMuse}
              onPress={() => setSheet({ kind: "nicknames" })}
              style={styles.nicknames}
            >
              {nicknames.map((nickname) => (
                <View key={nickname} style={styles.nickname}>
                  <Text style={styles.nicknameLabel}>{nickname}</Text>
                </View>
              ))}
              {isOwnMuse && nicknames.length < MAX_NICKNAMES ? (
                <View style={[styles.nickname, styles.nicknameAdd]}>
                  <Ionicons color={PANEL.secondary} name="add" size={11} />
                  <Text style={styles.nicknameLabel}>
                    {nicknames.length === 0 ? "Add nickname" : "Add"}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          ) : null}

          {hasFandom || isOwnMuse ? (
            <Pressable
              accessibilityLabel={
                hasFandom ? `Fandom: ${fandom?.name}` : "Choose a fandom"
              }
              accessibilityRole={isOwnMuse ? "button" : "text"}
              disabled={!isOwnMuse}
              onPress={() => setSheet({ kind: "fandom" })}
              style={({ pressed }) => [
                styles.fandom,
                {
                  backgroundColor: hasFandom ? fandomColor : PANEL.pill,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <Text numberOfLines={1} style={styles.fandomLabel}>
                {hasFandom ? fandom?.name : "No fandom"}
              </Text>
              {isOwnMuse ? (
                <Ionicons
                  color="rgba(255,255,255,0.8)"
                  name="pencil"
                  size={9}
                />
              ) : null}
            </Pressable>
          ) : null}
        </View>

        <Divider accent={accent} />

        <SectionLabel
          trailing={
            isOwnMuse && attributes.length > 0 ? (
              <AddButton
                label="Add"
                onPress={() => setSheet({ kind: "attribute", target: null })}
              />
            ) : undefined
          }
        >
          Details
        </SectionLabel>

        {muse && attributes.length === 0 ? (
          <SectionEmpty
            accent={accent}
            label="No information yet."
            motion={motion}
            scene="blank-card"
          >
            {isOwnMuse ? (
              <AddButton
                label="Add a detail"
                onPress={() => setSheet({ kind: "attribute", target: null })}
              />
            ) : null}
          </SectionEmpty>
        ) : (
          <View style={styles.grid}>
            {attributes.map(([key, value]) => (
              <Pressable
                accessibilityHint={isOwnMuse ? "Edit or remove" : undefined}
                accessibilityLabel={`${key}: ${value}`}
                accessibilityRole={isOwnMuse ? "button" : "text"}
                disabled={!isOwnMuse || busy === key}
                key={key}
                onPress={() => setSheet({ key, kind: "attribute-menu", value })}
                style={({ pressed }) => [
                  styles.attribute,
                  glassCard(accent),
                  { opacity: pressed || busy === key ? 0.6 : 1 },
                ]}
              >
                <Text numberOfLines={1} style={styles.attributeKey}>
                  {key}
                </Text>
                <Text style={styles.attributeValue}>{value}</Text>
                {isOwnMuse ? (
                  <Ionicons
                    color={PANEL.faint}
                    name="ellipsis-horizontal"
                    size={12}
                    style={styles.attributeMore}
                  />
                ) : null}
              </Pressable>
            ))}
          </View>
        )}
      </MusePanel>

      {isOwnMuse && muse ? (
        <>
          <ActionMenu
            items={avatarMenu}
            onClose={close}
            title="Character photo"
            visible={sheet?.kind === "avatar-menu"}
          />
          <ActionMenu
            items={privacyMenu}
            onClose={close}
            subtitle="Who can see this character"
            title="Privacy"
            visible={sheet?.kind === "privacy"}
          />
          <ActionMenu
            items={
              sheet?.kind === "attribute-menu"
                ? attributeMenu(sheet.key, sheet.value)
                : []
            }
            onClose={close}
            subtitle={
              sheet?.kind === "attribute-menu" ? sheet.value : undefined
            }
            title={sheet?.kind === "attribute-menu" ? sheet.key : "Detail"}
            visible={sheet?.kind === "attribute-menu"}
          />
          <NicknameSheet
            edit={edit}
            nicknames={nicknames}
            onClose={close}
            visible={sheet?.kind === "nicknames"}
          />
          <FandomSheet
            current={fandom}
            edit={edit}
            onClose={close}
            visible={sheet?.kind === "fandom"}
          />
          <AttributeSheet
            edit={edit}
            existing={attributes.map(([key]) => key)}
            onClose={close}
            target={sheet?.kind === "attribute" ? sheet.target : null}
            visible={sheet?.kind === "attribute"}
          />
          <ImageCropEditor
            aspect={1}
            autoFit={avatarFlow.autoFit}
            busy={avatarFlow.saving}
            circle
            initial={avatarFlow.initial}
            onClose={avatarFlow.close}
            onConfirm={(crop) => void avatarFlow.confirm(crop)}
            onReplace={() => void avatarFlow.replace()}
            title="Adjust avatar"
            uploading={avatarFlow.uploading}
            uri={avatarFlow.uri}
            visible={avatarFlow.visible}
          />
        </>
      ) : null}
    </>
  );
};

/** Web's `InfoAttrAddBtn`: a small dashed pill. */
export const AddButton = ({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) => (
  <Pressable
    accessibilityRole="button"
    hitSlop={space.xs}
    onPress={onPress}
    style={({ pressed }) => [styles.add, { opacity: pressed ? 0.7 : 1 }]}
  >
    <Ionicons color={PANEL.secondary} name="add" size={12} />
    <Text style={styles.addLabel}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  add: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    flexDirection: "row",
    gap: space.xs,
    paddingHorizontal: space.ms,
    paddingVertical: space.xs,
  },
  addLabel: {
    color: PANEL.secondary,
    fontSize: fontSize.meta,
    fontWeight: "500",
  },
  attribute: {
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexBasis: "48%",
    flexGrow: 1,
    gap: 3,
    paddingHorizontal: space.ms,
    paddingVertical: space.sm,
  },
  attributeKey: {
    color: PANEL.muted,
    fontSize: fontSize.meta,
    fontWeight: "600",
    letterSpacing: 0.8,
    paddingRight: 14,
    textTransform: "uppercase",
  },
  attributeMore: { position: "absolute", right: 6, top: 6 },
  attributeValue: {
    color: "rgba(255,255,255,0.9)",
    fontSize: fontSize.label,
    fontWeight: "500",
  },
  avatarWrap: { position: "relative" },
  camera: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.7)",
    borderRadius: 13,
    borderWidth: 1.5,
    bottom: 0,
    height: 26,
    justifyContent: "center",
    position: "absolute",
    right: -2,
    width: 26,
  },
  corners: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  fandom: {
    alignItems: "center",
    borderRadius: radius.xs,
    flexDirection: "row",
    gap: 5,
    maxWidth: "80%",
    paddingLeft: 7,
    paddingRight: space.ms,
    paddingVertical: 3,
  },
  fandomLabel: {
    color: "#ffffff",
    flexShrink: 1,
    fontSize: fontSize.meta,
    fontWeight: "700",
    // Web's is 1.1; at that a long fandom no longer fits this panel.
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    width: "100%",
  },
  header: {
    alignItems: "center",
    gap: space.sm,
    paddingTop: space.s,
    width: "100%",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  nickname: {
    backgroundColor: PANEL.pill,
    borderColor: PANEL.pillBorder,
    borderRadius: radius.full,
    borderWidth: border.edge,
    paddingHorizontal: space.ms,
    paddingVertical: space.xxs,
  },
  nicknameAdd: {
    alignItems: "center",
    borderStyle: "dashed",
    flexDirection: "row",
    gap: space.xxs,
  },
  nicknameLabel: {
    color: PANEL.secondary,
    fontSize: fontSize.meta,
    fontStyle: "italic",
    letterSpacing: 0.3,
  },
  nicknames: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.s,
    justifyContent: "center",
  },
  privacy: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 14,
    flexDirection: "row",
    gap: space.xxs,
    height: 28,
    justifyContent: "center",
    minWidth: 28,
    paddingHorizontal: 7,
  },
  score: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.xs,
    paddingLeft: space.s,
    paddingRight: space.ms,
    paddingVertical: 3,
  },
  scoreLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: fontSize.meta,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
