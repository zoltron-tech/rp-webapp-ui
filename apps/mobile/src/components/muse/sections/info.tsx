import { Ionicons } from "@expo/vector-icons";
import type { Muse } from "@nw/types";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { type ActionItem, ActionMenu } from "@/components/action-menu";
import { AttributeSheet } from "@/components/muse/edit/attribute-sheet";
import { FandomSheet } from "@/components/muse/edit/fandom-sheet";
import { AvatarBadge, PrivacyMark } from "@/components/muse/header-tools";
import {
  MAX_NICKNAMES,
  NicknameSheet,
} from "@/components/muse/edit/nickname-sheet";
import {
  MiniHeader,
  MUSE_AVATAR,
  MuseFace,
} from "@/components/muse/mini-header";
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
import { useSectionSwitcher } from "@/components/muse/section-switcher";
import type { MuseEdit } from "@/hooks/use-muse-edit";
import { asColor } from "@/lib/color";
import type { MuseLook } from "@/lib/muse-appearance";
import { museName } from "@/lib/muse-appearance";
import { border, fontSize, radius, space } from "@/theme";

/**
 * Web's `MuseInfoSection`.
 *
 * The same column: the privacy mark in the corner, the face,
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

type Sheet =
  | { kind: "attribute"; target: { key: string; value: string } | null }
  | { kind: "attribute-menu"; key: string; value: string }
  | { kind: "fandom" }
  | { kind: "nicknames" }
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
  const shared = Boolean(useSectionSwitcher());
  const [sheet, setSheet] = useState<Sheet>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const attributes = Object.entries(muse?.extraAttributes ?? {});
  const nicknames = muse?.nicknames ?? [];
  const fandom = muse?.fandom;
  const hasFandom = Boolean(fandom?.name && fandom.id !== "FANDOMLESS");
  const fandomColor = asColor(fandom?.color) ?? "#555555";
  const close = () => setSheet(null);

  const fail = (what: string) =>
    Alert.alert("Not saved", `${what} could not be saved. Try again.`);

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

  const attributeMenu = (key: string, value: string): ActionItem[] => [
    {
      icon: "create-outline",
      label: "Edit",
      onSelect: () => setSheet({ kind: "attribute", target: { key, value } }),
    },
    { separator: true },
    {
      icon: "trash-outline",
      label: "Remove",
      onSelect: () => removeAttribute(key),
      variant: "danger",
    },
  ];

  const nicknameRow =
    nicknames.length > 0 || isOwnMuse ? (
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
    ) : null;

  const fandomChip =
    hasFandom || isOwnMuse ? (
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
          <Ionicons color="rgba(255,255,255,0.8)" name="pencil" size={9} />
        ) : null}
      </Pressable>
    ) : null;

  const detailsLabel = (
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
  );

  const details =
    muse && attributes.length === 0 ? (
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
    );

  return (
    <>
      {shared ? (
        /*
         * Inside the About tab: the same pinned mini header (and switcher) as
         * Story and Canon, so the top of the card stays put when switching.
         * Its privacy mark and camera are every section's (`header-tools`);
         * nicknames and fandom open the scrolling part. Web does the same.
         */
        <MusePanel
          accent={accent}
          hideBackground={look.hideExpandedBackground}
          header={
            <>
              <MiniHeader look={look} muse={muse} />
              <Divider accent={accent} />
            </>
          }
        >
          {nicknameRow || fandomChip ? (
            <>
              <View style={styles.header}>
                {nicknameRow}
                {fandomChip}
              </View>
              <Divider accent={accent} />
            </>
          ) : null}
          {detailsLabel}
          {details}
        </MusePanel>
      ) : (
        <MusePanel
          accent={accent}
          hideBackground={look.hideExpandedBackground}
          header={
            <>
              {/* Web's InfoPrivacyCorner, in the same corner; the spacer keeps it right. */}
              <View style={styles.corners}>
                <View />
                {muse ? <PrivacyMark muse={muse} /> : null}
              </View>

              <View style={styles.header}>
                {muse ? (
                  <View style={styles.avatarWrap}>
                    <MuseFace muse={muse} size={MUSE_AVATAR} />
                    <AvatarBadge accent={accent} muse={muse} />
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
                    style={[
                      styles.name,
                      { color: look.nameColor ?? PANEL.primary },
                    ]}
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

                {nicknameRow}
                {fandomChip}
              </View>

              <Divider accent={accent} />
              {detailsLabel}
            </>
          }
        >
          {details}
        </MusePanel>
      )}

      {isOwnMuse && muse ? (
        <>
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
});
