import { Ionicons } from "@expo/vector-icons";
import { deleteMedia } from "@nw/api/endpoints/profile";
import { useApi, useSession } from "@nw/features";
import type { Fandom, NWImage } from "@nw/types";
import type { PrivacyLevel } from "@nw/types/prompt";
import { toCropFilter } from "@nw/utils";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text, type TextInput } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { NameInput, PRIVACY_CHOICES } from "@/components/edit-muse/shared";
import { PRIVACY_ICON, PRIVACY_LABEL } from "@/components/feed/privacy";
import { FandomSheet } from "@/components/muse/edit/fandom-sheet";
import { ImageCropEditor } from "@/components/muse/edit/image-crop-editor";
import {
  Notice,
  SettingsGroup,
  SettingsRow,
} from "@/components/settings";
import { useKeyboardOffset } from "@/hooks/use-keyboard-height";
import { useImageCropFlow } from "@/hooks/use-image-crop-flow";
import { useMuse } from "@/hooks/use-muse";
import type { CropState } from "@/hooks/use-muse-edit";
import { FANDOMLESS, useCreateMuse } from "@/hooks/use-muse-form";
import { asColor } from "@/lib/color";
import { museName } from "@/lib/muse-appearance";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Web's `CreateInitialSection`: the first step of a new character, or of a
 * new verse of one (`?originalVerseId=`).
 *
 * The same four things — a face, a name, a fandom, who can see it — and the
 * same rules: a verse starts from its character's name and fandom and keeps
 * its privacy, and nobody past their plan's character limit (verses count)
 * gets to fill the form in only to be refused.
 *
 * The avatar can be cropped before the character exists; it is uploaded at
 * once and attached after the create returns an id, as web does. Leaving
 * without creating deletes that upload.
 *
 * Web follows the create with a three-step wizard. Here the create lands on
 * the character's settings, where the same three sections sit a tap away
 * with what is filled in marked — a wizard on a phone is three screens of
 * Skip.
 */


