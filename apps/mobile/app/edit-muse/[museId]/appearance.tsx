import { Ionicons } from "@expo/vector-icons";
import { deleteMedia } from "@nw/api/endpoints/profile";
import { useApi } from "@nw/features";
import type { ImageFilter, Muse, NWImage } from "@nw/types";
import type { PrivacyLevel } from "@nw/types/prompt";
import { IMAGE_SIZES, wsrvImage } from "@nw/utils/image";
import { Image } from "@/components/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type ActionItem, ActionMenu } from "@/components/action-menu";
import { Avatar } from "@/components/avatar";
import { SongSheet } from "@/components/compose/song-sheet";
import { CroppedImage } from "@/components/cropped-image";
import { ColorSheet } from "@/components/edit-muse/color-sheet";
import {
  MuseGate,
  PRIVACY_CHOICES,
  useOwnedMuse,
} from "@/components/edit-muse/shared";
import { PRIVACY_ICON, PRIVACY_LABEL } from "@/components/feed/privacy";
import { isVideoUrl } from "@/components/muse/media-viewer";
import { FormSheet } from "@/components/muse/edit/form-sheet";
import { ImageCropEditor } from "@/components/muse/edit/image-crop-editor";
import { ProfileSongPill } from "@/components/profile-song";
import {
  PillButton,
  SettingsGroup,
  SettingsRow,
} from "@/components/settings";
import { Slider } from "@/components/slider";
import { useImageCropFlow } from "@/hooks/use-image-crop-flow";
import { useMuseMedia } from "@/hooks/use-muse";
import { useMuseEdit } from "@/hooks/use-muse-edit";
import { type MuseFormChanges, useMuseForm } from "@/hooks/use-muse-form";
import { asHex } from "@/lib/color";
import {
  alertMediaRejected,
  pickedOversizeMessage,
  pickImage,
  uploadFile,
} from "@/lib/media-upload";
import { museLook } from "@/lib/muse-appearance";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Web's `AppearanceSection`, laid out as settings.
 *
 * Every control saves when it is confirmed — a switch when flipped, a colour
 * when its tray's tick is tapped, a filter when the thumb is let go — rather
 * than behind a page-wide Save, which is how the profile's own appearance page
 * already behaves. The avatar and the card image go through the crop editor
 * and their own endpoints (`useMuseEdit`); everything else is the character
 * form (`useMuseForm`), written whole with the one change laid over it.
 *
 * Web opens a "Visual settings" dialog from its "custom card image and
 * wallpaper" checkbox. Here the switch reveals the same controls in place —
 * a preview of wallpaper, card and face together, where the wallpaper comes
 * from, and web's three filter sliders — because a dialog inside a settings
 * page is one more thing to dismiss on a phone.
 */

const NEUTRAL: ImageFilter = { blur: 0, brightness: 100, greyscale: 0 };

const ADVANCED = [
  { key: "nameColor", label: "Name text color" },
  { key: "pennedByColor", label: "Penned by color" },
  { key: "sideMenuBgColor", label: "Side menu background" },
  { key: "sideMenuTextColor", label: "Side menu text color" },
] as const;

type AdvancedKey = (typeof ADVANCED)[number]["key"];

type Sheet =
  | { kind: "accent" }
  | { kind: "advanced"; key: AdvancedKey; label: string }
  | { kind: "avatar-menu" }
  | { kind: "card-gallery" }
  | { kind: "card-menu" }
  | { kind: "privacy" }
  | { kind: "song" }
  | { kind: "wallpaper-gallery" }
  | { kind: "wallpaper-menu" }
  | null;

/** Web's `buildNWImage`: a wallpaper is never cropped, only filtered. */
const wallpaperImage = (src: string, filterValues: ImageFilter): NWImage => ({
  crop: { height: 500, src, width: 500, x: 0, y: 0 },
  filterValues,
  src,
});

export default function EditMuseAppearance() {
  const { owned, query } = useOwnedMuse();
  return (
    <MuseGate owned={owned} query={query}>
      {(muse) => <Appearance muse={muse} />}
    </MuseGate>
  );
}

