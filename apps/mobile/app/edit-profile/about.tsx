import { searchMentionMuses } from "@nw/api/endpoints/muse";
import { useApi, useSession } from "@nw/features";
import type { MentionDataItem, MentionTab } from "@nw/types";
import { Stack, useNavigation } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/editor/rich-text-editor";
import {
  MediaTrayInline,
  type TrayTab,
} from "@/components/chat/media-tray-inline";
import { getGlassTier } from "@/components/glass-surface";
import { PillButton } from "@/components/settings";
import {
  useKeyboardHeight,
  useKeyboardOffset,
} from "@/hooks/use-keyboard-height";
import { useProfileEdit } from "@/hooks/use-profile-edit";
import { useRichTextMediaRoom } from "@/hooks/use-rich-text-media-room";
import {
  alertMediaRejected,
  pickedOversizeMessage,
  pickImage,
  uploadFile,
} from "@/lib/media-upload";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Web's `AboutSection`: your bio, in the same rich text editor the composer
 * uses, with pictures uploaded inline under the `profile-about` prefix web
 * writes them to.
 *
 * Leaving with unsaved text asks first, as web's discard dialog does.
 */
export default function AboutScreen() {
  const theme = useAppTheme();
  const api = useApi();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const keyboardOffset = useKeyboardOffset(insets.bottom);
  const { novelist } = useSession();
  const edit = useProfileEdit();

  /** The last keyboard height, for the drawer to open at. */
  const keyboardHeight = useKeyboardHeight();
  const lastKeyboardHeight = useRef(0);
  if (keyboardHeight > 0) lastKeyboardHeight.current = keyboardHeight;

  const editor = useRef<RichTextEditorHandle>(null);
  const original = novelist?.about ?? "";
  const [html, setHtml] = useState(original);
  const [uploading, setUploading] = useState<ReadonlySet<string>>(new Set());
  const [saving, setSaving] = useState(false);
  /** Set once a save lands, so the discard guard lets the pop through. */
  const leaving = useRef(false);

  const dirty = html !== original;
  // Five media items per rich-text input, as on prompts (2026-11-08).
  const { ensureRoom } = useRichTextMediaRoom(html);
  const busy = saving || uploading.size > 0;

  const [trayTab, setTrayTab] = useState<TrayTab | null>(null);
  /** Remounts the editor on Reset: it owns its document once it has started. */
  const [editorKey, setEditorKey] = useState(0);

  const reset = () => {
    setHtml(original);
    setEditorKey((key) => key + 1);
  };

  /** Web's Friends and Muses tabs in the @ list. */
  const mentionTabs = useMemo<MentionTab[]>(
    () => [
      {
        getData: async (prefix: string): Promise<MentionDataItem[]> =>
          (novelist?.friends ?? [])
            .filter((friend) =>
              friend.username.toLowerCase().includes(prefix.toLowerCase()),
            )
            .map((friend) => ({
              displayName: friend.username,
              id: friend.id,
              image: friend.image,
              type: "NOVELIST" as const,
            })),
        iconKey: "avatar",
        id: "novelists",
        label: "Friends",
      },
      {
        getData: (prefix: string) => searchMentionMuses(api, prefix),
        iconKey: "icon",
        id: "muses",
        label: "Muses",
      },
    ],
    [api, novelist?.friends],
  );

  const save = useCallback(async () => {
    if (!dirty || busy) return;
    setSaving(true);
    const ok = await edit.saveNovelist({ about: editor.current?.getHtml() ?? html });
    setSaving(false);
    if (!ok) {
      Alert.alert("Not saved", "Your bio could not be saved. Try again.");
      return;
    }
    leaving.current = true;
    navigation.goBack();
  }, [busy, dirty, edit, html, navigation]);

  useEffect(
    () =>
      navigation.addListener("beforeRemove", (event) => {
        if (!dirty || leaving.current) return;
        event.preventDefault();
        Alert.alert(
          "Discard unsaved changes?",
          "You have unsaved changes that will be lost.",
          [
            { style: "cancel", text: "Stay" },
            {
              onPress: () => {
                leaving.current = true;
                navigation.dispatch(event.data.action);
              },
              style: "destructive",
              text: "Discard",
            },
          ],
        );
      }),
    [dirty, navigation],
  );

  const attach = async () => {
    if (!ensureRoom()) return;
    const file = await pickImage();
    if (!file) return;
    const tooLarge = await pickedOversizeMessage(api, file);
    if (tooLarge) {
      Alert.alert("Picture is too large", tooLarge);
      return;
    }
    editor.current?.insertImage(file.uri);
    setUploading((current) => new Set(current).add(file.uri));
    const { refused, rejected, url } = await uploadFile(
      api,
      file,
      "profile-about",
    );
    setUploading((current) => {
      const next = new Set(current);
      next.delete(file.uri);
      return next;
    });
    if (!url) {
      editor.current?.removeImageBySrc(file.uri);
      if (rejected) alertMediaRejected();
      else if (!refused)
        Alert.alert("Upload failed", "The picture could not be uploaded.");
      return;
    }
    editor.current?.replaceImageSrc(file.uri, url);
  };

  /*
   * Save, in the header.
   *
   * A filled pill everywhere but iOS 26: filled when there is something to
   * save, washed out when there is not.
   *
   * iOS 26 sets every bar item in a glass bubble of the system's own size,
   * and a pill of ours inside it showed the bubble as a gap all round the
   * button. The installed `react-native-screens` has no way to turn the
   * bubble off, so there the bubble *is* the button: no fill of ours, and the
   * label carries the state — the accent when there is something to save,
   * grey when there is not.
   */
  const inBubble = getGlassTier() === "liquid";
  const idle = !dirty || busy;
  const saveColor = inBubble
    ? idle
      ? theme.textGray
      : theme.accent.text
    : idle
      ? theme.accent.onFillDisabled
      : theme.accent.onFill;

  const saveButton = (
    <Pressable
      accessibilityLabel="Save bio"
      accessibilityRole="button"
      accessibilityState={{ disabled: idle }}
      disabled={idle}
      hitSlop={space.sm}
      onPress={() => void save()}
      style={({ pressed }) =>
        inBubble
          ? [styles.saveBare, { opacity: idle ? 0.55 : pressed ? 0.6 : 1 }]
          : [
              styles.save,
              {
                backgroundColor: idle
                  ? theme.accent.fillDisabled
                  : pressed
                    ? theme.accent.fillPressed
                    : theme.accent.fill,
              },
            ]
      }
    >
      {saving ? (
        <ActivityIndicator color={saveColor} size="small" />
      ) : (
        <Text style={[styles.saveLabel, { color: saveColor }]}>Save</Text>
      )}
    </Pressable>
  );

  return (
    <View
      style={[
        styles.root,
        {
          marginBottom: keyboardOffset,
          paddingBottom: keyboardOffset > 0 ? 0 : insets.bottom,
        },
      ]}
    >
      <Stack.Screen
        options={{
          headerRight: () => saveButton,
        }}
      />

      <View
        style={[styles.toolbar, { borderBottomColor: theme.material.edge }]}
      >
        <Text style={[styles.hint, { color: theme.textGray }]}>
          {uploading.size > 0
            ? "Uploading picture…"
            : "Tell people about yourself."}
        </Text>
        {dirty ? (
          <PillButton disabled={saving} label="Reset" onPress={reset} />
        ) : null}
        <PillButton
          disabled={saving}
          icon="image-outline"
          label="Picture"
          onPress={() => void attach()}
        />
        <PillButton
          disabled={saving}
          label="GIF"
          onPress={() => {
            if (!ensureRoom()) return;
            Keyboard.dismiss();
            setTrayTab("gif");
          }}
        />
      </View>

      <RichTextEditor
        initialHtml={original}
        key={editorKey}
        mentionTabs={mentionTabs}
        onChange={(next) => setHtml(next)}
        placeholder="Tell people about yourself..."
        ref={editor}
        uploadingSources={uploading}
      />

      <MediaTrayInline
        keyboardHeight={lastKeyboardHeight.current}
        onClose={() => setTrayTab(null)}
        onRequestKeyboard={() => {
          setTrayTab(null);
          editor.current?.focus();
        }}
        onSelect={(url) => {
          setTrayTab(null);
          if (!ensureRoom()) return;
          editor.current?.insertImage(url);
        }}
        onTabChange={setTrayTab}
        tab={trayTab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hint: { flex: 1, fontSize: fontSize.label },
  root: { flex: 1 },
  save: {
    alignItems: "center",
    borderRadius: radius.full,
    justifyContent: "center",
    minWidth: 68,
    paddingHorizontal: space.md,
    paddingVertical: space.s,
  },
  // Inside the system's bubble, which brings its own shape and padding.
  saveBare: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
    paddingHorizontal: space.xs,
  },
  saveLabel: { color: "#ffffff", fontSize: fontSize.label, fontWeight: "700" },
  toolbar: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
});
