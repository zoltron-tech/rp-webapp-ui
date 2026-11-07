import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@nw/features";
import {
  HEADCANON_VISIBILITY_COPY,
  type Headcanon,
  headcanonPath,
} from "@nw/types/headcanon";
import * as Clipboard from "expo-clipboard";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { HeartButton } from "@/components/heart-button";
import { IconButton } from "@/components/icon-button";
import { RichText } from "@/components/rich-text";
import { Text } from "@/components/text";
import type { CatalogLookups } from "@/lib/headcanons";
import { WEB_URL } from "@/lib/links";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";
import { HcSheet } from "./parts";
import { useAskAbout } from "./use-ask-about";

/**
 * One headcanon, read in full: its tags, title, body, the heart, and the two
 * ways to take it further — ask the writer about it, or copy its link (which
 * unfurls wherever it is pasted). The owner's edit, pin and delete sit in the
 * header as circles. Web's `HeadcanonDetailSheet`, as a fixed-height tray.
 */
export const HeadcanonDetailSheet = ({
  canEdit,
  headcanon,
  lookups,
  museId,
  museName,
  onClose,
  onDelete,
  onDismissed,
  onEdit,
  onHeart,
  onTogglePin,
  verseLabel,
  visible,
  writer,
}: {
  canEdit: boolean;
  headcanon: Headcanon | null;
  lookups: CatalogLookups;
  /** The character page the card is read on; its link opens here. */
  museId: string;
  museName: string;
  onClose: () => void;
  onDelete: (headcanon: Headcanon) => void;
  /** Once the tray has left the screen, for opening the editor after it. */
  onDismissed?: () => void;
  onEdit: (headcanon: Headcanon) => void;
  onHeart: (headcanon: Headcanon) => void;
  onTogglePin: (headcanon: Headcanon) => void;
  verseLabel?: string | null;
  visible: boolean;
  /** Who wrote it, for "Ask about this". */
  writer: { id: string; username: string } | null;
}) => {
  const theme = useAppTheme();
  const session = useSession();
  const { ask, asking } = useAskAbout();
  const [revealed, setRevealed] = useState(false);
  const [pinning, setPinning] = useState(false);

  const id = headcanon?.id;
  useEffect(() => {
    setRevealed(false);
    setPinning(false);
  }, [id]);

  const loggedIn = Boolean(session.novelist?.id);
  const link = headcanon
    ? `${WEB_URL}${headcanonPath(museId, headcanon.id)}`
    : "";
  const hidden = Boolean(headcanon?.spoiler && !revealed && !canEdit);

  const confirmDelete = () => {
    if (!headcanon) return;
    Alert.alert(
      "Delete this headcanon?",
      "It disappears from the profile, along with its hearts. This cannot be undone.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: () => onDelete(headcanon),
          style: "destructive",
          text: "Delete",
        },
      ],
    );
  };

  const copyLink = async () => {
    try {
      await Clipboard.setStringAsync(link);
      Alert.alert("Link copied", "It opens as a card in posts and chats.");
    } catch {
      Alert.alert("Not copied", "The link could not be copied.");
    }
  };

  const tag = (
    label: string,
    icon?: keyof typeof Ionicons.glyphMap,
    accent = false,
  ) => (
    <View
      key={label}
      style={[
        styles.tag,
        accent
          ? {
              backgroundColor: theme.accent.surface,
              borderColor: theme.accent.tint,
            }
          : {
              backgroundColor: theme.material.fillTranslucent,
              borderColor: theme.material.edgeTranslucent,
            },
      ]}
    >
      {icon ? (
        <Ionicons
          color={accent ? theme.accent.text : theme.textGray}
          name={icon}
          size={12}
        />
      ) : null}
      <Text
        style={[
          styles.tagLabel,
          { color: accent ? theme.accent.text : theme.text },
        ]}
      >
        {label}
      </Text>
    </View>
  );

  return (
    <HcSheet
      footer={
        headcanon ? (
          <View style={styles.foot}>
            <View style={styles.heart}>
              <HeartButton
                emptyHint="No hearts yet"
                liked={headcanon.hearted}
                likes={headcanon.heartCount}
                onToggle={() =>
                  loggedIn
                    ? onHeart(headcanon)
                    : Alert.alert("Sign in", "Sign in to heart headcanons.")
                }
              />
            </View>
            <View style={styles.actions}>
              {loggedIn && !canEdit && writer ? (
                <Pressable
                  accessibilityHint="Sends this headcanon to the writer, then opens your chat"
                  accessibilityRole="button"
                  disabled={asking}
                  onPress={async () => {
                    if (await ask(writer, link)) onClose();
                  }}
                  style={({ pressed }) => [
                    styles.action,
                    {
                      backgroundColor: pressed
                        ? theme.accent.fillPressed
                        : theme.accent.fill,
                      borderColor: theme.accent.fill,
                    },
                  ]}
                >
                  {asking ? (
                    <ActivityIndicator
                      color={theme.accent.onFill}
                      size="small"
                    />
                  ) : (
                    <Ionicons
                      color={theme.accent.onFill}
                      name="chatbubble-outline"
                      size={15}
                    />
                  )}
                  <Text
                    numberOfLines={1}
                    style={[styles.actionLabel, { color: theme.accent.onFill }]}
                  >
                    {`Ask @${writer.username}`}
                  </Text>
                </Pressable>
              ) : null}
              <Pressable
                accessibilityLabel="Copy link"
                accessibilityRole="button"
                onPress={() => void copyLink()}
                style={({ pressed }) => [
                  styles.action,
                  {
                    backgroundColor: pressed
                      ? theme.material.fillPressed
                      : theme.material.fillTranslucent,
                    borderColor: theme.material.edgeTranslucent,
                  },
                ]}
              >
                <Ionicons color={theme.text} name="link-outline" size={15} />
                <Text style={[styles.actionLabel, { color: theme.text }]}>
                  Copy link
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null
      }
      headerAction={
        <View style={styles.header}>
          {canEdit && headcanon ? (
            <>
              <IconButton
                accessibilityLabel="Edit this headcanon"
                hitSlop={space.xxs}
                icon="pencil"
                onPress={() => onEdit(headcanon)}
                tone="material"
              />
              <IconButton
                accessibilityLabel={
                  headcanon.pinned
                    ? "Unpin from the profile"
                    : "Pin to the profile"
                }
                busy={pinning}
                hitSlop={space.xxs}
                icon={headcanon.pinned ? "pin" : "pin-outline"}
                onPress={async () => {
                  setPinning(true);
                  await onTogglePin(headcanon);
                  setPinning(false);
                }}
                tone="material"
              />
              <IconButton
                accessibilityLabel="Delete this headcanon"
                hitSlop={space.xxs}
                icon="trash-outline"
                onPress={confirmDelete}
                tone="danger"
              />
            </>
          ) : null}
          <IconButton
            accessibilityLabel="Close"
            hitSlop={space.xxs}
            icon="close"
            onPress={onClose}
            tone="glass"
          />
        </View>
      }
      onClose={onClose}
      onDismissed={onDismissed}
      title={museName ? `${museName} · Headcanon` : "Headcanon"}
      visible={visible}
    >
      {headcanon ? (
        <>
          <View style={styles.meta}>
            {tag(lookups.categoryLabel(headcanon.category), undefined, true)}
            {tag(headcanon.alternateUniverse ? "AU" : "Canon")}
            {verseLabel ? tag(verseLabel) : null}
            {headcanon.visibility !== "PUBLIC"
              ? tag(
                  HEADCANON_VISIBILITY_COPY[headcanon.visibility].label,
                  headcanon.visibility === "FRIENDS"
                    ? "people-outline"
                    : "lock-closed-outline",
                )
              : null}
            {headcanon.pinned ? tag("Pinned", "pin-outline") : null}
          </View>

          {headcanon.title ? (
            <Text style={[styles.title, { color: theme.text }]}>
              {headcanon.title}
            </Text>
          ) : null}

          {hidden ? (
            <View
              style={[
                styles.spoiler,
                { borderColor: theme.material.edgeTranslucent },
              ]}
            >
              <Ionicons
                color={theme.textGray}
                name="eye-off-outline"
                size={20}
              />
              <Text style={[styles.spoilerTitle, { color: theme.text }]}>
                Spoiler
              </Text>
              <Text style={[styles.spoilerText, { color: theme.textGray }]}>
                The writer marked this one as a spoiler.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setRevealed(true)}
                style={({ pressed }) => [
                  styles.action,
                  {
                    backgroundColor: pressed
                      ? theme.accent.fillPressed
                      : theme.accent.fill,
                    borderColor: theme.accent.fill,
                  },
                ]}
              >
                <Text
                  style={[styles.actionLabel, { color: theme.accent.onFill }]}
                >
                  Show it
                </Text>
              </Pressable>
            </View>
          ) : (
            <RichText html={headcanon.body} />
          )}
        </>
      ) : null}
    </HcSheet>
  );
};

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    flexShrink: 1,
    gap: space.s,
    minHeight: 36,
    paddingHorizontal: space.m,
  },
  actionLabel: { flexShrink: 1, fontSize: fontSize.label, fontWeight: "700" },
  actions: {
    flexDirection: "row",
    flexShrink: 1,
    gap: space.sm,
    justifyContent: "flex-end",
  },
  foot: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
    justifyContent: "space-between",
  },
  header: { flexDirection: "row", gap: space.s },
  heart: { flexShrink: 1, minWidth: 0 },
  meta: { flexDirection: "row", flexWrap: "wrap", gap: space.s },
  spoiler: {
    alignItems: "center",
    borderRadius: radius.lg,
    borderStyle: "dashed",
    borderWidth: 1.5,
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.lg,
  },
  spoilerText: { fontSize: fontSize.label, textAlign: "center" },
  spoilerTitle: { fontSize: fontSize.body, fontWeight: "700" },
  tag: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: space.ms,
    paddingVertical: 4,
  },
  tagLabel: { fontSize: fontSize.caption, fontWeight: "600" },
  title: { fontSize: fontSize.lead + 2, fontWeight: "700" },
});
