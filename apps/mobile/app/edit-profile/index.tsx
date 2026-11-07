import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@nw/features";
import { IMAGE_SIZES, wsrvImage } from "@nw/utils/image";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text, TextInput } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { CroppedImage } from "@/components/cropped-image";
import { ImageCropEditor } from "@/components/muse/edit/image-crop-editor";
import {
  Chip,
  PillButton,
  SettingsGroup,
  SettingsRow,
} from "@/components/settings";
import { useAvatarPicker } from "@/hooks/use-avatar-picker";
import { useImageCropFlow } from "@/hooks/use-image-crop-flow";
import { useKeyboardOffset } from "@/hooks/use-keyboard-height";
import { existingAvatar, useProfileEdit } from "@/hooks/use-profile-edit";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Web's `LandingSection`: the face, cover and name you are editing, then the
 * sections to open.
 *
 * Everything you can change here says so before you touch it — the cover and
 * the avatar carry an edit badge, and the name is drawn as two fields with a
 * pencil rather than as text — because a settings page that looks like the
 * profile it edits leaves people tapping around to find what moves.
 *
 * The avatar saves the moment its crop is confirmed. The name is typed, so it
 * keeps web's explicit save, in a bar that rises over the keyboard only while
 * there is something to save.
 */

const NAME_MAX = 50;
const SAVE_BAR_HEIGHT = 64;

const stripHtml = (html: string | null | undefined) =>
  (html ?? "").replace(/<[^>]*>/g, "").trim();

/** A name field that looks like one: framed, labelled, with a pencil. */
const NameInput = ({
  label,
  onChangeText,
  onSubmitEditing,
  placeholder,
  returnKeyType,
  value,
}: {
  label: string;
  onChangeText: (value: string) => void;
  onSubmitEditing?: () => void;
  placeholder: string;
  returnKeyType: "next" | "done";
  value: string;
}) => {
  const theme = useAppTheme();
  const input = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      accessibilityHint="Double tap to edit"
      onPress={() => input.current?.focus()}
      style={styles.nameField}
    >
      <Text style={[styles.nameLabel, { color: theme.textGray }]}>{label}</Text>
      <View
        style={[
          styles.nameFrame,
          {
            backgroundColor: theme.glass.field,
            borderColor: focused ? theme.accent.solid : theme.material.edge,
          },
        ]}
      >
        <TextInput
          autoCapitalize="words"
          maxLength={NAME_MAX}
          onBlur={() => setFocused(false)}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor={theme.textGray}
          ref={input}
          returnKeyType={returnKeyType}
          selectionColor={theme.accent.solid}
          style={[styles.nameInput, { color: theme.text }]}
          value={value}
        />
        <Ionicons
          color={focused ? theme.accent.text : theme.textGray}
          name={focused ? "create" : "pencil"}
          size={16}
        />
      </View>
    </Pressable>
  );
};