export default function NewMuseScreen() {
  const theme = useAppTheme();
  const api = useApi();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const keyboardOffset = useKeyboardOffset(insets.bottom);
  const session = useSession();
  const create = useCreateMuse();
  const { onboarding, originalVerseId } = useLocalSearchParams<{
    /** Opened from the set-up flow: a created character returns to it. */
    onboarding?: string;
    originalVerseId?: string;
  }>();
  const parentQuery = useMuse(originalVerseId || undefined);
  const parent = originalVerseId ? (parentQuery.data ?? null) : null;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fandom, setFandom] = useState<Fandom>(FANDOMLESS);
  const [privacy, setPrivacy] = useState<PrivacyLevel>("PUBLIC");
  const [avatar, setAvatar] = useState<{ crop: CropState; src: string } | null>(
    null,
  );
  const [fandomOpen, setFandomOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const lastNameInput = useRef<TextInput>(null);

  // A verse starts from its character, once that has loaded.
  const seeded = useRef(false);
  useEffect(() => {
    if (!parent || seeded.current) return;
    seeded.current = true;
    setFirstName(parent.firstName ?? "");
    setLastName(parent.lastName ?? "");
    if (parent.fandom?.id) setFandom(parent.fandom);
    setPrivacy(parent.privacy === "CUSTOM" ? "PUBLIC" : parent.privacy);
  }, [parent]);

  // An avatar uploaded for a character that was never created is an orphan.
  const uploaded = useRef<string | null>(null);
  const created = useRef(false);
  useEffect(
    () => () => {
      if (!created.current && uploaded.current) {
        void deleteMedia(api, uploaded.current);
      }
    },
    [api],
  );

  const avatarFlow = useImageCropFlow({
    onSave: async (src, crop) => {
      if (uploaded.current && uploaded.current !== src) {
        void deleteMedia(api, uploaded.current);
      }
      uploaded.current = src;
      setAvatar({ crop, src });
      return true;
    },
    prefix: null,
  });

  const novelist = session.novelist;
  const limit = novelist?.tier?.museLimit ?? 0;
  const used = novelist?.museCount ?? 0;
  const atLimit = Boolean(novelist) && used >= limit;
  const isVerse = Boolean(originalVerseId);
  const canCreate =
    !atLimit &&
    firstName.trim().length > 0 &&
    !creating &&
    (!isVerse || Boolean(parent));

  const submit = async () => {
    if (atLimit) {
      Alert.alert(
        "Character limit reached",
        `You've reached your plan's limit of ${limit} characters (alternate verses count toward this too).`,
      );
      return;
    }
    if (!canCreate) return;
    setCreating(true);
    const id = await create({
      avatar,
      fandom,
      firstName,
      lastName,
      originalVerseId: originalVerseId || null,
      privacy: isVerse && parent ? parent.privacy : privacy,
    });
    setCreating(false);
    if (!id) {
      Alert.alert("Not created", "Something went wrong. Please try again.");
      return;
    }
    created.current = true;
    if (onboarding) {
      // The flow's next step, not the character's settings: those are a
      // tap away from the profile once the person is in the app.
      router.replace("/onboarding/discord");
      return;
    }
    router.replace({
      params: { created: "1", museId: id },
      pathname: "/edit-muse/[museId]",
    });
  };

  const avatarImage: NWImage | null = avatar
    ? {
        crop: toCropFilter(
          avatar.src,
          avatar.crop.x,
          avatar.crop.y,
          avatar.crop.scale,
        ),
        filterValues: { blur: 0, brightness: 100, greyscale: 0 },
        src: avatar.src,
      }
    : null;

  const hasFandom = fandom.id !== "FANDOMLESS";
  const fandomColor = asColor(fandom.color) ?? theme.material.edge;
  const shownPrivacy = isVerse && parent ? parent.privacy : privacy;

  return (
    <View style={styles.root}>
      {/* The stack's default title is "New character"; a verse says so. */}
      <Stack.Screen
        options={{ title: isVerse ? "New verse" : "New character" }}
      />
      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingBottom: insets.bottom + keyboardOffset + 96 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {atLimit ? (
          <Notice tone="error">
            {`You've reached your plan's limit of ${limit} characters (alternate verses count toward this too). Upgrade your tier or remove a character to add a new ${isVerse ? "verse" : "one"}.`}
          </Notice>
        ) : novelist ? (
          <Text style={[styles.usage, { color: theme.textGray }]}>
            {used} of {limit} characters used
          </Text>
        ) : null}

        {isVerse ? (
          <View
            style={[
              styles.verse,
              {
                backgroundColor: theme.accent.tint,
                borderColor: theme.accent.surface,
              },
            ]}
          >
            {parent ? (
              <>
                <Avatar
                  image={parent.avatar}
                  name={parent.firstName}
                  size={40}
                  uri={parent.avatar?.src ?? parent.image}
                />
                <View style={styles.verseText}>
                  <Text style={[styles.verseLabel, { color: theme.accent.text }]}>
                    Creating a new verse of
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.verseName, { color: theme.text }]}
                  >
                    {museName(parent)}
                  </Text>
                </View>
                <Ionicons
                  color={theme.accent.text}
                  name="git-branch-outline"
                  size={20}
                />
              </>
            ) : (
              <ActivityIndicator color={theme.primary} />
            )}
          </View>
        ) : null}

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.material.fill,
              borderColor: theme.material.edge,
            },
          ]}
        >
          <Pressable
            accessibilityLabel={avatar ? "Change avatar" : "Add avatar"}
            accessibilityRole="button"
            onPress={() =>
              avatar
                ? avatarFlow.open({ ...avatarImage, src: avatar.src } as NWImage)
                : avatarFlow.open(null)
            }
            style={styles.avatarPick}
          >
            {avatar ? (
              <Avatar
                image={avatarImage}
                name={firstName}
                size={96}
                uri={avatar.src}
              />
            ) : (
              <View
                style={[
                  styles.avatarEmpty,
                  { borderColor: theme.accent.solid },
                ]}
              >
                <Ionicons
                  color={theme.accent.text}
                  name="person-add-outline"
                  size={30}
                />
              </View>
            )}
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
          <Text style={[styles.avatarHint, { color: theme.textGray }]}>
            {avatar ? "Tap to adjust" : "Add an avatar (optional)"}
          </Text>

          <View style={styles.names}>
            <NameInput
              label="First name"
              onChangeText={setFirstName}
              onSubmitEditing={() => lastNameInput.current?.focus()}
              placeholder="First name"
              returnKeyType="next"
              value={firstName}
            />
            <NameInput
              inputRef={lastNameInput}
              label="Last name"
              onChangeText={setLastName}
              onSubmitEditing={() => void submit()}
              placeholder="Last name (optional)"
              returnKeyType="done"
              value={lastName}
            />
          </View>
        </View>

        <SettingsGroup title="Fandom">
          <SettingsRow
            accessory={
              <View style={[styles.fandomDot, { backgroundColor: fandomColor }]} />
            }
            icon="planet-outline"
            label={hasFandom ? fandom.name : "Original character"}
            onPress={() => setFandomOpen(true)}
            subtitle="Tap to search fandoms"
          />
        </SettingsGroup>

        <SettingsGroup
          footer={
            isVerse
              ? "A verse keeps the privacy of the character it belongs to."
              : undefined
          }
          title="Who can see this character"
        >
          {PRIVACY_CHOICES.map((option) => {
            const selected = shownPrivacy === option;
            return (
              <SettingsRow
                accessory={
                  <Ionicons
                    color={selected ? theme.accent.text : theme.textGray}
                    name={selected ? "radio-button-on" : "radio-button-off"}
                    size={20}
                  />
                }
                disabled={isVerse && !selected}
                icon={PRIVACY_ICON[option]}
                key={option}
                label={PRIVACY_LABEL[option]}
                onPress={isVerse ? undefined : () => setPrivacy(option)}
                tone={selected ? "accent" : "neutral"}
              />
            );
          })}
        </SettingsGroup>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.material.fill,
            borderTopColor: theme.material.edge,
            bottom: keyboardOffset,
            paddingBottom:
              keyboardOffset > 0 ? space.sm : insets.bottom + space.sm,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ busy: creating, disabled: !canCreate }}
          disabled={!canCreate}
          onPress={() => void submit()}
          style={({ pressed }) => [
            styles.create,
            {
              backgroundColor: pressed
                ? theme.accent.fillPressed
                : theme.accent.fill,
              opacity: canCreate || creating ? 1 : 0.5,
            },
          ]}
        >
          {creating ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Ionicons color="#ffffff" name="sparkles" size={16} />
          )}
          <Text style={styles.createLabel}>
            {creating
              ? "Creating…"
              : isVerse
                ? "Create verse"
                : "Create character"}
          </Text>
        </Pressable>
      </View>

      <FandomSheet
        current={fandom}
        onClose={() => setFandomOpen(false)}
        onPick={setFandom}
        visible={fandomOpen}
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
}

