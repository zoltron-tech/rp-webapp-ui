import { Ionicons } from "@expo/vector-icons";
import { searchMentionMuses } from "@nw/api/endpoints/muse";
import { saveStoryBoardEventThread } from "@nw/api/endpoints/story";
import { useApi, useSession } from "@nw/features";
import { documentFromHtml, type RichDocument } from "@nw/richtext";
import { namesToWords } from "@nw/spell/tokenizer";
import {
  API_MESSAGE,
  type MentionDataItem,
  type MentionTab,
  type StoryBoardEventThread,
  type StoryCharacter,
} from "@nw/types";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  MediaTrayInline,
  type TrayTab,
} from "@/components/chat/media-tray-inline";
import { KeyboardLift } from "@/components/compose/prompt-composer";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/editor/rich-text-editor";
import { IconButton } from "@/components/icon-button";
import { BottomSheet } from "@/components/sheet";
import { DialogLine } from "@/components/story/dialog-line";
import {
  DialogSheet,
  type DialogSpeaker,
} from "@/components/story/dialog-sheet";
import { Text } from "@/components/text";
import { useComposerMedia } from "@/hooks/use-composer-media";
import { lastKeyboardHeight } from "@/hooks/use-keyboard-height";
import {
  editorToPassage,
  isDialogSource,
  newDialogSource,
  passageImageSources,
  passageToEditor,
} from "@/lib/passage";
import {
  characterName,
  DIALOG_DESIGN_OPTIONS,
  type DialogDesign,
  type DialogEmbed,
  resolveDialogDesign,
} from "@/lib/story";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * "Add to passage" — web's `EventThreadInput`, as the screen a phone writes
 * on.
 *
 * Web sets its composer into the chapter's last page and edits a passage in
 * place. Both lean on a pointer and a tall window; on a phone the keyboard
 * takes half the screen and an editor inside a scrolling chapter is a scroll
 * inside a scroll. So writing a passage is the prompt composer's screen: the
 * page lifts with the keyboard (`KeyboardLift`), the editor fills it, and the
 * send sits in the top bar. The chapter opens it from the bar at its foot and
 * from a passage's menu.
 *
 * What web's composer header carries is the row above the editor here: how
 * this passage's dialogs are drawn (fixed per passage, chosen by its author),
 * then insert-a-dialog, attach a picture and the GIF tray. Pictures and GIFs
 * go into the text, as web's do; a passage has no attachment of its own.
 *
 * ## Dialogs
 *
 * The one thing a passage has that a post does not. A dialog is a block in
 * the page — see `lib/passage` for how it travels through the editor — drawn
 * in the passage's chosen design exactly as the chapter will show it, and
 * opened in `DialogSheet` by tapping it. Inserting one asks for the line
 * first and puts it after the line the caret was on, then hands the keyboard
 * back to the line under it: write, dialog, write on.
 */