export default function EditProfileHome() {
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const keyboardOffset = useKeyboardOffset(insets.bottom);
  const { novelist, user } = useSession();
  const edit = useProfileEdit();
  const lastNameInput = useRef<TextInput>(null);

  const [firstName, setFirstName] = useState(novelist?.firstName ?? "");
  const [lastName, setLastName] = useState(novelist?.lastName ?? "");
  const [saving, setSaving] = useState(false);

  // A save elsewhere (or this one landing) re-seeds the fields.
  useEffect(() => {
    setFirstName(novelist?.firstName ?? "");
    setLastName(novelist?.lastName ?? "");
  }, [novelist?.firstName, novelist?.lastName]);

  const avatarFlow = useImageCropFlow({
    onSave: edit.setAvatar,
    prefix: null,
  });
  const avatarPicker = useAvatarPicker(avatarFlow);

  if (!novelist) return null;

  const dirty =
    firstName.trim() !== (novelist.firstName ?? "") ||
    lastName.trim() !== (novelist.lastName ?? "");
  const nameMissing = firstName.trim().length === 0;
  const canSave = dirty && !nameMissing && !saving;

  const saveName = async () => {
    if (!canSave) return;
    setSaving(true);
    const ok = await edit.saveNovelist({ firstName, lastName });
    setSaving(false);
    if (!ok) Alert.alert("Not saved", "Your name could not be saved. Try again.");
  };

  const resetName = () => {
    setFirstName(novelist.firstName ?? "");
    setLastName(novelist.lastName ?? "");
  };

  const openAppearance = () => router.push("/edit-profile/appearance");

  const hasBanner = Boolean(novelist.banner?.src);
  const verified = novelist.isVerified ?? user?.emailVerified ?? false;
  const hasBio = Boolean(stripHtml(novelist.about));
  const displayName =
    [firstName.trim(), lastName.trim()].filter(Boolean).join(" ") ||
    novelist.username;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.body,
          {
            paddingBottom:
              insets.bottom +
              space.xl +
              keyboardOffset +
              (dirty ? SAVE_BAR_HEIGHT : 0),
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.hero,
            {
              backgroundColor: theme.material.fill,
              borderColor: theme.material.edge,
            },
          ]}
        >
          {/* The cover. It opens Appearance, where the crop editor lives. */}
          <Pressable
            accessibilityHint="Opens Appearance"
            accessibilityLabel={
              hasBanner ? "Edit cover banner" : "Add a cover banner"
            }
            accessibilityRole="button"
            onPress={openAppearance}
            style={({ pressed }) => [
              styles.banner,
              {
                backgroundColor: theme.accent.tint,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            {hasBanner ? (
              <>
                <CroppedImage
                  crop={novelist.banner?.crop}
                  style={StyleSheet.absoluteFill}
                  uri={
                    wsrvImage(novelist.banner?.src, IMAGE_SIZES.BANNER_MEDIUM) ??
                    ""
                  }
                />
                <View style={styles.coverBadge}>
                  <Ionicons color="#ffffff" name="camera" size={14} />
                  <Text style={styles.coverBadgeLabel}>Edit cover</Text>
                </View>
              </>
            ) : (
              <View
                style={[
                  styles.coverEmpty,
                  { borderColor: theme.accent.solid },
                ]}
              >
                <Ionicons
                  color={theme.accent.text}
                  name="image-outline"
                  size={26}
                />
                <Text style={[styles.coverEmptyTitle, { color: theme.text }]}>
                  Add a cover banner
                </Text>
                <Text
                  style={[styles.coverEmptyHint, { color: theme.textGray }]}
                >
                  Tap to customize
                </Text>
              </View>
            )}
          </Pressable>

          <View style={styles.heroRow}>
            <Pressable
              accessibilityLabel="Change avatar"
              accessibilityRole="button"
              onPress={() =>
                avatarPicker.open(
                  existingAvatar(novelist.avatar, novelist.image),
                )
              }
              style={[
                styles.avatarWrap,
                { backgroundColor: theme.material.fill },
              ]}
            >
              <Avatar
                image={novelist.avatar}
                name={novelist.firstName}
                size={84}
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
            <View style={styles.heroIdentity}>
              <Text
                numberOfLines={1}
                style={[styles.heroName, { color: theme.text }]}
              >
                {displayName}
              </Text>
              <View style={styles.chips}>
                <Chip label={`@${novelist.username}`} tone="accent" />
                <Chip
                  icon={verified ? "checkmark-circle" : "alert-circle"}
                  label={verified ? "Verified" : "Unverified"}
                  tone={verified ? "positive" : "danger"}
                />
              </View>
            </View>
          </View>

          <View style={styles.nameSection}>
            <View style={styles.nameHeader}>
              <Text style={[styles.nameTitle, { color: theme.text }]}>
                Your name
              </Text>
              <Text style={[styles.nameCaption, { color: theme.textGray }]}>
                Shown on your profile, posts and chats.
              </Text>
            </View>
            <NameInput
              label="First name"
              onChangeText={setFirstName}
              onSubmitEditing={() => lastNameInput.current?.focus()}
              placeholder="Add your first name"
              returnKeyType="next"
              value={firstName}
            />
            <NameInput
              label="Last name"
              onChangeText={setLastName}
              onSubmitEditing={() => void saveName()}
              placeholder="Add your last name (optional)"
              returnKeyType="done"
              value={lastName}
            />
            {dirty && nameMissing ? (
              <Text style={[styles.nameError, { color: theme.error }]}>
                First name can't be empty.
              </Text>
            ) : null}
          </View>
        </View>

        <SettingsGroup title="Customize">
          <SettingsRow
            icon="color-palette-outline"
            label="Appearance"
            onPress={openAppearance}
            subtitle={
              <View style={styles.rowDetail}>
                <Text style={[styles.rowDesc, { color: theme.textGray }]}>
                  Avatar, banner, note, theme color and song.
                </Text>
                <View style={styles.chips}>
                  <Chip
                    label="Avatar"
                    tone={novelist.image ? "accent" : "neutral"}
                  />
                  <Chip label="Banner" tone={hasBanner ? "accent" : "neutral"} />
                  <Chip
                    label="Note"
                    tone={novelist.note?.text ? "accent" : "neutral"}
                  />
                  <Chip label="Theme" tone="accent" />
                </View>
              </View>
            }
          />
          <SettingsRow
            icon="information-circle-outline"
            label="About"
            onPress={() => router.push("/edit-profile/about")}
            subtitle={
              <View style={styles.rowDetail}>
                <Text style={[styles.rowDesc, { color: theme.textGray }]}>
                  Tell people about yourself.
                </Text>
                <View style={styles.chips}>
                  <Chip
                    label={hasBio ? "Bio added" : "No bio yet"}
                    tone={hasBio ? "accent" : "neutral"}
                  />
                </View>
              </View>
            }
          />
        </SettingsGroup>

        <SettingsGroup title="Account & security">
          <SettingsRow
            icon="person-circle-outline"
            label="Account"
            onPress={() => router.push("/edit-profile/account")}
            subtitle="Email, username, password and connections."
          />
          <SettingsRow
            icon="phone-portrait-outline"
            label="Devices"
            onPress={() => router.push("/edit-profile/devices")}
            subtitle="See where you are signed in."
          />
          <SettingsRow
            icon="notifications-outline"
            label="Notifications"
            onPress={() => router.push("/edit-profile/notifications")}
            subtitle="Which notifications may interrupt you."
          />
          <SettingsRow
            icon="lock-closed-outline"
            label="Profile privacy"
            onPress={() => router.push("/edit-profile/privacy")}
            subtitle="Who can see your bookshelf, characters and About; whether your activity is recorded."
          />
        </SettingsGroup>
      </ScrollView>

      {dirty ? (
        <View
          style={[
            styles.saveBar,
            {
              backgroundColor: theme.material.fill,
              borderTopColor: theme.material.edge,
              bottom: keyboardOffset,
              paddingBottom: keyboardOffset > 0 ? space.sm : insets.bottom + space.sm,
            },
          ]}
        >
          <Text
            numberOfLines={1}
            style={[styles.saveBarLabel, { color: theme.textGray }]}
          >
            Unsaved name changes
          </Text>
          <PillButton disabled={saving} label="Reset" onPress={resetName} />
          <PillButton
            busy={saving}
            disabled={!canSave}
            icon="checkmark"
            label="Save"
            onPress={() => void saveName()}
            tone="accent"
          />
        </View>
      ) : null}

      <ImageCropEditor
        aspect={1}
        autoFit={avatarFlow.autoFit}
        busy={avatarFlow.saving}
        circle
        initial={avatarFlow.initial}
        onClose={avatarFlow.close}
        onConfirm={(crop) => void avatarFlow.confirm(crop)}
        onLibrary={avatarPicker.openLibrary}
        onReplace={() => void avatarFlow.replace()}
        title="Adjust avatar"
        uploading={avatarFlow.uploading}
        uri={avatarFlow.uri}
        visible={avatarFlow.visible}
      />
      {avatarPicker.sheets}
    </View>
  );
}

const styles = StyleSheet.create({
  avatarBadge: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 3,
    bottom: 0,
    height: 30,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    width: 30,
  },
  avatarWrap: {
    borderRadius: radius.full,
    marginTop: -44,
    padding: space.xs,
  },
  banner: { aspectRatio: 5 / 2, overflow: "hidden", width: "100%" },
  body: { gap: space.lg, padding: space.m },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space.xs },
  coverBadge: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    borderRadius: radius.full,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: space.ms,
    paddingVertical: 5,
    position: "absolute",
    right: space.sm,
    top: space.sm,
  },
  coverBadgeLabel: {
    color: "#ffffff",
    fontSize: fontSize.caption,
    fontWeight: "700",
  },
  coverEmpty: {
    alignItems: "center",
    borderRadius: radius.md,
    borderStyle: "dashed",
    borderWidth: 1.5,
    flex: 1,
    gap: space.xxs,
    justifyContent: "center",
    margin: space.sm,
  },
  coverEmptyHint: { fontSize: fontSize.caption },
  coverEmptyTitle: { fontSize: fontSize.label, fontWeight: "700" },
  hero: {
    borderRadius: radius.md + 4,
    borderWidth: border.edge,
    overflow: "hidden",
    paddingBottom: space.md,
  },
  heroIdentity: { flex: 1, gap: space.xs, minWidth: 0, paddingBottom: space.xs },
  heroName: { fontSize: fontSize.title - 2, fontWeight: "700" },
  heroRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: space.m,
    paddingHorizontal: space.md,
  },
  nameCaption: { fontSize: fontSize.caption },
  nameError: { fontSize: fontSize.caption },
  nameField: { gap: 5 },
  nameFrame: {
    alignItems: "center",
    borderRadius: radius.field,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.m,
  },
  nameHeader: { gap: space.xxs },
  nameInput: {
    flex: 1,
    fontSize: fontSize.body,
    minHeight: 44,
    paddingVertical: space.sm,
  },
  nameLabel: { fontSize: fontSize.caption, fontWeight: "600" },
  nameSection: {
    gap: space.m,
    paddingHorizontal: space.md,
    paddingTop: space.md,
  },
  nameTitle: { fontSize: fontSize.body, fontWeight: "700" },
  root: { flex: 1 },
  rowDesc: { fontSize: fontSize.caption, lineHeight: 16 },
  rowDetail: { gap: 5 },
  saveBar: {
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    left: 0,
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    position: "absolute",
    right: 0,
  },
  saveBarLabel: { flex: 1, fontSize: fontSize.label },
});
