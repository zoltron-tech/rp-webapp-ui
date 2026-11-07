import { Ionicons } from "@expo/vector-icons";
import { imageSources } from "@nw/richtext";
import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, Pressable, StyleSheet, View } from "react-native";
import {
  MediaTrayInline,
  type TrayTab,
} from "@/components/chat/media-tray-inline";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/editor/rich-text-editor";
import { EditorModal } from "@/components/muse/edit/editor-modal";
import { Text } from "@/components/text";
import { useComposerMedia } from "@/hooks/use-composer-media";
import { useKeyboardHeight } from "@/hooks/use-keyboard-height";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * A rich text field of a tray, written full screen: a codex entry's
 * description, a character's about. A tray has no room for an editor and its
 * toolbar on a 667pt screen, so the tray shows a preview and this opens over it.
 *
 * Pictures and GIFs go into the text at the cursor, as in `StorySectionEditor`.
 * Done hands the HTML back to the form, which is what saves it.
 */
export const RichFieldEditor = ({
  html,
  onClose,
  onDone,
  placeholder,
  title,
  visible,
}: {
  html: string;
  onClose: () => void;
  onDone: (html: string) => void;
  placeholder: string;
  title: string;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const editor = useRef<RichTextEditorHandle>(null);
  const [draft, setDraft] = useState(html);
  const [trayTab, setTrayTab] = useState<TrayTab | null>(null);

  const media = useComposerMedia({
    onImageFailed: (local) => editor.current?.removeImageBySrc(local),
    onImageInserted: (local) => editor.current?.insertImage(local),
    onImageUploaded: (local, url) =>
      editor.current?.replaceImageSrc(local, url),
  });

  const keyboardHeight = useKeyboardHeight();
  const lastKeyboardHeight = useRef(0);
  if (keyboardHeight > 0) lastKeyboardHeight.current = keyboardHeight;

  useEffect(() => {
    if (!visible) return;
    setDraft(html);
    setTrayTab(null);
  }, [html, visible]);

  const close = () => {
    setTrayTab(null);
    media.discard();
    onClose();
  };

  const openTray = useCallback((tab: TrayTab) => {
    Keyboard.dismiss();
    setTrayTab(tab);
  }, []);

  return (
    <EditorModal
      canConfirm={!media.isUploading}
      confirmLabel="Done"
      onClose={close}
      onConfirm={() => {
        media.commit();
        setTrayTab(null);
        onDone(draft);
      }}
      title={title}
      tray={
        <MediaTrayInline
          keyboardHeight={lastKeyboardHeight.current}
          onClose={() => setTrayTab(null)}
          onRequestKeyboard={() => {
            setTrayTab(null);
            editor.current?.focus();
          }}
          onSelect={(url) => {
            setTrayTab(null);
            editor.current?.insertImage(url);
          }}
          onTabChange={setTrayTab}
          tab={trayTab}
        />
      }
      trayOpen={trayTab !== null}
      visible={visible}
    >
      <View
        style={[styles.actions, { borderBottomColor: theme.material.edge }]}
      >
        <Pressable
          accessibilityLabel="Add a picture to the text"
          accessibilityRole="button"
          onPress={() => void media.pickImage()}
          style={({ pressed }) => [
            styles.action,
            {
              backgroundColor: pressed
                ? theme.material.fillPressed
                : theme.material.fill,
              borderColor: theme.material.edge,
            },
          ]}
        >
          <Ionicons color={theme.text} name="attach-outline" size={18} />
          <Text style={[styles.actionLabel, { color: theme.text }]}>
            Picture
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Insert a GIF"
          accessibilityRole="button"
          onPress={() => openTray("gif")}
          style={({ pressed }) => [
            styles.action,
            {
              backgroundColor: pressed
                ? theme.material.fillPressed
                : theme.material.fill,
              borderColor: theme.material.edge,
            },
          ]}
        >
          <Text style={[styles.gif, { color: theme.text }]}>GIF</Text>
        </Pressable>
      </View>
      <RichTextEditor
        initialHtml={html}
        key={String(visible)}
        onChange={(next, doc) => {
          setDraft(next);
          media.reconcile(imageSources(doc));
        }}
        placeholder={placeholder}
        ref={editor}
        uploadingSources={media.uploadingSources}
      />
    </EditorModal>
  );
};

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.xs,
    height: 36,
    justifyContent: "center",
    paddingHorizontal: space.m,
  },
  actionLabel: { fontSize: fontSize.label, fontWeight: "600" },
  actions: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  gif: { fontSize: fontSize.caption, fontWeight: "800", letterSpacing: 0.5 },
});
