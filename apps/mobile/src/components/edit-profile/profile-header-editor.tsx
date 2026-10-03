import { Ionicons } from "@expo/vector-icons";
import type { Novelist } from "@nw/types/novelist";
import { IMAGE_SIZES, wsrvImage } from "@nw/utils/image";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { type ActionItem, ActionMenu } from "@/components/action-menu";
import { Avatar } from "@/components/avatar";
import { CroppedImage } from "@/components/cropped-image";
import { NoteEditSheet } from "@/components/edit-profile/note-sheet";
import { ImageCropEditor } from "@/components/muse/edit/image-crop-editor";
import { getNoteEmojiRotate, NoteEmojiIcon } from "@/components/note-emoji";
import { useImageCropFlow } from "@/hooks/use-image-crop-flow";
import { existingAvatar, type ProfileEdit } from "@/hooks/use-profile-edit";
import { asColor, withAlpha } from "@/lib/color";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The top of your profile — cover, photo and note — edited where it is drawn.
 *
 * The three were separate settings groups, each with its own preview, which
 * made the one thing people care about (how they fit together) the one thing
 * the page never showed. Here they are one piece laid out as the profile lays
 * them out: the photo lifted into the cover, the note rising from it as a
 * thought bubble.
 *
 * Every part is its own target — tap the cover, the photo or the bubble —
 * and the toolbar underneath says the same three things in words, with
 * whether each is set, for anyone who does not think to tap a picture. The
 * cover and a written note open a short menu, because they can also be
 * removed; the photo goes straight to the crop editor, which has Replace.
 */

const AVATAR = 92;

type Menu = "cover" | "note" | null;