const Appearance = ({ muse }: { muse: Muse }) => {
  const theme = useAppTheme();
  const api = useApi();
  const insets = useSafeAreaInsets();
  const id = muse.id ?? "";
  const edit = useMuseEdit(id);
  const form = useMuseForm(id);
  const look = useMemo(() => museLook(muse), [muse]);

  const [sheet, setSheet] = useState<Sheet>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const close = () => setSheet(null);

  const avatarFlow = useImageCropFlow({ onSave: edit.setAvatar, prefix: id });
  const cardFlow = useImageCropFlow({
    onSave: edit.setCardBackground,
    prefix: id,
  });

  // The filters as the thumbs have them; saved on release.
  const saved = muse.wallpaper?.filterValues ?? NEUTRAL;
  const [filters, setFilters] = useState<ImageFilter>(saved);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  useEffect(() => {
    setFilters(muse.wallpaper?.filterValues ?? NEUTRAL);
  }, [muse.wallpaper?.filterValues]);

  const pickingCard = sheet?.kind === "card-gallery";
  const media = useMuseMedia(
    id,
    pickingCard || sheet?.kind === "wallpaper-gallery",
  );
  const galleryImages = (media.data ?? []).filter((url) => !isVideoUrl(url));

  const wallpaperSrc = muse.wallpaper?.src || muse.image || "";
  const hasCustomWallpaper = Boolean(muse.wallpaper?.src);
  const hasCustomCard = Boolean(muse.cardBackground?.src);
  const isVerse = Boolean(muse.originalVerseId);

  const run = async (
    tag: string,
    task: () => Promise<boolean>,
    failure: string,
  ) => {
    setBusy(tag);
    const ok = await task();
    setBusy(null);
    if (!ok) Alert.alert("Not saved", failure);
    return ok;
  };

  const saveForm = (tag: string, changes: MuseFormChanges, failure: string) =>
    run(tag, () => form.save(changes), failure);

  const setWallpaper = (src: string) =>
    saveForm(
      "wallpaper",
      { useExtraImages: true, wallpaper: wallpaperImage(src, filtersRef.current) },
      "The wallpaper could not be saved.",
    );

  const commitFilters = (next: ImageFilter) => {
    if (!wallpaperSrc) return;
    void saveForm(
      "filters",
      { wallpaper: wallpaperImage(wallpaperSrc, next) },
      "The wallpaper filters could not be saved.",
    );
  };

  const uploadWallpaper = async () => {
    close();
    const file = await pickImage();
    if (!file) return;
    const tooLarge = await pickedOversizeMessage(api, file);
    if (tooLarge) {
      Alert.alert("Picture is too large", tooLarge);
      return;
    }
    setBusy("wallpaper");
    const { refused, rejected, url } = await uploadFile(api, file, id);
    setBusy(null);
    if (!url) {
      if (rejected) alertMediaRejected();
      else if (!refused) Alert.alert("Upload failed", "Please try again.");
      return;
    }
    const ok = await setWallpaper(url);
    if (!ok) void deleteMedia(api, url);
  };

  const changePrivacy = (privacy: PrivacyLevel) => {
    close();
    if (privacy === muse.privacy) return;
    void run(
      "privacy",
      () => edit.setPrivacy(privacy),
      "The privacy setting could not be saved.",
    );
  };

  const confirmRemove = (
    title: string,
    message: string,
    tag: string,
    task: () => Promise<boolean>,
  ) =>
    Alert.alert(title, message, [
      { style: "cancel", text: "Cancel" },
      {
        onPress: () => void run(tag, task, "Try again in a moment."),
        style: "destructive",
        text: "Remove",
      },
    ]);

  const avatarItems: ActionItem[] = [
    {
      icon: "move-outline",
      label: "Adjust photo",
      onPress: () => {
        close();
        avatarFlow.open(muse.avatar);
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
        confirmRemove(
          "Remove avatar?",
          "The card image will be used as fallback.",
          "avatar",
          edit.removeAvatar,
        );
      },
      variant: "danger",
    },
  ];

  const cardItems: ActionItem[] = [
    {
      icon: "move-outline",
      label: "Adjust card image",
      onPress: () => {
        close();
        cardFlow.open(muse.cardBackground);
      },
    },
    {
      icon: "grid-outline",
      label: "Choose from gallery",
      onPress: () => setSheet({ kind: "card-gallery" }),
    },
    {
      icon: "images-outline",
      label: "Choose a new image",
      onPress: () => {
        close();
        void cardFlow.replace();
      },
    },
    { separator: true },
    {
      icon: "trash-outline",
      label: "Remove card image",
      onPress: () => {
        close();
        confirmRemove(
          "Remove card image?",
          "The main character image will be used instead.",
          "card",
          edit.removeCardBackground,
        );
      },
      variant: "danger",
    },
  ];

  const wallpaperItems: ActionItem[] = [
    {
      icon: "grid-outline",
      label: "Choose from gallery",
      onPress: () => setSheet({ kind: "wallpaper-gallery" }),
    },
    {
      icon: "cloud-upload-outline",
      label: "Upload a picture",
      onPress: () => void uploadWallpaper(),
    },
    ...(hasCustomWallpaper
      ? ([
          { separator: true },
          {
            icon: "trash-outline",
            label: "Use the main image",
            onPress: () => {
              close();
              void saveForm(
                "wallpaper",
                { wallpaper: null },
                "The wallpaper could not be removed.",
              );
            },
            variant: "danger",
          },
        ] as ActionItem[])
      : []),
  ];

  const privacyItems: ActionItem[] = PRIVACY_CHOICES.map((option) => ({
    icon: PRIVACY_ICON[option],
    label: PRIVACY_LABEL[option],
    onPress: () => changePrivacy(option),
    variant: option === muse.privacy ? "positive" : "default",
  }));

  const dim = Math.min(Math.max(1 - filters.brightness / 100, 0), 0.9);
  const glow = Math.min(Math.max((filters.brightness - 100) / 100, 0), 1) * 0.35;

  const switchColors = {
    thumbColor: "#ffffff",
    trackColor: { false: theme.material.fillPressed, true: theme.accent.solid },
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingBottom: insets.bottom + space.xl },
        ]}
      >
        <SettingsGroup
          footer={
            isVerse
              ? "A verse keeps the privacy of the character it belongs to."
              : undefined
          }
          title="Visibility"
        >
          <SettingsRow
            busy={busy === "privacy"}
            disabled={isVerse}
            icon={PRIVACY_ICON[muse.privacy]}
            label="Who can see this character"
            onPress={() => setSheet({ kind: "privacy" })}
            subtitle={PRIVACY_LABEL[muse.privacy]}
          />
        </SettingsGroup>

        <SettingsGroup title="Portrait">
          <SettingsRow
            accessory={
              <Avatar
                image={muse.avatar}
                name={muse.firstName}
                size={40}
                uri={muse.avatar?.src ?? muse.image}
              />
            }
            busy={busy === "avatar" || avatarFlow.saving}
            label="Avatar"
            onPress={() =>
              muse.avatar?.src
                ? setSheet({ kind: "avatar-menu" })
                : avatarFlow.open(null)
            }
            subtitle={
              muse.avatar?.src
                ? "Tap to adjust, replace or remove."
                : "Add a face for posts, chats and the profile."
            }
          />
        </SettingsGroup>

        <SettingsGroup
          footer="Your own card image and a wallpaper behind the profile. Off, the main image is used for both."
          title="Card & wallpaper"
        >
          <SettingsRow
            accessory={
              <Switch
                {...switchColors}
                disabled={busy === "extra"}
                onValueChange={(on) =>
                  void saveForm(
                    "extra",
                    { useExtraImages: on },
                    "The setting could not be saved.",
                  )
                }
                value={muse.useExtraImages}
              />
            }
            icon="albums-outline"
            label="Custom card and wallpaper"
          />

          {muse.useExtraImages ? (
            <View style={styles.visual}>
              {/* Web's unified preview: wallpaper, card and face together. */}
              <View style={styles.preview}>
                {wallpaperSrc ? (
                  <Image
                    blurRadius={Math.min(filters.blur * 2, 40)}
                    cachePolicy="memory-disk"
                    contentFit="cover"
                    source={{
                      uri: wsrvImage(wallpaperSrc, {
                        fit: "inside",
                        h: 600,
                        q: 60,
                        w: 600,
                      }),
                    }}
                    style={StyleSheet.absoluteFill}
                  />
                ) : null}
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: `rgba(0,0,0,${dim.toFixed(2)})` },
                  ]}
                />
                {glow > 0 ? (
                  <View
                    style={[
                      StyleSheet.absoluteFill,
                      { backgroundColor: `rgba(255,255,255,${glow.toFixed(2)})` },
                    ]}
                  />
                ) : null}
                <View style={styles.previewRow}>
                  <Pressable
                    accessibilityLabel={
                      hasCustomCard ? "Card image options" : "Add card image"
                    }
                    accessibilityRole="button"
                    onPress={() =>
                      hasCustomCard
                        ? setSheet({ kind: "card-menu" })
                        : cardFlow.open(null)
                    }
                    style={styles.previewCard}
                  >
                    {look.card.uri ? (
                      look.card.crop ? (
                        <CroppedImage
                          crop={look.card.crop}
                          style={StyleSheet.absoluteFill}
                          uri={look.card.uri}
                        />
                      ) : (
                        <Image
                          contentFit="cover"
                          source={{ uri: look.card.uri }}
                          style={StyleSheet.absoluteFill}
                        />
                      )
                    ) : null}
                    <View style={styles.previewCardBadge}>
                      {busy === "card" || cardFlow.saving ? (
                        <ActivityIndicator color="#ffffff" size="small" />
                      ) : (
                        <Ionicons color="#ffffff" name="camera" size={13} />
                      )}
                    </View>
                  </Pressable>
                  <View style={styles.previewPanel}>
                    <Avatar
                      image={muse.avatar}
                      name={muse.firstName}
                      size={44}
                      uri={muse.avatar?.src ?? muse.image}
                    />
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.previewName,
                        { color: look.nameColor ?? "#ffffff" },
                      ]}
                    >
                      {muse.firstName}
                    </Text>
                    <View style={styles.previewBars}>
                      {[0, 1, 2, 3].map((bar) => (
                        <View
                          key={bar}
                          style={[
                            styles.previewBar,
                            look.accent
                              ? { backgroundColor: `${look.accent}55` }
                              : null,
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.inlineActions}>
                <PillButton
                  busy={busy === "card" || cardFlow.saving}
                  icon="crop"
                  label={hasCustomCard ? "Card image" : "Add card image"}
                  onPress={() =>
                    hasCustomCard
                      ? setSheet({ kind: "card-menu" })
                      : cardFlow.open(null)
                  }
                />
                <PillButton
                  busy={busy === "wallpaper"}
                  icon="image-outline"
                  label={hasCustomWallpaper ? "Wallpaper" : "Set wallpaper"}
                  onPress={() => setSheet({ kind: "wallpaper-menu" })}
                />
              </View>

              <View style={styles.sliders}>
                <Slider
                  format={(value) => `${value}%`}
                  label="Greyscale"
                  max={100}
                  min={0}
                  onChange={(greyscale) =>
                    setFilters((current) => ({ ...current, greyscale }))
                  }
                  onComplete={(greyscale) =>
                    commitFilters({ ...filtersRef.current, greyscale })
                  }
                  value={filters.greyscale}
                />
                <Slider
                  format={(value) => `${value}%`}
                  label="Brightness"
                  max={200}
                  min={0}
                  onChange={(brightness) =>
                    setFilters((current) => ({ ...current, brightness }))
                  }
                  onComplete={(brightness) =>
                    commitFilters({ ...filtersRef.current, brightness })
                  }
                  value={filters.brightness}
                />
                <Slider
                  format={(value) => `${value}px`}
                  label="Blur"
                  max={20}
                  min={0}
                  onChange={(blur) =>
                    setFilters((current) => ({ ...current, blur }))
                  }
                  onComplete={(blur) =>
                    commitFilters({ ...filtersRef.current, blur })
                  }
                  value={filters.blur}
                />
                <Text style={[styles.hint, { color: theme.textGray }]}>
                  {busy === "filters"
                    ? "Saving…"
                    : "Greyscale shows on the web profile; the app draws the wallpaper in color."}
                </Text>
              </View>
            </View>
          ) : null}
        </SettingsGroup>

        <SettingsGroup
          footer="Tints the character's profile, card and panels."
          title="Profile color"
        >
          <SettingsRow
            accessory={
              <Switch
                {...switchColors}
                disabled={busy === "accent"}
                onValueChange={(on) => {
                  if (on && !asHex(muse.accent)) {
                    setSheet({ kind: "accent" });
                    return;
                  }
                  void saveForm(
                    "accent",
                    { useAccent: on },
                    "The setting could not be saved.",
                  );
                }}
                value={muse.useAccent}
              />
            }
            icon="color-fill-outline"
            label="Custom profile color"
          />
          {muse.useAccent ? (
            <SettingsRow
              accessory={
                <View
                  style={[
                    styles.swatch,
                    {
                      backgroundColor: asHex(muse.accent) ?? theme.accent.solid,
                    },
                  ]}
                />
              }
              busy={busy === "accent"}
              label="Color"
              onPress={() => setSheet({ kind: "accent" })}
              subtitle={asHex(muse.accent) ?? "Pick a color"}
            />
          ) : null}
        </SettingsGroup>

        <SettingsGroup
          footer="Fine-tune the profile. Anything left on default keeps the standard look."
          title="Advanced"
        >
          {ADVANCED.map(({ key, label }) => {
            const value = asHex(muse[key]);
            return (
              <SettingsRow
                accessory={
                  value ? (
                    <View style={[styles.swatch, { backgroundColor: value }]} />
                  ) : (
                    <View
                      style={[
                        styles.swatch,
                        styles.unset,
                        { borderColor: theme.textGray },
                      ]}
                    >
                      <Ionicons
                        color={theme.textGray}
                        name="remove"
                        size={14}
                      />
                    </View>
                  )
                }
                busy={busy === key}
                key={key}
                label={label}
                onPress={() => setSheet({ key, kind: "advanced", label })}
                subtitle={value ?? "Default"}
              />
            );
          })}
          <SettingsRow
            accessory={
              <Switch
                {...switchColors}
                disabled={busy === "hideExpanded"}
                onValueChange={(on) =>
                  void saveForm(
                    "hideExpanded",
                    { hideExpandedBackground: on },
                    "The setting could not be saved.",
                  )
                }
                value={muse.hideExpandedBackground ?? false}
              />
            }
            label="No panel background"
            subtitle="Remove the expanded container's background and border."
          />
          <SettingsRow
            accessory={
              <Switch
                {...switchColors}
                disabled={busy === "hideMenu"}
                onValueChange={(on) =>
                  void saveForm(
                    "hideMenu",
                    { hideSideMenuBackground: on },
                    "The setting could not be saved.",
                  )
                }
                value={muse.hideSideMenuBackground ?? false}
              />
            }
            label="No side menu background"
            subtitle="Remove the side menu's background, border and shadow."
          />
        </SettingsGroup>

        <SettingsGroup title="Character song">
          {muse.featuredSong ? (
            <View style={styles.songBlock}>
              <ProfileSongPill accent={look.accent} song={muse.featuredSong} />
            </View>
          ) : (
            <SettingsRow
              icon="musical-notes-outline"
              label="No song yet"
              subtitle="Pick a track that sounds like this character."
            />
          )}
          <View style={styles.inlineActionsPadded}>
            <PillButton
              icon={muse.featuredSong ? "swap-horizontal" : "add"}
              label={muse.featuredSong ? "Change song" : "Add a song"}
              onPress={() => setSheet({ kind: "song" })}
              tone="accent"
            />
            {muse.featuredSong ? (
              <PillButton
                busy={busy === "song"}
                icon="trash-outline"
                label="Remove"
                onPress={() =>
                  void run(
                    "song",
                    edit.removeSong,
                    "The song could not be removed.",
                  )
                }
                tone="danger"
              />
            ) : null}
          </View>
        </SettingsGroup>
      </ScrollView>

      <ActionMenu
        items={privacyItems}
        onClose={close}
        title="Who can see this character"
        visible={sheet?.kind === "privacy"}
      />
      <ActionMenu
        items={avatarItems}
        onClose={close}
        title="Avatar"
        visible={sheet?.kind === "avatar-menu"}
      />
      <ActionMenu
        items={cardItems}
        onClose={close}
        title="Card image"
        visible={sheet?.kind === "card-menu"}
      />
      <ActionMenu
        items={wallpaperItems}
        onClose={close}
        title="Wallpaper"
        visible={sheet?.kind === "wallpaper-menu"}
      />

      <FormSheet
        fill
        maxHeightRatio={0.8}
        onClose={close}
        subtitle="Pictures already in this character's gallery."
        title={pickingCard ? "Choose a card image" : "Choose a wallpaper"}
        visible={pickingCard || sheet?.kind === "wallpaper-gallery"}
      >
        {media.isPending ? (
          <ActivityIndicator color={theme.primary} style={styles.spinner} />
        ) : galleryImages.length === 0 ? (
          <View style={styles.emptyGallery}>
            <Text style={[styles.hint, { color: theme.textGray }]}>
              No gallery pictures yet.
            </Text>
            <PillButton
              icon="cloud-upload-outline"
              label="Upload a picture"
              onPress={() => void uploadWallpaper()}
              tone="accent"
            />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.grid}>
            {galleryImages.map((url) => {
              const selected =
                (pickingCard ? muse.cardBackground?.src : muse.wallpaper?.src) ===
                url;
              return (
                <Pressable
                  accessibilityLabel={
                    pickingCard ? "Use as card image" : "Use as wallpaper"
                  }
                  accessibilityRole="imagebutton"
                  accessibilityState={{ selected }}
                  key={url}
                  onPress={() => {
                    close();
                    if (pickingCard) cardFlow.openUrl(url);
                    else void setWallpaper(url);
                  }}
                  style={[
                    styles.tile,
                    {
                      borderColor: selected ? theme.accent.solid : "transparent",
                    },
                  ]}
                >
                  <Image
                    cachePolicy="memory-disk"
                    contentFit="cover"
                    source={{ uri: wsrvImage(url, IMAGE_SIZES.COVER_MEDIUM) }}
                    style={styles.fill}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </FormSheet>

      <ColorSheet
        busy={busy === "accent"}
        onClose={close}
        onConfirm={(hex) => {
          close();
          void saveForm(
            "accent",
            { accent: hex, useAccent: true },
            "The color could not be saved.",
          );
        }}
        title="Profile color"
        value={muse.accent}
        visible={sheet?.kind === "accent"}
      />
      <ColorSheet
        busy={sheet?.kind === "advanced" && busy === sheet.key}
        fallback="#ffffff"
        onClose={close}
        onConfirm={(hex) => {
          if (sheet?.kind !== "advanced") return;
          const { key } = sheet;
          close();
          void saveForm(key, { [key]: hex }, "The color could not be saved.");
        }}
        onReset={() => {
          if (sheet?.kind !== "advanced") return;
          const { key } = sheet;
          close();
          void saveForm(key, { [key]: null }, "The color could not be reset.");
        }}
        title={sheet?.kind === "advanced" ? sheet.label : "Color"}
        value={sheet?.kind === "advanced" ? muse[sheet.key] : null}
        visible={sheet?.kind === "advanced"}
      />

      <SongSheet
        onClose={close}
        onSelect={(picked) => {
          close();
          void run(
            "song",
            () => edit.setSong(picked),
            "The song could not be saved.",
          );
        }}
        title={muse.featuredSong ? "Change song" : "Add a character song"}
        visible={sheet?.kind === "song"}
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
      <ImageCropEditor
        aspect={9 / 16}
        autoFit={cardFlow.autoFit}
        busy={cardFlow.saving}
        initial={cardFlow.initial}
        onClose={cardFlow.close}
        onConfirm={(crop) => void cardFlow.confirm(crop)}
        onReplace={() => void cardFlow.replace()}
        title="Adjust card image"
        uploading={cardFlow.uploading}
        uri={cardFlow.uri}
        visible={cardFlow.visible}
      />
    </>
  );
};

const styles = StyleSheet.create({
  body: { gap: space.lg, padding: space.m },
  emptyGallery: { alignItems: "center", gap: space.md, paddingTop: space.lg },
  fill: { height: "100%", width: "100%" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    paddingBottom: space.lg,
  },
  hint: { fontSize: fontSize.caption, lineHeight: 16 },
  inlineActions: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  inlineActionsPadded: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    padding: space.md,
  },
  preview: {
    aspectRatio: 16 / 10,
    backgroundColor: "#111318",
    borderRadius: radius.md,
    overflow: "hidden",
    width: "100%",
  },
  previewBar: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 3,
    height: 6,
    width: "100%",
  },
  previewBars: { alignSelf: "stretch", gap: 5 },
  previewCard: {
    aspectRatio: 9 / 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: radius.sm + 2,
    borderWidth: border.edge,
    height: "100%",
    overflow: "hidden",
  },
  previewCardBadge: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: radius.full,
    bottom: 6,
    height: 26,
    justifyContent: "center",
    position: "absolute",
    right: 6,
    width: 26,
  },
  previewName: { fontSize: fontSize.label, fontWeight: "700" },
  previewPanel: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: radius.sm + 2,
    flex: 1,
    gap: space.sm,
    justifyContent: "center",
    padding: space.sm,
  },
  previewRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    gap: space.ms,
    padding: space.m,
  },
  sliders: { gap: space.xs },
  songBlock: { paddingHorizontal: space.md, paddingTop: space.md },
  spinner: { paddingVertical: space.lg },
  swatch: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: radius.full,
    borderWidth: 1,
    height: 26,
    justifyContent: "center",
    width: 26,
  },
  tile: {
    aspectRatio: 1,
    borderRadius: radius.sm + 2,
    borderWidth: 3,
    overflow: "hidden",
    width: "31%",
  },
  unset: { borderStyle: "dashed" },
  visual: {
    gap: space.md,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
  },
});
