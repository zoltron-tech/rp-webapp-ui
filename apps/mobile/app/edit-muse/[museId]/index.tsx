import { Ionicons } from "@expo/vector-icons";
import type { Muse } from "@nw/types";
import { Image } from "@/components/image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text, type TextInput } from "@/components/text";
import { type ActionItem, ActionMenu } from "@/components/action-menu";
import { Avatar } from "@/components/avatar";
import {
  MuseGate,
  NameInput,
  SaveBar,
  useBottomPadding,
  useNameDraft,
  useOwnedMuse,
} from "@/components/edit-muse/shared";
import { PRIVACY_ICON, PRIVACY_LABEL } from "@/components/feed/privacy";
import { ImageCropEditor } from "@/components/muse/edit/image-crop-editor";
import {
  Chip,
  Notice,
  SettingsGroup,
  SettingsRow,
} from "@/components/settings";
import { useImageCropFlow } from "@/hooks/use-image-crop-flow";
import {
  useMuseAboutSections,
  useMuseConnections,
  useMuseMedia,
} from "@/hooks/use-muse";
import { useMuseEdit } from "@/hooks/use-muse-edit";
import { useMuseForm } from "@/hooks/use-muse-form";
import { asColor } from "@/lib/color";
import { museLook } from "@/lib/muse-appearance";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Web's `LandingSection`: the character you are editing, then the sections
 * to open.
 *
 * The same page as the profile settings' landing, drawn from the character:
 * its wallpaper behind the header (tap it for Appearance), its face with a
 * camera badge, its name as two framed fields with web's explicit save, and a
 * row per section, each saying at a glance what is already filled in.
 */

const GALLERY_MAX = 20;

export default function EditMuseHome() {
  const { owned, query } = useOwnedMuse();
  return (
    <MuseGate owned={owned} query={query}>
      {(muse) => <Landing muse={muse} />}
    </MuseGate>
  );
}