const ToolButton = ({
  icon,
  isSet,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  isSet: boolean;
  label: string;
  onPress: () => void;
}) => {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityHint={
        isSet ? `Change your ${label.toLowerCase()}` : undefined
      }
      accessibilityLabel={isSet ? label : `Add ${label.toLowerCase()}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.tool,
        pressed && { backgroundColor: theme.material.fillPressed },
      ]}
    >
      <View style={[styles.toolIcon, { backgroundColor: theme.accent.tint }]}>
        <Ionicons color={theme.accent.text} name={icon} size={18} />
      </View>
      <Text style={[styles.toolLabel, { color: theme.text }]}>{label}</Text>
      <View style={styles.toolStatus}>
        <View
          style={[
            styles.statusDot,
            isSet
              ? { backgroundColor: theme.accent.solid }
              : { borderColor: theme.textGray, borderWidth: 1 },
          ]}
        />
        <Text style={[styles.statusLabel, { color: theme.textGray }]}>
          {isSet ? "Set" : "Add"}
        </Text>
      </View>
    </Pressable>
  );
};

export const ProfileHeaderEditor = ({
  edit,
  novelist,
}: {
  edit: ProfileEdit;
  novelist: Novelist;
}) => {
  const theme = useAppTheme();
  const [menu, setMenu] = useState<Menu>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [busy, setBusy] = useState<"cover" | "note" | null>(null);

  const avatarFlow = useImageCropFlow({ onSave: edit.setAvatar, prefix: null });
  const bannerFlow = useImageCropFlow({ onSave: edit.setBanner, prefix: null });

  const banner = novelist.banner?.src ? novelist.banner : null;
  const note = novelist.note?.text?.trim() ? novelist.note : null;
  const noteColor = asColor(note?.color);
  const bubbleColor = noteColor ?? theme.accent.tintStrong;
  const name =
    [novelist.firstName, novelist.lastName].filter(Boolean).join(" ") ||
    novelist.username;

  const confirmRemove = (
    what: "cover" | "note",
    title: string,
    message: string,
    task: () => Promise<boolean>,
    failure: string,
  ) =>
    Alert.alert(title, message, [
      { style: "cancel", text: "Cancel" },
      {
        onPress: async () => {
          setBusy(what);
          const ok = await task();
          setBusy(null);
          if (!ok) Alert.alert("Not saved", failure);
        },
        style: "destructive",
        text: what === "cover" ? "Remove" : "Clear",
      },
    ]);

  const openCover = () => (banner ? setMenu("cover") : bannerFlow.open(null));
  const openPhoto = () =>
    avatarFlow.open(existingAvatar(novelist.avatar, novelist.image));
  const openNoteTool = () => (note ? setMenu("note") : setNoteOpen(true));

  const coverItems: ActionItem[] = [
    {
      icon: "move-outline",
      label: "Reposition",
      onPress: () => {
        setMenu(null);
        bannerFlow.open(banner);
      },
    },
    {
      icon: "swap-horizontal",
      label: "Replace image",
      onPress: () => {
        setMenu(null);
        void bannerFlow.replace();
      },
    },
    { separator: true },
    {
      icon: "trash-outline",
      label: "Remove cover",
      onPress: () => {
        setMenu(null);
        confirmRemove(
          "cover",
          "Remove cover banner?",
          "Your profile will show a blurred avatar instead.",
          edit.removeBanner,
          "The banner could not be removed.",
        );
      },
      variant: "danger",
    },
  ];

  const noteItems: ActionItem[] = [
    {
      icon: "create-outline",
      label: "Edit note",
      onPress: () => {
        setMenu(null);
        setNoteOpen(true);
      },
    },
    { separator: true },
    {
      icon: "trash-outline",
      label: "Clear note",
      onPress: () => {
        setMenu(null);
        confirmRemove(
          "note",
          "Clear your note?",
          "It will disappear from your profile.",
          edit.removeNote,
          "The note could not be cleared.",
        );
      },
      variant: "danger",
    },
  ];

  return (
    <>
      <View>
        {/* Cover */}
        <Pressable
          accessibilityLabel={
            banner ? "Cover banner options" : "Add a cover banner"
          }
          accessibilityRole="button"
          onPress={openCover}
          style={({ pressed }) => [
            styles.banner,
            {
              backgroundColor: theme.material.fillPressed,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          {banner ? (
            <CroppedImage
              crop={banner.crop}
              style={StyleSheet.absoluteFill}
              uri={wsrvImage(banner.src, IMAGE_SIZES.BANNER_MEDIUM) ?? ""}
            />
          ) : (
            <>
              <LinearGradient
                colors={[
                  withAlpha(theme.accent.solid, 0.38),
                  withAlpha(theme.accent.solid, 0.06),
                ]}
                end={{ x: 1, y: 1 }}
                start={{ x: 0, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <View
                style={[
                  styles.coverEmpty,
                  { borderColor: withAlpha(theme.accent.solid, 0.75) },
                ]}
              >
                <Ionicons
                  color={theme.accent.text}
                  name="image-outline"
                  size={22}
                />
                <Text style={[styles.coverEmptyLabel, { color: theme.text }]}>
                  Add a cover
                </Text>
              </View>
            </>
          )}

          {banner ? (
            <View style={styles.coverPill}>
              <Ionicons color="#ffffff" name="camera" size={13} />
              <Text style={styles.coverPillLabel}>Edit cover</Text>
            </View>
          ) : null}

          {busy === "cover" ? (
            <View style={[StyleSheet.absoluteFill, styles.busyOverlay]}>
              <ActivityIndicator color="#ffffff" />
            </View>
          ) : null}
        </Pressable>

        {/* Photo and note, in the profile's own arrangement. */}
        <View style={styles.headerRow}>
          <Pressable
            accessibilityLabel="Change profile photo"
            accessibilityRole="button"
            onPress={openPhoto}
            style={[
              styles.avatarWrap,
              { backgroundColor: theme.material.fill },
            ]}
          >
            <Avatar
              image={novelist.avatar}
              name={novelist.firstName}
              size={AVATAR}
              uri={novelist.avatar?.src ?? novelist.image}
            />
            <View
              style={[
                styles.avatarBadge,
                {
                  backgroundColor: theme.accent.solid,
                  borderColor: theme.material.fill,
                },
              ]}
            >
              <Ionicons color="#ffffff" name="camera" size={14} />
            </View>
          </Pressable>

          <Pressable
            accessibilityLabel={
              note ? `Status note: ${note.text}` : "Add a note"
            }
            accessibilityRole="button"
            onLongPress={note ? () => setMenu("note") : undefined}
            onPress={() => setNoteOpen(true)}
            style={({ pressed }) => [
              styles.noteArea,
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[
                styles.bubble,
                note
                  ? { backgroundColor: bubbleColor, borderColor: "transparent" }
                  : {
                      backgroundColor: theme.background,
                      borderColor: withAlpha(theme.accent.solid, 0.8),
                      borderStyle: "dashed",
                    },
              ]}
            >
              {/* The thought trail, stepping back toward the photo. */}
              <View
                style={[
                  styles.dotLarge,
                  {
                    backgroundColor: note ? bubbleColor : theme.accent.solid,
                    opacity: note ? 1 : 0.55,
                  },
                ]}
              />
              <View
                style={[
                  styles.dotSmall,
                  {
                    backgroundColor: note ? bubbleColor : theme.accent.solid,
                    opacity: note ? 1 : 0.35,
                  },
                ]}
              />

              {note ? (
                <Text
                  numberOfLines={3}
                  style={[
                    styles.noteText,
                    { color: noteColor ? "#ffffff" : theme.text },
                  ]}
                >
                  {note.text}
                </Text>
              ) : (
                <View style={styles.noteEmpty}>
                  <Ionicons
                    color={theme.accent.text}
                    name="add-circle"
                    size={16}
                  />
                  <Text
                    style={[styles.noteEmptyText, { color: theme.textGray }]}
                  >
                    Add a note
                  </Text>
                </View>
              )}

              {note?.emoji ? (
                <View
                  style={[
                    styles.emoji,
                    getNoteEmojiRotate(note.emoji) && styles.tilted,
                  ]}
                >
                  <NoteEmojiIcon emojiKey={note.emoji} size={24} />
                </View>
              ) : null}

              {note ? (
                <View
                  style={[
                    styles.noteEdit,
                    {
                      backgroundColor: theme.material.fill,
                      borderColor: theme.material.edge,
                    },
                  ]}
                >
                  <Ionicons color={theme.text} name="pencil" size={10} />
                </View>
              ) : null}

              {busy === "note" ? (
                <View style={[StyleSheet.absoluteFill, styles.noteBusy]}>
                  <ActivityIndicator color={theme.text} size="small" />
                </View>
              ) : null}
            </View>
          </Pressable>
        </View>

        <View style={styles.identity}>
          <Text numberOfLines={1} style={[styles.name, { color: theme.text }]}>
            {name}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.handle, { color: theme.textGray }]}
          >
            @{novelist.username}
          </Text>
        </View>

        <View
          style={[styles.toolbar, { borderTopColor: theme.material.edge }]}
        >
          <ToolButton
            icon="image-outline"
            isSet={Boolean(banner)}
            label="Cover"
            onPress={openCover}
          />
          <View
            style={[
              styles.toolRule,
              { backgroundColor: theme.material.edge },
            ]}
          />
          <ToolButton
            icon="person-circle-outline"
            isSet={Boolean(novelist.image)}
            label="Photo"
            onPress={openPhoto}
          />
          <View
            style={[
              styles.toolRule,
              { backgroundColor: theme.material.edge },
            ]}
          />
          <ToolButton
            icon="chatbubble-ellipses-outline"
            isSet={Boolean(note)}
            label="Note"
            onPress={openNoteTool}
          />
        </View>
      </View>

      <ActionMenu
        items={coverItems}
        onClose={() => setMenu(null)}
        title="Cover banner"
        visible={menu === "cover"}
      />
      <ActionMenu
        items={noteItems}
        onClose={() => setMenu(null)}
        subtitle={note?.text}
        title="Status note"
        visible={menu === "note"}
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
        title="Adjust photo"
        uploading={avatarFlow.uploading}
        uri={avatarFlow.uri}
        visible={avatarFlow.visible}
      />
      <ImageCropEditor
        aspect={5 / 2}
        autoFit={bannerFlow.autoFit}
        busy={bannerFlow.saving}
        initial={bannerFlow.initial}
        onClose={bannerFlow.close}
        onConfirm={(crop) => void bannerFlow.confirm(crop)}
        onReplace={() => void bannerFlow.replace()}
        title="Adjust cover"
        uploading={bannerFlow.uploading}
        uri={bannerFlow.uri}
        visible={bannerFlow.visible}
      />
      <NoteEditSheet
        edit={edit}
        note={novelist.note}
        onClose={() => setNoteOpen(false)}
        visible={noteOpen}
      />
    </>
  );
};

const styles = StyleSheet.create({
  avatarBadge: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 3,
    bottom: 2,
    height: 30,
    justifyContent: "center",
    position: "absolute",
    right: 2,
    width: 30,
  },
  avatarWrap: {
    borderRadius: radius.full,
    marginTop: -(AVATAR / 2),
    padding: 4,
  },
  banner: { aspectRatio: 5 / 2, overflow: "hidden", width: "100%" },
  bubble: {
    alignSelf: "flex-start",
    borderRadius: radius.lg + 2,
    borderWidth: 1.5,
    marginLeft: 22,
    maxWidth: "100%",
    paddingHorizontal: space.sm + 6,
    paddingVertical: space.sm + 1,
  },
  busyOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
  },
  coverEmpty: {
    alignItems: "center",
    borderRadius: radius.md,
    borderStyle: "dashed",
    borderWidth: 1.5,
    bottom: space.sm,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    left: AVATAR + space.lg,
    position: "absolute",
    right: space.sm,
    top: space.sm,
  },
  coverEmptyLabel: { fontSize: fontSize.label, fontWeight: "700" },
  coverPill: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    borderRadius: radius.full,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: space.sm + 2,
    paddingVertical: 5,
    position: "absolute",
    right: space.sm,
    top: space.sm,
  },
  coverPillLabel: {
    color: "#ffffff",
    fontSize: fontSize.caption,
    fontWeight: "700",
  },
  /** Web's `::before` and `::after`, walking left toward the photo. */
  dotLarge: {
    borderRadius: 6,
    height: 12,
    left: -12,
    marginTop: -6,
    position: "absolute",
    top: "50%",
    width: 12,
  },
  dotSmall: {
    borderRadius: 3.5,
    height: 7,
    left: -22,
    marginTop: 5,
    position: "absolute",
    top: "50%",
    width: 7,
  },
  /** Web's `NoteBubbleEmoji`: perched on the bubble's top-right corner. */
  emoji: { position: "absolute", right: -10, top: -14 },
  handle: { fontSize: fontSize.caption },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.xs,
    paddingHorizontal: space.md,
  },
  identity: {
    gap: 1,
    paddingBottom: space.md,
    paddingHorizontal: space.md,
    paddingTop: space.sm,
  },
  name: { fontSize: fontSize.title - 2, fontWeight: "700" },
  noteArea: { flex: 1, minWidth: 0, paddingTop: space.sm },
  noteBusy: {
    alignItems: "center",
    borderRadius: radius.lg,
    justifyContent: "center",
  },
  noteEdit: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    bottom: -7,
    height: 20,
    justifyContent: "center",
    position: "absolute",
    right: -4,
    width: 20,
  },
  noteEmpty: { alignItems: "center", flexDirection: "row", gap: 5 },
  noteEmptyText: { fontSize: fontSize.label, fontWeight: "600" },
  noteText: { fontSize: fontSize.label, lineHeight: 18 },
  pressed: { opacity: 0.85 },
  statusDot: { borderRadius: 3.5, height: 7, width: 7 },
  statusLabel: { fontSize: 11 },
  tilted: { transform: [{ rotate: "45deg" }] },
  tool: {
    alignItems: "center",
    flex: 1,
    gap: 4,
    paddingVertical: space.sm + 4,
  },
  toolbar: { borderTopWidth: StyleSheet.hairlineWidth, flexDirection: "row" },
  toolIcon: {
    alignItems: "center",
    borderRadius: radius.md + 2,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  toolLabel: { fontSize: fontSize.label, fontWeight: "700" },
  toolRule: { marginVertical: space.md, width: StyleSheet.hairlineWidth },
  toolStatus: { alignItems: "center", flexDirection: "row", gap: 4 },
});
