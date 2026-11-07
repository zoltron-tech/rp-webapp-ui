import { Ionicons } from "@expo/vector-icons";
import type { Muse } from "@nw/types";
import type { PrivacyLevel } from "@nw/types/prompt";
import { createContext, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { type ActionItem, ActionMenu } from "@/components/action-menu";
import { PRIVACY_ICON, PRIVACY_LABEL } from "@/components/feed/privacy";
import { ImageCropEditor } from "@/components/muse/edit/image-crop-editor";
import { Text } from "@/components/text";
import { useImageCropFlow } from "@/hooks/use-image-crop-flow";
import type { MuseEdit } from "@/hooks/use-muse-edit";
import { withAlpha } from "@/lib/color";
import { fontSize, radius, space } from "@/theme";

/**
 * The two owner tools every section's header carries: the privacy mark at the
 * end of the row and the camera on the face.
 *
 * They lived in Info alone, so the header looked different in Story, Canon,
 * Posts, Peers, Gallery and More — and you had to go back to Info to change
 * either. The profile screen now hands `edit` and ownership down through
 * `MuseHeaderContext`, and `MiniHeader` draws both wherever it is drawn.
 *
 * Someone else's character still shows its privacy, read-only: a tap floats a
 * line under the mark saying who can see it, over the panel rather than in
 * the row, so the header never moves.
 */

export type MuseHeaderTools = { edit: MuseEdit; isOwnMuse: boolean };

export const MuseHeaderContext = createContext<MuseHeaderTools | null>(null);

const PRIVACY_OPTIONS: PrivacyLevel[] = ["PUBLIC", "FRIENDS", "ONLY_ME"];

const PRIVACY_HINT: Record<string, string> = {
  FRIENDS: "This character is visible to friends only",
  ONLY_ME: "This character is private",
  PUBLIC: "This character is public",
};

/** How long the visitor's privacy note stays up. */
const NOTE_MS = 3200;

const fail = (what: string) =>
  Alert.alert("Not saved", `${what} could not be saved. Try again.`);

/** The privacy mark: a picker for the owner, a note for everyone else. */
export const PrivacyMark = ({ muse }: { muse: Muse }) => {
  const tools = useContext(MuseHeaderContext);
  const own = Boolean(tools?.isOwnMuse);
  // A verse inherits its privacy from the main character.
  const canChange = own && !muse.originalVerseId;
  const [menu, setMenu] = useState(false);
  const [note, setNote] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!note) return;
    const timer = setTimeout(() => setNote(false), NOTE_MS);
    return () => clearTimeout(timer);
  }, [note]);

  const hint = muse.originalVerseId
    ? "Privacy is inherited from the original character"
    : PRIVACY_HINT[muse.privacy];

  const change = async (privacy: PrivacyLevel) => {
    setMenu(false);
    if (!tools || privacy === muse.privacy) return;
    setBusy(true);
    const ok = await tools.edit.setPrivacy(privacy);
    setBusy(false);
    if (!ok) fail("The privacy setting");
  };

  const items: ActionItem[] = PRIVACY_OPTIONS.map((option) => ({
    icon: PRIVACY_ICON[option],
    label: PRIVACY_LABEL[option],
    onPress: () => void change(option),
    variant: option === muse.privacy ? "positive" : "default",
  }));

  return (
    <View style={styles.markWrap}>
      <Pressable
        accessibilityHint={
          canChange ? "Change who can see this character" : hint
        }
        accessibilityLabel={`Visibility: ${PRIVACY_LABEL[muse.privacy] ?? muse.privacy}`}
        accessibilityRole="button"
        disabled={busy}
        hitSlop={space.xs}
        onPress={() => (canChange ? setMenu(true) : setNote((shown) => !shown))}
        style={({ pressed }) => [styles.mark, { opacity: pressed ? 0.7 : 1 }]}
      >
        {busy ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Ionicons
            color="rgba(255,255,255,0.75)"
            name={PRIVACY_ICON[muse.privacy] ?? "earth-outline"}
            size={13}
          />
        )}
        {canChange ? (
          <Ionicons
            color="rgba(255,255,255,0.5)"
            name="chevron-down"
            size={10}
          />
        ) : null}
      </Pressable>

      {note ? (
        <View pointerEvents="none" style={styles.note}>
          <Text style={styles.noteText}>{hint}</Text>
        </View>
      ) : null}

      {canChange ? (
        <ActionMenu
          items={items}
          onClose={() => setMenu(false)}
          subtitle="Who can see this character"
          title="Privacy"
          visible={menu}
        />
      ) : null}
    </View>
  );
};

