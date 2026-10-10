import { Ionicons } from "@expo/vector-icons";
import {
  addMuseAboutSection,
  updateMuseAboutSection,
} from "@nw/api/endpoints/muse";
import { queryKeys, useApi } from "@nw/features";
import { imageSources } from "@nw/richtext";
import type { MuseAboutSection } from "@nw/types";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "@/components/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import {
  MediaTrayInline,
  type TrayTab,
} from "@/components/chat/media-tray-inline";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/editor/rich-text-editor";
import { EditorModal } from "@/components/muse/edit/editor-modal";
import { isVideoUrl } from "@/components/muse/media-viewer";
import { useComposerMedia } from "@/hooks/use-composer-media";
import { useKeyboardHeight } from "@/hooks/use-keyboard-height";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Web's `MuseAboutSectionForm`: one section of the story, created or edited.
 *
 * ## Pictures and GIFs go into the text
 *
 * As on web's form, and as in the post composer: the paperclip puts a picture
 * *into the text* where the caret is — drawn at once from the phone, swapped
 * for its storage URL when the upload lands — and the GIF button opens the
 * composer's media drawer, whose GIFs and stickers go in the same way. They
 * are inline images in the section's HTML, so the profile draws them in
 * place, between the paragraphs they belong to.
 *
 * What is not a picture stays web's separate attachment (`section.image`): a
 * clip from the drawer goes there. A section saved before inline pictures
 * existed keeps its picture-above in the same slot, shown with a Remove.
 *
 * Uploads this editor made and the text no longer holds are deleted as they
 * are removed (`reconcile`), and all of them on cancel (`discard`); a save
 * hands them to the section (`commit`).
 *
 * The ordinal of a new section is the count so far, which is how web's
 * create page orders them.
 */
export const StorySectionEditor = ({
  museId,
  onClose,
  section,
  sectionCount,
  visible,
}: {
  museId: string;
  onClose: () => void;
  /** The section being edited, or `null` for a new one. */
  section: MuseAboutSection | null;
  sectionCount: number;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const api = useApi();
  const queryClient = useQueryClient();
  const editor = useRef<RichTextEditorHandle>(null);

  const [html, setHtml] = useState(section?.text ?? "");
  const [attachment, setAttachment] = useState<string | null>(
    section?.image ?? null,
  );
  const [trayTab, setTrayTab] = useState<TrayTab | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const media = useComposerMedia({
    onImageFailed: (local) => editor.current?.removeImageBySrc(local),
    onImageInserted: (local) => editor.current?.insertImage(local),
    onImageUploaded: (local, url) =>
      editor.current?.replaceImageSrc(local, url),
  });

  /** The last keyboard height, for the drawer to open at — see the composer. */
  const keyboardHeight = useKeyboardHeight();
  const lastKeyboardHeight = useRef(0);
  if (keyboardHeight > 0) lastKeyboardHeight.current = keyboardHeight;

  useEffect(() => {
    if (!visible) return;
    setHtml(section?.text ?? "");
    setAttachment(section?.image ?? null);
    setTrayTab(null);
    setError(null);
  }, [section, visible]);

  const close = () => {
    setTrayTab(null);
    media.discard();
    onClose();
  };

  const openTray = useCallback((tab: TrayTab) => {
    Keyboard.dismiss();
    setTrayTab(tab);
  }, []);

  const pickFromTray = (url: string) => {
    const tab = trayTab;
    setTrayTab(null);
    if (tab === "clip") setAttachment(url);
    else editor.current?.insertImage(url);
  };

  const canConfirm = html.trim().length > 0 && !media.isUploading;

  const save = async () => {
    if (!canConfirm || busy) return;
    setBusy(true);
    setError(null);
    const result = section?.id
      ? await updateMuseAboutSection(
          api,
          section.id,
          html,
          section.ordinal,
          attachment,
        )
      : await addMuseAboutSection(api, museId, html, sectionCount, attachment);
    setBusy(false);
    if (!result || "message" in result) {
      setError("Could not save the section. Try again.");
      return;
    }
    const saved = result as MuseAboutSection;
    queryClient.setQueryData<MuseAboutSection[]>(
      queryKeys.museAboutSections(museId),
      (sections) => {
        const list = sections ?? [];
        return section?.id
          ? list.map((s) => (s.id === saved.id ? saved : s))
          : [...list, saved];
      },
    );
    media.commit();
    setTrayTab(null);
    onClose();
  };

  return (
    <EditorModal
      busy={busy}
      canConfirm={canConfirm}
      confirmLabel="Save"
      error={error}
      onClose={close}
      onConfirm={() => void save()}
      title={section ? "Edit story section" : "New story section"}
      tray={
        <MediaTrayInline
          keyboardHeight={lastKeyboardHeight.current}
          onClose={() => setTrayTab(null)}
          onRequestKeyboard={() => {
            setTrayTab(null);
            editor.current?.focus();
          }}
          onSelect={pickFromTray}
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
              backgroundColor:
                trayTab !== null
                  ? theme.accent.surfaceActive
                  : pressed
                    ? theme.material.fillPressed
                    : theme.material.fill,
              borderColor:
                trayTab !== null ? theme.accent.solid : theme.material.edge,
            },
          ]}
        >
          <Text
            style={[
              styles.gif,
              {
                color: trayTab !== null ? theme.accent.textStrong : theme.text,
              },
            ]}
          >
            GIF
          </Text>
        </Pressable>
        <Text
          numberOfLines={2}
          style={[styles.hint, { color: theme.textGray }]}
        >
          Pictures and GIFs go into the text where the cursor is.
        </Text>
      </View>

      {attachment ? (
        <View
          style={[
            styles.attachment,
            {
              backgroundColor: theme.material.fill,
              borderColor: theme.material.edge,
            },
          ]}
        >
          {isVideoUrl(attachment) ? (
            <View
              style={[
                styles.thumb,
                styles.video,
                { backgroundColor: theme.material.fillPressed },
              ]}
            >
              <Ionicons color={theme.text} name="play" size={16} />
            </View>
          ) : (
            <Image
              cachePolicy="memory-disk"
              contentFit="cover"
              source={{ uri: attachment }}
              style={styles.thumb}
            />
          )}
          <Text
            numberOfLines={1}
            style={[styles.attachmentLabel, { color: theme.text }]}
          >
            {isVideoUrl(attachment)
              ? "Clip attached"
              : "Picture above this section"}
          </Text>
          <Pressable
            accessibilityLabel="Remove attachment"
            accessibilityRole="button"
            hitSlop={space.sm}
            onPress={() => setAttachment(null)}
          >
            <Text style={[styles.remove, { color: theme.error }]}>Remove</Text>
          </Pressable>
        </View>
      ) : null}

      <RichTextEditor
        initialHtml={section?.text ?? ""}
        key={`${section?.id ?? "new"}-${visible}`}
        onChange={(next, doc) => {
          setHtml(next);
          media.reconcile(imageSources(doc));
        }}
        placeholder="Write this part of the story…"
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
  attachment: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.ms,
    marginHorizontal: space.md,
    marginTop: space.sm,
    padding: space.sm,
  },
  attachmentLabel: { flex: 1, fontSize: fontSize.label, fontWeight: "600" },
  gif: { fontSize: fontSize.caption, fontWeight: "800", letterSpacing: 0.5 },
  hint: { flex: 1, fontSize: fontSize.caption, lineHeight: 15 },
  remove: { fontSize: fontSize.label, fontWeight: "700" },
  thumb: { borderRadius: radius.sm, height: 40, width: 40 },
  video: { alignItems: "center", justifyContent: "center" },
});
