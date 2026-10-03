import { useApi, useSession } from "@nw/features";
import { Stack, useNavigation } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/editor/rich-text-editor";
import { PillButton } from "@/components/settings";
import { useKeyboardOffset } from "@/hooks/use-keyboard-height";
import { useProfileEdit } from "@/hooks/use-profile-edit";
import { MAX_IMAGE_BYTES, pickImage, uploadFile } from "@/lib/media-upload";
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

  const editor = useRef<RichTextEditorHandle>(null);
  const original = novelist?.about ?? "";
  const [html, setHtml] = useState(original);
  const [uploading, setUploading] = useState<ReadonlySet<string>>(new Set());
  const [saving, setSaving] = useState(false);
  /** Set once a save lands, so the discard guard lets the pop through. */
  const leaving = useRef(false);

  const dirty = html !== original;
  const busy = saving || uploading.size > 0;

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
    const file = await pickImage();
    if (!file) return;
    if (file.fileSize > MAX_IMAGE_BYTES) {
      Alert.alert("Picture is too large", "Maximum file size is 10 MB.");
      return;
    }
    editor.current?.insertImage(file.uri);
    setUploading((current) => new Set(current).add(file.uri));
    const url = await uploadFile(api, file, "profile-about");
    setUploading((current) => {
      const next = new Set(current);
      next.delete(file.uri);
      return next;
    });
    if (!url) {
      editor.current?.removeImageBySrc(file.uri);
      Alert.alert("Upload failed", "The picture could not be uploaded.");
      return;
    }
    editor.current?.replaceImageSrc(file.uri, url);
  };

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
          headerRight: () => (
            <Pressable
              accessibilityLabel="Save bio"
              accessibilityRole="button"
              disabled={!dirty || busy}
              onPress={() => void save()}
              style={({ pressed }) => [
                styles.save,
                {
                  backgroundColor:
                    !dirty || busy
                      ? theme.accent.surface
                      : pressed
                        ? theme.accent.solidHover
                        : theme.accent.solid,
                  opacity: !dirty && !busy ? 0.6 : 1,
                },
              ]}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.saveLabel}>Save</Text>
              )}
            </Pressable>
          ),
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
        <PillButton
          disabled={saving}
          icon="image-outline"
          label="Picture"
          onPress={() => void attach()}
        />
      </View>

      <RichTextEditor
        initialHtml={original}
        onChange={(next) => setHtml(next)}
        placeholder="Tell people about yourself..."
        ref={editor}
        uploadingSources={uploading}
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
    paddingVertical: 6,
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