/**
 * The camera on the owner's face: adjust, replace or remove the avatar, or
 * add one. Nothing for anyone else.
 */
export const AvatarBadge = ({
  accent,
  muse,
}: {
  accent?: string;
  muse: Muse;
}) => {
  const tools = useContext(MuseHeaderContext);
  const [menu, setMenu] = useState(false);
  const [busy, setBusy] = useState(false);
  const flow = useImageCropFlow({
    onSave: async (src, crop) =>
      tools ? tools.edit.setAvatar(src, crop) : false,
    prefix: muse.id,
  });

  if (!tools?.isOwnMuse) return null;

  const remove = () =>
    Alert.alert(
      "Remove avatar?",
      "Remove this character's avatar photo? The card image will be used as fallback.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            setBusy(true);
            const ok = await tools.edit.removeAvatar();
            setBusy(false);
            if (!ok) fail("The avatar");
          },
          style: "destructive",
          text: "Remove",
        },
      ],
    );

  /*
   * `onSelect`, not `onPress`: each of these opens something modal — the
   * crop editor, the photo library, the confirm — and iOS will not present
   * one over a tray still sliding away. With `onPress` the second modal never
   * appeared and the invisible one left behind ate every touch until it
   * timed out. `ActionMenu` closes itself and runs these once it has gone.
   */
  const items: ActionItem[] = [
    {
      icon: "move-outline",
      label: "Adjust photo",
      onSelect: () => flow.open(muse.avatar),
    },
    {
      icon: "images-outline",
      label: "Choose a new photo",
      onSelect: () => void flow.replace(),
    },
    { separator: true },
    {
      icon: "trash-outline",
      label: "Remove photo",
      onSelect: remove,
      variant: "danger",
    },
  ];

  return (
    <>
      <Pressable
        accessibilityLabel={muse.avatar?.src ? "Change photo" : "Add a photo"}
        accessibilityRole="button"
        disabled={busy || flow.saving}
        hitSlop={space.xs}
        onPress={() => (muse.avatar?.src ? setMenu(true) : flow.open(null))}
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
        {busy || flow.saving ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Ionicons color="#ffffff" name="camera" size={12} />
        )}
      </Pressable>
      <ActionMenu
        items={items}
        onClose={() => setMenu(false)}
        title="Character photo"
        visible={menu}
      />
      <ImageCropEditor
        aspect={1}
        autoFit={flow.autoFit}
        busy={flow.saving}
        circle
        initial={flow.initial}
        onClose={flow.close}
        onConfirm={(crop) => void flow.confirm(crop)}
        onReplace={() => void flow.replace()}
        title="Adjust avatar"
        uploading={flow.uploading}
        uri={flow.uri}
        visible={flow.visible}
      />
    </>
  );
};

const styles = StyleSheet.create({
  camera: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    borderWidth: 1.5,
    bottom: -2,
    height: 24,
    justifyContent: "center",
    position: "absolute",
    right: -4,
    width: 24,
  },
  mark: {
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
  markWrap: { position: "relative", zIndex: 2 },
  note: {
    backgroundColor: "rgba(10,10,14,0.92)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: space.ms,
    paddingVertical: space.s,
    position: "absolute",
    right: 0,
    top: 34,
    width: 200,
  },
  noteText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: fontSize.caption,
    lineHeight: 16,
  },
});