const styles = StyleSheet.create({
  avatarBadge: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 3,
    bottom: 0,
    height: 32,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    width: 32,
  },
  avatarEmpty: {
    alignItems: "center",
    borderRadius: 48,
    borderStyle: "dashed",
    borderWidth: 1.5,
    height: 96,
    justifyContent: "center",
    width: 96,
  },
  avatarHint: { fontSize: fontSize.caption, textAlign: "center" },
  avatarPick: { alignSelf: "center" },
  body: { gap: space.lg, padding: space.m },
  card: {
    borderRadius: radius.md + 4,
    borderWidth: border.edge,
    gap: space.sm,
    paddingVertical: space.lg,
  },
  create: {
    alignItems: "center",
    borderRadius: radius.full,
    flexDirection: "row",
    gap: space.sm,
    justifyContent: "center",
    minHeight: 48,
  },
  createLabel: { color: "#ffffff", fontSize: fontSize.body, fontWeight: "700" },
  fandomDot: { borderRadius: 7, height: 14, width: 14 },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    left: 0,
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    position: "absolute",
    right: 0,
  },
  names: { gap: space.m, paddingHorizontal: space.md, paddingTop: space.sm },
  root: { flex: 1 },
  usage: { fontSize: fontSize.caption, paddingHorizontal: space.xs },
  verse: {
    alignItems: "center",
    borderRadius: radius.md + 4,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.m,
    padding: space.md,
  },
  verseLabel: {
    fontSize: fontSize.caption,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  verseName: { fontSize: fontSize.body, fontWeight: "700" },
  verseText: { flex: 1, gap: space.xxs, minWidth: 0 },
});