const Landing = ({ muse }: { muse: Muse }) => {
  const theme = useAppTheme();
  const router = useRouter();
  const { created } = useLocalSearchParams<{ created?: string }>();
  const id = muse.id ?? "";
  const edit = useMuseEdit(id);
  const form = useMuseForm(id);
  const name = useNameDraft(muse, form);
  const bottom = useBottomPadding(name.dirty);
  const lastNameInput = useRef<TextInput>(null);
  const look = useMemo(() => museLook(muse), [muse]);
  const [avatarMenu, setAvatarMenu] = useState(false);

  const avatarFlow = useImageCropFlow({ onSave: edit.setAvatar, prefix: id });
  const sections = useMuseAboutSections(id, true);
  const media = useMuseMedia(id, true);
  const connections = useMuseConnections(id, true);

  const go = (section: string) =>
    router.push({
      params: { museId: id },
      pathname: `/edit-muse/[museId]/${section}`,
    });

  const hasAvatar = Boolean(muse.avatar?.src);
  const hasFandom = Boolean(
    muse.fandom?.id && muse.fandom.id !== "FANDOMLESS",
  );
  const fandomColor = asColor(muse.fandom?.color) ?? theme.material.edge;
  const nicknameCount = muse.nicknames?.length ?? 0;
  const attributeCount = Object.keys(muse.extraAttributes ?? {}).length;
  const sectionCount = sections.data?.length;
  const mediaCount = media.data?.length;
  const pending =
    connections.data?.filter(
      (c) => c.status === "PENDING" && c.viewerApproved === false,
    ).length ?? 0;
  const displayName =
    [name.firstName.trim(), name.lastName.trim()].filter(Boolean).join(" ") ||
    "Your character";

  const removeAvatar = () =>
    Alert.alert(
      "Remove avatar?",
      "Remove this character's avatar photo? The card image will be used as fallback.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            const ok = await edit.removeAvatar();
            if (!ok) Alert.alert("Not removed", "Try again in a moment.");
          },
          style: "destructive",
          text: "Remove",
        },
      ],
    );

  const avatarItems: ActionItem[] = [
    {
      icon: "move-outline",
      label: "Adjust photo",
      onPress: () => {
        setAvatarMenu(false);
        avatarFlow.open(muse.avatar);
      },
    },
    {
      icon: "images-outline",
      label: "Choose a new photo",
      onPress: () => {
        setAvatarMenu(false);
        void avatarFlow.replace();
      },
    },
    { separator: true },
    {
      icon: "trash-outline",
      label: "Remove photo",
      onPress: () => {
        setAvatarMenu(false);
        removeAvatar();
      },
      variant: "danger",
    },
  ];

  const dim = Math.min(
    Math.max(1 - look.wallpaper.filters.brightness / 100, 0),
    0.9,
  );

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        {created ? (
          <Notice tone="success">
            {`${muse.firstName} is created. Give them a look, some details and a story next.`}
          </Notice>
        ) : null}

        <View
          style={[
            styles.hero,
            {
              backgroundColor: theme.material.fill,
              borderColor: theme.material.edge,
            },
          ]}
        >
          {/* The wallpaper, as the profile draws it. It opens Appearance. */}
          <Pressable
            accessibilityHint="Opens Appearance"
            accessibilityLabel="Edit wallpaper and card"
            accessibilityRole="button"
            onPress={() => go("appearance")}
            style={({ pressed }) => [
              styles.banner,
              {
                backgroundColor: look.accent ?? theme.accent.tint,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            {look.wallpaper.uri ? (
              <Image
                blurRadius={Math.min(look.wallpaper.filters.blur, 40)}
                cachePolicy="memory-disk"
                contentFit="cover"
                recyclingKey={look.wallpaper.uri}
                source={{ uri: look.wallpaper.uri }}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: `rgba(0,0,0,${dim.toFixed(2)})` },
              ]}
            />
            <View style={styles.bannerBadge}>
              <Ionicons color="#ffffff" name="color-palette" size={14} />
              <Text style={styles.bannerBadgeLabel}>Edit look</Text>
            </View>
          </Pressable>

          <View style={styles.heroRow}>
            <Pressable
              accessibilityLabel={hasAvatar ? "Change avatar" : "Add avatar"}
              accessibilityRole="button"
              onPress={() =>
                hasAvatar ? setAvatarMenu(true) : avatarFlow.open(null)
              }
              style={[
                styles.avatarWrap,
                { backgroundColor: theme.material.fill },
              ]}
            >
              <Avatar
                image={muse.avatar}
                name={muse.firstName}
                size={84}
                uri={muse.avatar?.src ?? muse.image}
              />
              <View
                style={[
                  styles.avatarBadge,
                  {
                    backgroundColor: look.accent ?? theme.accent.solid,
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
                <View style={[styles.fandom, { backgroundColor: fandomColor }]}>
                  <Text numberOfLines={1} style={styles.fandomLabel}>
                    {hasFandom ? muse.fandom.name : "Original character"}
                  </Text>
                </View>
                <Chip
                  icon={PRIVACY_ICON[muse.privacy]}
                  label={PRIVACY_LABEL[muse.privacy]}
                />
                {muse.originalVerseId ? (
                  <Chip
                    icon="git-branch-outline"
                    label={`Verse ${muse.verseNumber ?? ""}`.trim()}
                    tone="accent"
                  />
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.nameSection}>
            <View style={styles.nameHeader}>
              <Text style={[styles.nameTitle, { color: theme.text }]}>
                Character name
              </Text>
              <Text style={[styles.nameCaption, { color: theme.textGray }]}>
                Shown on the card, the profile and every post.
              </Text>
            </View>
            <NameInput
              label="First name"
              onChangeText={name.setFirstName}
              onSubmitEditing={() => lastNameInput.current?.focus()}
              placeholder="First name"
              returnKeyType="next"
              value={name.firstName}
            />
            <NameInput
              inputRef={lastNameInput}
              label="Last name"
              onChangeText={name.setLastName}
              onSubmitEditing={() => void name.save()}
              placeholder="Last name (optional)"
              returnKeyType="done"
              value={name.lastName}
            />
            {name.dirty && name.missing ? (
              <Text style={[styles.nameError, { color: theme.error }]}>
                First name is required.
              </Text>
            ) : null}
          </View>
        </View>

        <SettingsGroup title="Customize">
          <SettingsRow
            icon="color-palette-outline"
            label="Appearance"
            onPress={() => go("appearance")}
            subtitle={
              <RowDetail text="Avatar, card image, wallpaper, colors and song.">
                <Chip
                  label="Avatar"
                  tone={hasAvatar || muse.image ? "accent" : "neutral"}
                />
                <Chip
                  label="Wallpaper"
                  tone={
                    muse.useExtraImages && muse.wallpaper?.src
                      ? "accent"
                      : "neutral"
                  }
                />
                <Chip
                  label="Card"
                  tone={
                    muse.useExtraImages && muse.cardBackground?.src
                      ? "accent"
                      : "neutral"
                  }
                />
                {look.accent ? (
                  <View
                    style={[styles.swatch, { backgroundColor: look.accent }]}
                  />
                ) : null}
              </RowDetail>
            }
          />
          <SettingsRow
            icon="information-circle-outline"
            label="Information"
            onPress={() => go("information")}
            subtitle={
              <RowDetail text="Name, fandom, nicknames and extra attributes.">
                <Chip
                  label={
                    nicknameCount === 1
                      ? "1 nickname"
                      : `${nicknameCount} nicknames`
                  }
                  tone={nicknameCount > 0 ? "accent" : "neutral"}
                />
                <Chip
                  label={
                    attributeCount === 1
                      ? "1 attribute"
                      : `${attributeCount} attributes`
                  }
                  tone={attributeCount > 0 ? "accent" : "neutral"}
                />
              </RowDetail>
            }
          />
          <SettingsRow
            icon="book-outline"
            label="Story"
            onPress={() => go("story")}
            subtitle={
              <RowDetail text="Favorite quote, backstory and lore.">
                <Chip label="Quote" tone={muse.note ? "accent" : "neutral"} />
                {sectionCount !== undefined ? (
                  <Chip
                    label={
                      sectionCount === 1
                        ? "1 section"
                        : `${sectionCount} sections`
                    }
                    tone={sectionCount > 0 ? "accent" : "neutral"}
                  />
                ) : null}
              </RowDetail>
            }
          />
        </SettingsGroup>

        <SettingsGroup title="Media & bonds">
          <SettingsRow
            icon="images-outline"
            label="Gallery"
            onPress={() => go("gallery")}
            subtitle={
              <RowDetail text="Images and videos for this character.">
                {mediaCount !== undefined ? (
                  <Chip
                    label={`${mediaCount} / ${GALLERY_MAX}`}
                    tone={mediaCount > 0 ? "accent" : "neutral"}
                  />
                ) : null}
              </RowDetail>
            }
          />
          <SettingsRow
            badge={pending || undefined}
            icon="people-outline"
            label="Connections"
            onPress={() => go("connections")}
            subtitle={
              <RowDetail text="Relationships and bonds with other characters.">
                {connections.data ? (
                  <Chip
                    label={
                      connections.data.length === 1
                        ? "1 bond"
                        : `${connections.data.length} bonds`
                    }
                    tone={connections.data.length > 0 ? "accent" : "neutral"}
                  />
                ) : null}
              </RowDetail>
            }
          />
          <SettingsRow
            accessory={<Chip label="Coming soon" />}
            disabled
            icon="bulb-outline"
            label="Headcanons"
            onPress={() => undefined}
            subtitle="Personal interpretations and lore outside the source."
            tone="neutral"
          />
        </SettingsGroup>
      </ScrollView>

      <SaveBar
        busy={name.saving}
        canSave={name.canSave}
        label="Unsaved name changes"
        onReset={name.reset}
        onSave={() => void name.save()}
        visible={name.dirty}
      />

      <ActionMenu
        items={avatarItems}
        onClose={() => setAvatarMenu(false)}
        title="Avatar"
        visible={avatarMenu}
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
    </View>
  );
};

const RowDetail = ({
  children,
  text,
}: {
  children?: React.ReactNode;
  text: string;
}) => {
  const theme = useAppTheme();
  return (
    <View style={styles.rowDetail}>
      <Text style={[styles.rowDesc, { color: theme.textGray }]}>{text}</Text>
      <View style={styles.chips}>{children}</View>
    </View>
  );
};

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
  avatarWrap: { borderRadius: radius.full, marginTop: -44, padding: space.xs },
  banner: { aspectRatio: 5 / 2, overflow: "hidden", width: "100%" },
  bannerBadge: {
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
  bannerBadgeLabel: {
    color: "#ffffff",
    fontSize: fontSize.caption,
    fontWeight: "700",
  },
  body: { gap: space.lg, padding: space.m },
  chips: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.xs,
  },
  fandom: {
    borderRadius: radius.full,
    maxWidth: 200,
    paddingHorizontal: space.sm,
    paddingVertical: space.xxs,
  },
  fandomLabel: {
    color: "#ffffff",
    fontSize: fontSize.meta,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
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
  nameHeader: { gap: space.xxs },
  nameSection: {
    gap: space.m,
    paddingHorizontal: space.md,
    paddingTop: space.md,
  },
  nameTitle: { fontSize: fontSize.body, fontWeight: "700" },
  root: { flex: 1 },
  rowDesc: { fontSize: fontSize.caption, lineHeight: 16 },
  rowDetail: { gap: 5 },
  swatch: {
    borderColor: "rgba(255,255,255,0.6)",
    borderRadius: radius.full,
    borderWidth: 1,
    height: 16,
    width: 16,
  },
});