export const PassageComposer = ({
  eventId,
  onClose,
  onSaved,
  storyCharacters,
  thread,
}: {
  eventId: string;
  onClose: () => void;
  /** After the server took it. `created` is false for an edit. */
  onSaved: (created: boolean) => void;
  /** The story's own characters — dialog speakers beside the writer's muses. */
  storyCharacters: StoryCharacter[];
  /** The passage being edited, or null for a new one. */
  thread: StoryBoardEventThread | null;
}) => {
  const theme = useAppTheme();
  const api = useApi();
  const insets = useSafeAreaInsets();
  const { novelist } = useSession();

  const editor = useRef<RichTextEditorHandle>(null);

  // Read once: the editor owns the document from here on.
  const initial = useRef(passageToEditor(thread?.message)).current;
  const [dialogs, setDialogs] = useState(initial.dialogs);
  const [design, setDesign] = useState<DialogDesign>(() =>
    resolveDialogDesign(thread?.dialogDesign),
  );
  /** What the passage serialises to untouched, to tell an edit from a look. */
  const pristine = useMemo(
    () => editorToPassage(documentFromHtml(initial.html), initial.dialogs),
    [initial],
  );

  const [hasContent, setHasContent] = useState(Boolean(thread?.message));
  const [sending, setSending] = useState(false);
  const [trayTab, setTrayTab] = useState<TrayTab | null>(null);
  const [designOpen, setDesignOpen] = useState(false);
  /** The dialog in the tray: a block's key, or "new". */
  const [editing, setEditing] = useState<string | null>(null);

  const serialise = useCallback(
    () =>
      editorToPassage(
        editor.current?.getDocument() ?? documentFromHtml(initial.html),
        dialogs,
      ),
    [dialogs, initial],
  );

  // ─── Who can speak ───────────────────────────────────────────────────────

  const speakers = useMemo<DialogSpeaker[]>(
    () => [
      ...(novelist?.muses ?? []).flatMap((muse) =>
        muse.id
          ? [
              {
                id: muse.id,
                name: `${muse.firstName} ${muse.lastName}`.trim(),
                source: "MUSE" as const,
              },
            ]
          : [],
      ),
      ...storyCharacters.flatMap((character) =>
        character.id
          ? [
              {
                id: character.id,
                name: characterName(character),
                source: "CHARACTER" as const,
              },
            ]
          : [],
      ),
    ],
    [novelist?.muses, storyCharacters],
  );

  /**
   * Name and accent by speaker, as the server will send them once saved: what
   * the passage arrived with, then the writer's own muses and the story's
   * characters over it. An accent counts only where its owner opted into it,
   * so the coloured designs fall back to the app's otherwise — web's rule.
   */
  const attrs = useMemo(() => {
    const out: NonNullable<StoryBoardEventThread["museDialogAttrs"]> = {
      ...thread?.museDialogAttrs,
    };
    for (const muse of novelist?.muses ?? []) {
      if (!muse.id) continue;
      out[muse.id] = {
        accent: muse.useAccent ? muse.accent : null,
        name: `${muse.firstName} ${muse.lastName}`.trim(),
        sourceType: "MUSE",
      };
    }
    for (const character of storyCharacters) {
      if (!character.id) continue;
      out[character.id] = {
        accent: character.useAccent ? (character.accent ?? null) : null,
        name: characterName(character),
        sourceType: "CHARACTER",
      };
    }
    return out;
  }, [novelist?.muses, storyCharacters, thread?.museDialogAttrs]);

  // ─── Media ───────────────────────────────────────────────────────────────

  const media = useComposerMedia({
    onImageFailed: (local) => editor.current?.removeImageBySrc(local),
    onImageInserted: (local) => editor.current?.insertImage(local),
    onImageUploaded: (local, url) =>
      editor.current?.replaceImageSrc(local, url),
  });

  const reconcileMedia = media.reconcile;
  const onDocumentChange = useCallback(
    (doc: RichDocument, empty: boolean) => {
      setHasContent(!empty);
      reconcileMedia(passageImageSources(doc));
    },
    [reconcileMedia],
  );

  // Names the spell checker must leave alone: the novelist, their muses and
  // friends, and the story's own characters.
  const spellIgnore = useMemo(
    () =>
      namesToWords([
        novelist?.username,
        novelist?.firstName,
        novelist?.lastName,
        ...(novelist?.muses ?? []).flatMap((m) => [m.firstName, m.lastName]),
        ...(novelist?.friends ?? []).map((f) => f.username),
        ...storyCharacters.map((character) => characterName(character)),
      ]),
    [novelist, storyCharacters],
  );

  // ─── Mentions ────────────────────────────────────────────────────────────

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
        label: "Characters",
      },
    ],
    [api, novelist?.friends],
  );

  // ─── Dialogs ─────────────────────────────────────────────────────────────

  const openDialog = useCallback((src: string) => {
    Keyboard.dismiss();
    setTrayTab(null);
    setEditing(src);
  }, []);

  const saveDialog = useCallback(
    (dialog: DialogEmbed) => {
      const src = editing;
      setEditing(null);
      if (!src) return;
      if (src !== "new") {
        setDialogs((current) => new Map(current).set(src, dialog));
        return;
      }
      const created = newDialogSource();
      setDialogs((current) => new Map(current).set(created, dialog));
      // After the caret's line, with the keyboard handed to the line under it.
      editor.current?.insertImage(created);
    },
    [editing],
  );

  const deleteDialog = useCallback(() => {
    const src = editing;
    setEditing(null);
    if (!src || src === "new") return;
    editor.current?.removeImageBySrc(src);
    setDialogs((current) => {
      const next = new Map(current);
      next.delete(src);
      return next;
    });
  }, [editing]);

  const renderEmbed = useCallback(
    (src: string) => {
      if (!isDialogSource(src)) return null;
      const dialog = dialogs.get(src);
      // A key with no dialog behind it draws as nothing, never as a picture.
      if (!dialog) return <View />;
      const speaker = dialog.speakerId ? attrs[dialog.speakerId] : undefined;
      return (
        <Pressable
          accessibilityHint="Opens the dialog to edit it"
          accessibilityLabel={`Dialog by ${speaker?.name ?? dialog.storedName}`}
          accessibilityRole="button"
          onPress={() => openDialog(src)}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <View pointerEvents="none">
            <DialogLine design={design} dialog={dialog} speaker={speaker} />
          </View>
          <View
            style={[
              styles.editBadge,
              dialog.orientation === "right"
                ? styles.badgeLeft
                : styles.badgeRight,
              {
                backgroundColor: theme.material.fill,
                borderColor: theme.material.edge,
              },
            ]}
          >
            <Ionicons color={theme.textGray} name="pencil" size={11} />
          </View>
        </Pressable>
      );
    },
    [attrs, design, dialogs, openDialog, theme],
  );

  // Held while the tray slides away, so it does not turn into "New dialog"
  // on its way out.
  const shownDialog = useRef<DialogEmbed | null>(null);
  if (editing !== null) {
    shownDialog.current =
      editing === "new" ? null : (dialogs.get(editing) ?? null);
  }
  const editingDialog = shownDialog.current;

  // ─── Sending ─────────────────────────────────────────────────────────────

  const canSend = hasContent && !media.isUploading && !sending;

  const submit = useCallback(async () => {
    const message = serialise();
    if (!message) {
      Alert.alert("Nothing to add", "A passage cannot be empty.");
      return;
    }
    setSending(true);
    const result = await saveStoryBoardEventThread(api, {
      dialogDesign: design,
      id: thread?.id ?? null,
      message,
      storyBoardEventId: eventId,
    }).catch(() => ({ message: API_MESSAGE.Error }));
    setSending(false);

    if (result.message !== API_MESSAGE.Success) {
      Alert.alert(
        "Could not save",
        "The passage was not saved. Check your connection and try again.",
      );
      return;
    }
    media.commit();
    onSaved(!thread);
    onClose();
  }, [api, design, eventId, media, onClose, onSaved, serialise, thread]);

  const requestClose = useCallback(() => {
    const dirty = thread
      ? serialise() !== pristine ||
        design !== resolveDialogDesign(thread.dialogDesign)
      : hasContent;
    if (!dirty) {
      onClose();
      return;
    }
    Alert.alert(
      thread ? "Discard changes?" : "Discard this passage?",
      "What you have written will be lost.",
      [
        { style: "cancel", text: "Keep writing" },
        {
          onPress: () => {
            media.discard();
            onClose();
          },
          style: "destructive",
          text: "Discard",
        },
      ],
    );
  }, [design, hasContent, media, onClose, pristine, serialise, thread]);

  const openTray = useCallback(() => {
    Keyboard.dismiss();
    setTrayTab("gif");
  }, []);

  const designLabel =
    DIALOG_DESIGN_OPTIONS.find((option) => option.value === design)?.label ??
    "Card";

  return (
    <Modal
      animationType="slide"
      onRequestClose={requestClose}
      presentationStyle="fullScreen"
      statusBarTranslucent
      visible
    >
      <View style={[styles.shell, { backgroundColor: theme.background }]}>
        <KeyboardLift
          backgroundColor={theme.background}
          insetBottom={insets.bottom}
          insetTop={0}
          trayOpen={trayTab !== null}
        >
          {/* ── Top bar: the prompt composer's, with the send in it ─────── */}
          <View
            style={[
              styles.topBar,
              {
                backgroundColor: theme.glass.opaque,
                borderBottomColor: theme.glass.edge,
                paddingTop: insets.top + space.sm,
              },
            ]}
          >
            <IconButton
              accessibilityLabel="Close"
              hitSlop={space.sm}
              icon="close"
              iconSize={20}
              onPress={requestClose}
              size={36}
              tone="glass"
            />
            <Text
              numberOfLines={1}
              style={[styles.title, { color: theme.text }]}
            >
              {thread ? "Edit passage" : "Add to passage"}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSend }}
              disabled={!canSend}
              hitSlop={space.sm}
              onPress={() => void submit()}
              style={({ pressed }) => [
                styles.send,
                {
                  backgroundColor: canSend
                    ? pressed
                      ? theme.accent.fillPressed
                      : theme.accent.fill
                    : theme.accent.fillDisabled,
                },
              ]}
            >
              {sending ? (
                <ActivityIndicator
                  color={theme.accent.onFillDisabled}
                  size="small"
                />
              ) : (
                <Text
                  style={[
                    styles.sendLabel,
                    {
                      color: canSend
                        ? theme.accent.onFill
                        : theme.accent.onFillDisabled,
                    },
                  ]}
                >
                  {media.isUploading ? "Uploading..." : thread ? "Save" : "Add"}
                </Text>
              )}
            </Pressable>
          </View>

          {/* ── Tools: dialog style on the left, what to insert on the right */}
          <View style={styles.tools}>
            <Pressable
              accessibilityHint="Choose how this passage's dialogs are drawn"
              accessibilityLabel={`Dialog style: ${designLabel}`}
              accessibilityRole="button"
              onPress={() => {
                Keyboard.dismiss();
                setDesignOpen(true);
              }}
              style={({ pressed }) => [
                styles.design,
                {
                  backgroundColor: pressed
                    ? theme.glass.fillPressed
                    : theme.glass.fillHover,
                  borderColor: theme.glass.edge,
                },
              ]}
            >
              <View style={styles.designText}>
                <Text style={[styles.designEyebrow, { color: theme.textGray }]}>
                  DIALOG STYLE
                </Text>
                <Text
                  numberOfLines={1}
                  style={[styles.designName, { color: theme.text }]}
                >
                  {designLabel}
                </Text>
              </View>
              <Ionicons color={theme.textGray} name="chevron-down" size={14} />
            </Pressable>

            <Pressable
              accessibilityLabel="Insert a dialog"
              accessibilityRole="button"
              hitSlop={space.xs}
              onPress={() => openDialog("new")}
              style={({ pressed }) => [
                styles.insert,
                {
                  backgroundColor: pressed
                    ? theme.accent.surfaceHover
                    : theme.accent.surface,
                  borderColor: theme.accent.surfaceHover,
                },
              ]}
            >
              <Ionicons
                color={theme.accent.text}
                name="chatbubble-ellipses-outline"
                size={16}
              />
              <Text style={[styles.insertLabel, { color: theme.accent.text }]}>
                Dialog
              </Text>
            </Pressable>

            <IconButton
              accessibilityLabel="Add a picture"
              hitSlop={space.xs}
              icon="image-outline"
              onPress={() => void media.pickImage()}
              size={36}
              tone="glass"
            />

            <Pressable
              accessibilityLabel="Insert a GIF"
              accessibilityRole="button"
              hitSlop={space.xs}
              onPress={openTray}
              style={({ pressed }) => [
                styles.gif,
                {
                  backgroundColor:
                    trayTab !== null
                      ? theme.accent.surfaceActive
                      : pressed
                        ? theme.glass.fillPressed
                        : theme.glass.fillHover,
                  borderColor:
                    trayTab !== null ? theme.accent.solid : theme.glass.edge,
                },
              ]}
            >
              <Text
                style={[
                  styles.gifLabel,
                  {
                    color:
                      trayTab !== null ? theme.accent.textStrong : theme.text,
                  },
                ]}
              >
                GIF
              </Text>
            </Pressable>
          </View>

          <RichTextEditor
            initialHtml={initial.html}
            mentionTabs={mentionTabs}
            onDocumentChange={onDocumentChange}
            placeholder="Continue the story… @ to mention novelists or muses"
            ref={editor}
            renderEmbed={renderEmbed}
            spellIgnore={spellIgnore}
            uploadingSources={media.uploadingSources}
          />
        </KeyboardLift>

        <MediaTrayInline
          keyboardHeight={lastKeyboardHeight()}
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
          // Both go into the text as pictures. A clip is a video, and a
          // passage has nowhere to put one.
          tabs={["gif", "sticker"]}
        />

        <DialogSheet
          dialog={editingDialog}
          onClose={() => setEditing(null)}
          onDelete={editingDialog ? deleteDialog : undefined}
          onSave={saveDialog}
          speakerName={
            editingDialog?.speakerId
              ? attrs[editingDialog.speakerId]?.name
              : undefined
          }
          speakers={speakers}
          visible={editing !== null}
        />

        <BottomSheet
          ignoreKeyboard
          maxHeightRatio={0.7}
          onClose={() => setDesignOpen(false)}
          subtitle="How this passage's dialogs are drawn"
          title="Dialog style"
          visible={designOpen}
        >
          <ScrollView contentContainerStyle={styles.designs}>
            {DIALOG_DESIGN_OPTIONS.map((option) => {
              const selected = option.value === design;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={option.value}
                  onPress={() => {
                    setDesign(option.value);
                    setDesignOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.designRow,
                    {
                      backgroundColor: selected
                        ? theme.accent.tint
                        : pressed
                          ? theme.glass.fillPressed
                          : theme.material.fillTranslucent,
                      borderColor: selected
                        ? theme.accent.solid
                        : theme.material.edgeTranslucent,
                    },
                  ]}
                >
                  <View style={styles.designRowText}>
                    <Text
                      style={[
                        styles.designRowLabel,
                        {
                          color: selected
                            ? theme.accent.textStrong
                            : theme.text,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text
                      style={[styles.designRowHint, { color: theme.textGray }]}
                    >
                      {option.description}
                    </Text>
                  </View>
                  {selected ? (
                    <Ionicons
                      color={theme.accent.textStrong}
                      name="checkmark"
                      size={18}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </BottomSheet>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  badgeLeft: { left: space.xs },
  badgeRight: { right: space.xs },
  design: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flex: 1,
    flexDirection: "row",
    gap: space.xs,
    minHeight: 44,
    minWidth: 0,
    paddingHorizontal: space.m,
  },
  designEyebrow: {
    fontSize: fontSize.eyebrow,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  designName: { fontSize: fontSize.label, fontWeight: "700" },
  designRow: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    minHeight: 52,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  designRowHint: { fontSize: fontSize.caption },
  designRowLabel: { fontSize: fontSize.body, fontWeight: "600" },
  designRowText: { flex: 1, gap: 1, minWidth: 0 },
  designs: { gap: space.sm, padding: space.md, paddingBottom: space.xl },
  designText: { flex: 1, gap: 1, minWidth: 0 },
  editBadge: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    height: 22,
    justifyContent: "center",
    position: "absolute",
    top: space.xs,
    width: 22,
  },
  gif: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  gifLabel: {
    fontSize: fontSize.eyebrow,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  insert: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.xs,
    height: 36,
    paddingHorizontal: space.m,
  },
  insertLabel: { fontSize: fontSize.label, fontWeight: "700" },
  send: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 32,
    justifyContent: "center",
    minWidth: 64,
    paddingHorizontal: space.md,
  },
  sendLabel: { fontSize: fontSize.label, fontWeight: "700" },
  shell: { flex: 1 },
  title: {
    flex: 1,
    fontSize: fontSize.body,
    fontWeight: "700",
    textAlign: "center",
  },
  tools: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingTop: space.sm,
  },
  topBar: {
    alignItems: "center",
    borderBottomColor: "transparent",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
});
