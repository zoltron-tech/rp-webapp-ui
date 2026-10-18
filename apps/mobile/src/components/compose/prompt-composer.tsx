import { Ionicons } from "@expo/vector-icons";
import { searchMentionMuses } from "@nw/api/endpoints/muse";
import { submitPrompt } from "@nw/api/endpoints/profile";
import { updatePromptComment } from "@nw/api/endpoints/prompt";
import type { MessageSenderChoice } from "@nw/chat";
import { useApi, useSession } from "@nw/features";
import { imageSources, type RichDocument } from "@nw/richtext";
import { namesToWords } from "@nw/spell/tokenizer";
import {
  API_MESSAGE,
  type Friend,
  type MentionDataItem,
  type MentionTab,
  type Muse,
  type PrivacyLevel,
  type Prompt,
  type PromptSource,
  type SubmitPromptInput,
  type SubmitPromptType,
} from "@nw/types";
import type { ProfileSong } from "@nw/types/music";
import {
  forwardRef,
  type ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  Modal,
  KeyboardAvoidingView as NativeKeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionMenu } from "@/components/action-menu";
import { Avatar } from "@/components/avatar";
import {
  MediaTrayInline,
  type TrayTab,
} from "@/components/chat/media-tray-inline";
import { SenderPicker } from "@/components/chat/sender-picker";
import {
  COMMENT_OOC_PLACEHOLDERS,
  COMMENT_PLACEHOLDERS,
} from "@/components/compose/compose-trigger";
import { MuseRequired } from "@/components/compose/muse-required";
import { NovelistConfirmSheet } from "@/components/compose/novelist-confirm-sheet";
import { PrivacySheet } from "@/components/compose/privacy-sheet";
import { SongSheet } from "@/components/compose/song-sheet";
import {
  buildOptimisticPrompt,
  type DropdownSelection,
  museToSource,
  sourcesFor,
  submitErrorText,
} from "@/components/compose/sources";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/editor/rich-text-editor";
import { PRIVACY_ICON, PRIVACY_LABEL } from "@/components/feed/privacy";
import { IconButton } from "@/components/icon-button";
import { Text, TextInput } from "@/components/text";
import { ThreadPost } from "@/components/thread/post";
import { useComposerMedia } from "@/hooks/use-composer-media";
import { lastKeyboardHeight as lastSeenKeyboardHeight } from "@/hooks/use-keyboard-height";
import { isOffline } from "@/lib/connectivity";
import { enqueueOutbox, getStore } from "@/lib/local-store";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The composer — web's `FullPagePromptInput`, which is what web shows on a
 * phone, so the two are the same screen rather than the same idea.
 *
 * Top to bottom: a bar with close, the privacy chip and — for a new prompt or
 * an edit — the send button; a row saying who is posting, with the song,
 * attach and GIF buttons on its right; the editor, filling what is left; the
 * toolbar; and, when asked for, the GIF tray where the keyboard was. Every
 * sheet web opens from here opens here — who to post as, who may see it,
 * which friends, which song, "who's posting?" — as the trays `AGENTS.md` asks
 * for.
 *
 * A comment or reply sends from that row instead, beside GIF, with a round
 * button that springs in once there is something to send — the chat
 * composer's rule. The input is where the thumb already is; the top corner of
 * the page is the one place it is not.
 *
 * ## Rising with the keyboard
 *
 * The page is lifted by the keyboard's height, and Android only reports that
 * height once the keyboard has finished sliding in. Lifted from the report,
 * the input moved a beat after the keyboard. So a line taking focus predicts
 * the lift from the last keyboard seen — as the chat composer does — and the
 * real height corrects it when it arrives.
 *
 * The lift lives in `KeyboardLift`, not here, and that matters as much as the
 * prediction. Held in this component, every change to it re-rendered the whole
 * page — the post being answered, the editor, every sheet — and measured on a
 * device the new margin reached the screen 140 ms after the render that asked
 * for it, which is the whole of the keyboard's slide. `KeyboardLift` is given
 * the page as `children`, so a lift re-renders one view and nothing inside it.
 *
 * ## Four things it can be
 *
 * A new prompt, a comment on one, a reply in a thread, or an edit of any of
 * those. Web splits the last across `PromptInput` and `UpdatePromptForm`;
 * this takes a `mode` and hides what does not apply: a comment has no
 * privacy and no song, an edit has no sender. What every mode shares — the
 * editor, the media, the send — is the reason there is one component.
 *
 * ## Sending
 *
 * Web's rules, in web's order. An empty body is refused before anything is
 * sent. Posting as *yourself* from a composer that offered characters too
 * asks "who's posting?" first (`NovelistConfirmSheet`), because an
 * out-of-character post is one no character can answer. Then `submitPrompt`,
 * and on success the feed is handed the prompt the server returned — or one
 * built from what was sent, so it can be drawn before the next fetch.
 *
 * ## Leaving
 *
 * Closing with words in the box asks first. Web does not; a browser back
 * button is a deliberate act and a phone's swipe is not, and a paragraph
 * lost to a swipe is the kind of loss people do not forgive. Discarding also
 * deletes any pictures that were uploaded for it — see `use-composer-media`.
 */

/**
 * The post a comment or reply answers, drawn above the reply as it is
 * written.
 *
 * Web's mobile comment overlay keeps the prompt on screen over the composer
 * (`PromptThreads` → `CommentS.PageContainer`), because a reply written
 * without the thing it replies to in view is a reply to memory. Just enough
 * of the post to draw a `ThreadPost`.
 */
export interface ComposerParent {
  /**
   * What the reader is answering. A thread's reply composer shows the *latest
   * reply* — the turn being answered — rather than the opening comment, and
   * falls back to the comment only when nobody has replied yet.
   */
  variant: "prompt" | "comment" | "reply";
  id: string;
  author: PromptSource;
  createdOn: string;
  media?: string | null;
  reacted: boolean;
  reactions: number;
  text: string;
}

export type ComposerMode =
  | {
      kind: "create";
      type: SubmitPromptType;
      /** The prompt (for a comment) or comment (for a reply) this answers. */
      parentId?: string;
      /** That post, to show above the reply. Turns on the compact shape. */
      parent?: ComposerParent;
      dropdownSelection: DropdownSelection;
      initialSource?: PromptSource;
    }
  | {
      kind: "edit";
      type: SubmitPromptType;
      id: string;
      html: string;
    };

const TITLE: Record<SubmitPromptType, string> = {
  comment: "New comment",
  prompt: "New prompt",
  reply: "Reply",
};

/** Web's `promptTypeToButtonText`. */
const BUTTON: Record<SubmitPromptType, string> = {
  comment: "Comment",
  prompt: "Post",
  reply: "Reply",
};

/** Web's `promptTypeToLabel` on the sender control. */
const AS_LABEL: Record<SubmitPromptType, string> = {
  comment: "Comment as",
  prompt: "Post as",
  reply: "Reply as",
};

/** How long a guessed lift is held before deciding no keyboard is coming. */

const toChoice = (source: PromptSource): MessageSenderChoice => ({
  id: source.sourceId,
  image: source.avatar?.src ?? source.image ?? null,
  name: source.name,
  type: source.sourceType,
});

export const PromptComposer = ({
  mode,
  onClose,
  onEdited,
  onSent,
}: {
  /** Null keeps the composer closed and unmounted. */
  mode: ComposerMode | null;
  onClose: () => void;
  onEdited?: (id: string, html: string, type: SubmitPromptType) => void;
  onSent?: (prompt: Prompt, type: SubmitPromptType) => void;
}) => {
  if (!mode) return null;
  return (
    <ComposerScreen
      mode={mode}
      onClose={onClose}
      onEdited={onEdited}
      onSent={onSent}
    />
  );
};

const ComposerScreen = ({
  mode,
  onClose,
  onEdited,
  onSent,
}: {
  mode: ComposerMode;
  onClose: () => void;
  onEdited?: (id: string, html: string, type: SubmitPromptType) => void;
  onSent?: (prompt: Prompt, type: SubmitPromptType) => void;
}) => {
  const theme = useAppTheme();
  const api = useApi();
  const insets = useSafeAreaInsets();
  const { novelist } = useSession();
  /** Drives the keyboard lift without re-rendering this page — see `KeyboardLift`. */
  const liftRef = useRef<KeyboardLiftHandle>(null);

  const editor = useRef<RichTextEditorHandle>(null);
  /*
   * Whether there is text, not the text. The HTML used to live here as state,
   * set on every keystroke — which re-rendered this whole screen, handed the
   * editor new props and re-rendered it too, for each character. The editor
   * holds the document; this asks for the HTML when it is sending or closing.
   */
  const [hasText, setHasText] = useState(
    mode.kind === "edit" ? mode.html.length > 0 : false,
  );
  const currentHtml = useCallback(
    () => editor.current?.getHtml() ?? (mode.kind === "edit" ? mode.html : ""),
    [mode],
  );
  const [sending, setSending] = useState(false);
  const [trayTab, setTrayTab] = useState<TrayTab | null>(null);
  const [sheet, setSheet] = useState<
    "sender" | "privacy" | "song" | "confirm" | "attach" | null
  >(null);

  const type = mode.type;
  const creating = mode.kind === "create";
  const parent = mode.kind === "create" ? mode.parent : undefined;
  const selection: DropdownSelection =
    mode.kind === "create" ? mode.dropdownSelection : "ALL";

  // ─── Who is posting ──────────────────────────────────────────────────────

  const sources = useMemo(
    () => sourcesFor(novelist, selection),
    [novelist, selection],
  );
  const [source, setSource] = useState<PromptSource | undefined>(
    () =>
      (mode.kind === "create" ? mode.initialSource : undefined) ?? sources[0],
  );

  // A character created from the "who's posting?" sheet arrives through the
  // session query; the sources rebuild, and the pick has to follow them.
  useEffect(() => {
    setSource((current) => {
      if (current && sources.some((s) => s.sourceId === current.sourceId)) {
        return current;
      }
      return sources[0];
    });
  }, [sources]);

  const novelistSource = sources.find((s) => s.sourceType === "NOVELIST");
  const hasMuseOptions = sources.some((s) => s.sourceType === "MUSE");
  const locked = sources.length <= 1;
  const isOOC = source?.sourceType === "NOVELIST";
  const museRequired = creating && selection === "MUSE" && !hasMuseOptions;

  // ─── Privacy and song (prompts only) ─────────────────────────────────────

  const [privacy, setPrivacy] = useState<PrivacyLevel>("PUBLIC");
  const [sharedWith, setSharedWith] = useState<Friend[]>([]);
  const [song, setSong] = useState<ProfileSong | null>(null);

  // ─── Media ───────────────────────────────────────────────────────────────

  const media = useComposerMedia({
    onImageFailed: (local) => editor.current?.removeImageBySrc(local),
    onImageInserted: (local) => editor.current?.insertImage(local),
    onImageUploaded: (local, url) =>
      editor.current?.replaceImageSrc(local, url),
  });

  const openTray = useCallback((tab: TrayTab) => {
    Keyboard.dismiss();
    liftRef.current?.predict(false);
    setTrayTab(tab);
  }, []);

  const pickFromTray = useCallback(
    (url: string) => {
      setTrayTab(null);
      if (trayTab === "clip") media.attachUrl(url, "video/mp4");
      else editor.current?.insertImage(url);
    },
    [media, trayTab],
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

  // Names the spell checker must leave alone: the novelist, their muses and
  // friends. Everything a post is likely to name that no dictionary knows.
  const spellIgnore = useMemo(
    () =>
      namesToWords([
        novelist?.username,
        novelist?.firstName,
        novelist?.lastName,
        ...(novelist?.muses ?? []).flatMap((m) => [m.firstName, m.lastName]),
        ...(novelist?.friends ?? []).map((f) => f.username),
      ]),
    [novelist],
  );

  // ─── Sending ─────────────────────────────────────────────────────────────

  const reconcileMedia = media.reconcile;
  const onDocumentChange = useCallback(
    (doc: RichDocument, empty: boolean) => {
      // Same boolean, no render: this only moves when the page goes from
      // empty to not, or back.
      setHasText(!empty);
      reconcileMedia(imageSources(doc));
    },
    [reconcileMedia],
  );

  const hasContent = hasText || Boolean(media.attachment?.url);
  const canSend = hasContent && !media.isUploading && !sending;

  const send = useCallback(
    async (from: PromptSource) => {
      if (mode.kind !== "create") return;
      const payload: SubmitPromptInput = {
        media: media.attachment?.url ?? "",
        source: from,
        text: currentHtml(),
      };
      if (type === "prompt") {
        payload.privacy = privacy;
        payload.sharedWith = sharedWith;
        // Songs attach to prompts only — never comments or replies.
        payload.featuredSong = song;
      } else if (type === "comment") {
        payload.promptId = mode.parentId;
      } else {
        payload.commentId = mode.parentId;
      }

      // No network: into the outbox (`local-store/outbox.ts`). The feed, the
      // comment list or the thread draws it as waiting, and it goes out the
      // way this would have the moment there is a connection. A picture
      // cannot wait — it uploads when picked — so an offline post is words.
      const store = getStore();
      if (isOffline() && store) {
        await enqueueOutbox(store, {
          kind: "post",
          parent: parent
            ? { author: parent.author.name, text: parent.text }
            : null,
          payload,
          type,
        }).catch(() => undefined);
        media.commit();
        onClose();
        return;
      }

      setSending(true);
      const response = await submitPrompt(api, payload, type).catch(() => ({
        message: API_MESSAGE.Error,
      }));
      setSending(false);

      if (response.message !== API_MESSAGE.Success) {
        Alert.alert("Could not send", submitErrorText(response.message));
        return;
      }

      media.commit();
      onSent?.(
        "prompt" in response && response.prompt
          ? response.prompt
          : buildOptimisticPrompt(from, payload),
        type,
      );
      onClose();
    },
    [
      api,
      currentHtml,
      media,
      mode,
      onClose,
      onSent,
      privacy,
      sharedWith,
      song,
      type,
    ],
  );

  const save = useCallback(async () => {
    if (mode.kind !== "edit") return;
    setSending(true);
    const html = currentHtml();
    const result = await updatePromptComment(api, mode.id, html, type).catch(
      () => ({ message: API_MESSAGE.Error }),
    );
    setSending(false);
    if (result.message !== API_MESSAGE.Success) {
      Alert.alert("Could not save", submitErrorText(result.message));
      return;
    }
    media.commit();
    onEdited?.(mode.id, html, type);
    onClose();
  }, [api, currentHtml, media, mode, onClose, onEdited, type]);

  const submit = useCallback(() => {
    if (!currentHtml()) {
      Alert.alert("Nothing to send", "Prompt body cannot be empty.");
      return;
    }
    if (mode.kind === "edit") {
      void save();
      return;
    }
    if (!source) return;
    // Web's rule: a composer that offered both, about to post as yourself,
    // asks. One that only ever offered the novelist does not.
    if (selection === "ALL" && source.sourceType === "NOVELIST") {
      setSheet("confirm");
      return;
    }
    void send(source);
  }, [currentHtml, mode.kind, save, selection, send, source]);

  const requestClose = useCallback(() => {
    const dirty =
      mode.kind === "edit" ? currentHtml() !== mode.html : hasContent;
    if (!dirty) {
      onClose();
      return;
    }
    Alert.alert(
      mode.kind === "edit" ? "Discard changes?" : "Discard this post?",
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
  }, [currentHtml, hasContent, media, mode, onClose]);

  const onCharacterCreated = useCallback(
    (muse: Muse) => setSource(museToSource(muse)),
    [],
  );

  const placeholder =
    type === "prompt"
      ? "Type your story here... @mention"
      : (isOOC ? COMMENT_OOC_PLACEHOLDERS : COMMENT_PLACEHOLDERS)[0];

  const buttonLabel = sending
    ? "Sending..."
    : media.isUploading
      ? "Uploading..."
      : mode.kind === "edit"
        ? "Save"
        : BUTTON[type];

  /*
   * A comment or reply sends from beside the GIF button, and only once there
   * is something to send. Kept mounted while it scales away, or it would
   * vanish on the frame the box empties with nothing left to animate.
   */
  const inlineSend = creating && type !== "prompt";
  const wantsSend = hasContent || sending || media.isUploading;
  const sendScale = useRef(new Animated.Value(0)).current;
  const [sendVisible, setSendVisible] = useState(false);
  useEffect(() => {
    if (!inlineSend) return;
    if (wantsSend) setSendVisible(true);
    Animated.spring(sendScale, {
      bounciness: wantsSend ? 10 : 0,
      speed: 24,
      toValue: wantsSend ? 1 : 0,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !wantsSend) setSendVisible(false);
    });
  }, [inlineSend, sendScale, wantsSend]);

  return (
    <Modal
      animationType="slide"
      onRequestClose={requestClose}
      presentationStyle="fullScreen"
      statusBarTranslucent
      visible
    >
      {/*
        The whole window painted in the theme, not only the page. A modal's
        own window is white, and the media tray is laid *beside* the page at
        the foot of the window — so its rounded corners showed the white
        through, where the chat screen's tray sits on a themed screen and
        never did.
      */}
      <View style={[styles.shell, { backgroundColor: theme.background }]}>
        <KeyboardLift
          backgroundColor={theme.background}
          insetBottom={insets.bottom}
          // The top bar paints the status bar's strip itself.
          insetTop={0}
          ref={liftRef}
          trayOpen={trayTab !== null}
        >
          {/* ── Top bar ─────────────────────────────────────────────────── */}
          {/*
            The stack headers' own surface (`glassHeaderOptions`): the opaque
            glass colour and one hairline along the foot, painted up through
            the status bar so the bar and the strip above it are one colour.

            Not a `GlassSurface`. This bar sits in the page's column with
            nothing passing under it, so a blur had only the flat page to
            sample and came out as a grey band unlike every other header —
            and on iOS 26 the system's glass drew a rim all the way round it.
          */}
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
              {mode.kind === "edit" ? `Edit ${type}` : TITLE[type]}
            </Text>

            <View style={styles.topRight}>
              {creating && type === "prompt" && !museRequired ? (
                <Pressable
                  hitSlop={space.sm}
                  accessibilityLabel={`Privacy: ${PRIVACY_LABEL[privacy]}`}
                  accessibilityRole="button"
                  onPress={() => setSheet("privacy")}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor: pressed
                        ? theme.glass.fillPressed
                        : theme.glass.fillHover,
                      borderColor: theme.glass.edge,
                    },
                  ]}
                >
                  <Ionicons
                    color={theme.textGray}
                    name={PRIVACY_ICON[privacy]}
                    size={14}
                  />
                  <Text style={[styles.chipLabel, { color: theme.text }]}>
                    {PRIVACY_LABEL[privacy]}
                  </Text>
                  <Ionicons
                    color={theme.textGray}
                    name="chevron-down"
                    size={12}
                  />
                </Pressable>
              ) : null}

              {/* Balances the close button, so the title stays centred. */}
              {inlineSend ? <View style={styles.barSpacer} /> : null}

              {!museRequired && !inlineSend ? (
                <Pressable
                  hitSlop={space.sm}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !canSend }}
                  disabled={!canSend}
                  onPress={submit}
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
                      {buttonLabel}
                    </Text>
                  )}
                </Pressable>
              ) : null}
            </View>
          </View>

          {museRequired ? (
            <MuseRequired onCreated={onCharacterCreated} />
          ) : (
            <>
              {/*
              What is being answered, kept on screen while the answer is
              written. The reply itself is docked under it, compact, so the
              post stays in view until the reply is long enough to need the
              room.
            */}
              {parent ? (
                <ScrollView
                  contentContainerStyle={styles.parentContent}
                  keyboardShouldPersistTaps="handled"
                  style={styles.parent}
                >
                  <ThreadPost
                    author={parent.author}
                    createdOn={parent.createdOn}
                    id={parent.id}
                    media={parent.media}
                    reacted={parent.reacted}
                    reactions={parent.reactions}
                    text={parent.text}
                    variant={parent.variant}
                  />
                </ScrollView>
              ) : null}

              <View
                style={
                  parent
                    ? [styles.replyDock, { borderTopColor: theme.glass.edge }]
                    : styles.fill
                }
              >
                {/* ── Meta row ──────────────────────────────────────────────── */}
                {creating ? (
                  <View style={styles.meta}>
                    <Pressable
                      accessibilityHint={
                        locked ? undefined : "Choose who this is posted as"
                      }
                      accessibilityLabel={`${AS_LABEL[type]} ${source?.name ?? ""}`}
                      accessibilityRole="button"
                      disabled={locked}
                      onPress={() => setSheet("sender")}
                      style={({ pressed }) => [
                        styles.sender,
                        {
                          backgroundColor: pressed
                            ? theme.glass.fillPressed
                            : theme.glass.fillHover,
                          borderColor: isOOC
                            ? theme.glass.edge
                            : theme.accent.surfaceHover,
                        },
                      ]}
                    >
                      <Avatar
                        name={source?.name}
                        size={32}
                        image={source?.avatar}
                        uri={source?.avatar?.src ?? source?.image}
                      />
                      <View style={styles.senderText}>
                        <Text
                          style={[
                            styles.senderEyebrow,
                            {
                              color: isOOC ? theme.textGray : theme.accent.text,
                            },
                          ]}
                        >
                          {isOOC ? "OUT OF CHARACTER" : "IN CHARACTER"}
                        </Text>
                        <Text
                          numberOfLines={1}
                          style={[styles.senderName, { color: theme.text }]}
                        >
                          {source?.name}
                        </Text>
                      </View>
                      {locked ? (
                        <Text
                          style={[
                            styles.lockedLabel,
                            { color: theme.textGray },
                          ]}
                        >
                          {isOOC ? "OOC only" : "IC only"}
                        </Text>
                      ) : (
                        <Ionicons
                          color={theme.textGray}
                          name="swap-horizontal"
                          size={16}
                        />
                      )}
                    </Pressable>

                    <View style={styles.metaRight}>
                      {type === "prompt" ? (
                        <Pressable
                          hitSlop={space.xs}
                          accessibilityLabel={
                            song ? "Change song" : "Add a song"
                          }
                          accessibilityRole="button"
                          onPress={() => setSheet("song")}
                          style={({ pressed }) => [
                            styles.iconButton,
                            {
                              backgroundColor: song
                                ? theme.accent.surfaceActive
                                : pressed
                                  ? theme.glass.fillPressed
                                  : theme.glass.fillHover,
                              borderColor: song
                                ? theme.accent.solid
                                : theme.glass.edge,
                            },
                          ]}
                        >
                          <Ionicons
                            color={song ? theme.accent.textStrong : theme.text}
                            name="musical-notes-outline"
                            size={18}
                          />
                        </Pressable>
                      ) : null}

                      {/*
                    One button for a photo or a video, as web's paperclip is
                    one input for both: which it is decides where it goes — a
                    picture into the text, a video under it — and that is the
                    composer's decision, not the reader's.
                  */}
                      <Pressable
                        hitSlop={space.xs}
                        accessibilityLabel="Attach a photo or video"
                        accessibilityRole="button"
                        onPress={() => setSheet("attach")}
                        style={({ pressed }) => [
                          styles.iconButton,
                          {
                            backgroundColor: media.attachment
                              ? theme.accent.surfaceActive
                              : pressed
                                ? theme.glass.fillPressed
                                : theme.glass.fillHover,
                            borderColor: media.attachment
                              ? theme.accent.solid
                              : theme.glass.edge,
                          },
                        ]}
                      >
                        <Ionicons
                          color={
                            media.attachment
                              ? theme.accent.textStrong
                              : theme.text
                          }
                          name="attach-outline"
                          size={20}
                        />
                      </Pressable>

                      <Pressable
                        hitSlop={space.xs}
                        accessibilityLabel="Insert a GIF"
                        accessibilityRole="button"
                        onPress={() => openTray("gif")}
                        style={({ pressed }) => [
                          styles.iconButton,
                          {
                            backgroundColor:
                              trayTab !== null
                                ? theme.accent.surfaceActive
                                : pressed
                                  ? theme.glass.fillPressed
                                  : theme.glass.fillHover,
                            borderColor:
                              trayTab !== null
                                ? theme.accent.solid
                                : theme.glass.edge,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.gifLabel,
                            {
                              color:
                                trayTab !== null
                                  ? theme.accent.textStrong
                                  : theme.text,
                            },
                          ]}
                        >
                          GIF
                        </Text>
                      </Pressable>

                      {inlineSend && sendVisible ? (
                        <Animated.View
                          style={{ transform: [{ scale: sendScale }] }}
                        >
                          <IconButton
                            accessibilityLabel={buttonLabel}
                            busy={sending || media.isUploading}
                            disabled={!canSend}
                            hitSlop={space.xs}
                            icon="send"
                            iconSize={16}
                            onPress={submit}
                            size={36}
                            tone="primary"
                          />
                        </Animated.View>
                      ) : null}
                    </View>
                  </View>
                ) : null}

                {creating && privacy === "CUSTOM" && sharedWith.length > 0 ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setSheet("privacy")}
                    style={styles.sharedWith}
                  >
                    <Ionicons
                      color={theme.textGray}
                      name="share-social-outline"
                      size={14}
                    />
                    <View style={styles.sharedFaces}>
                      {sharedWith.slice(0, 3).map((friend) => (
                        <Avatar
                          key={friend.id}
                          name={friend.firstName}
                          size={22}
                          image={friend.avatar}
                          uri={friend.avatar?.src ?? friend.image}
                        />
                      ))}
                    </View>
                    <Text
                      style={[styles.sharedLabel, { color: theme.textGray }]}
                    >
                      {sharedWith.length > 3
                        ? `and ${sharedWith.length - 3} more`
                        : `${sharedWith.length} friend${sharedWith.length === 1 ? "" : "s"}`}
                    </Text>
                  </Pressable>
                ) : null}

                {/* ── Editor ────────────────────────────────────────────────── */}
                <RichTextEditor
                  footer={
                    <View style={styles.footer}>
                      {media.attachment ? (
                        <View
                          style={[
                            styles.attachment,
                            {
                              backgroundColor: theme.glass.fillHover,
                              borderColor: media.attachment.failed
                                ? theme.error
                                : theme.glass.edge,
                            },
                          ]}
                        >
                          {media.attachment.uploading ? (
                            <ActivityIndicator
                              color={theme.primary}
                              size="small"
                            />
                          ) : (
                            <Ionicons
                              color={
                                media.attachment.failed
                                  ? theme.error
                                  : theme.accent.text
                              }
                              name="videocam"
                              size={18}
                            />
                          )}
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.attachmentLabel,
                              { color: theme.text },
                            ]}
                          >
                            {media.attachment.uploading
                              ? "Uploading video…"
                              : media.attachment.failed
                                ? "Upload failed"
                                : "Video attached"}
                          </Text>
                          <Pressable
                            accessibilityLabel="Remove video"
                            hitSlop={space.sm}
                            onPress={media.removeAttachment}
                          >
                            <Ionicons
                              color={theme.textGray}
                              name="close"
                              size={18}
                            />
                          </Pressable>
                        </View>
                      ) : null}

                      {song ? (
                        <View
                          style={[
                            styles.attachment,
                            {
                              backgroundColor: theme.glass.fillHover,
                              borderColor: theme.glass.edge,
                            },
                          ]}
                        >
                          <Ionicons
                            color={theme.accent.text}
                            name="musical-note"
                            size={18}
                          />
                          <View style={styles.attachmentText}>
                            <Text
                              numberOfLines={1}
                              style={[
                                styles.attachmentLabel,
                                { color: theme.text },
                              ]}
                            >
                              {song.title}
                            </Text>
                            {song.artist ? (
                              <Text
                                numberOfLines={1}
                                style={[
                                  styles.attachmentMeta,
                                  { color: theme.textGray },
                                ]}
                              >
                                {song.artist}
                              </Text>
                            ) : null}
                          </View>
                          <Pressable
                            accessibilityLabel="Remove song"
                            hitSlop={space.sm}
                            onPress={() => setSong(null)}
                          >
                            <Ionicons
                              color={theme.textGray}
                              name="close"
                              size={18}
                            />
                          </Pressable>
                        </View>
                      ) : null}
                    </View>
                  }
                  initialHtml={mode.kind === "edit" ? mode.html : undefined}
                  mentionTabs={mentionTabs}
                  onDocumentChange={onDocumentChange}
                  onFocusChange={(focused) => liftRef.current?.predict(focused)}
                  spellIgnore={spellIgnore}
                  compact={Boolean(parent)}
                  placeholder={placeholder}
                  ref={editor}
                  uploadingSources={media.uploadingSources}
                />
              </View>
            </>
          )}
        </KeyboardLift>

        <MediaTrayInline
          keyboardHeight={lastSeenKeyboardHeight()}
          onClose={() => setTrayTab(null)}
          onRequestKeyboard={() => {
            setTrayTab(null);
            // The keyboard is on its way; start rising for it now.
            liftRef.current?.predict(true);
            editor.current?.focus();
          }}
          onSelect={pickFromTray}
          onTabChange={setTrayTab}
          tab={trayTab}
        />

        <ActionMenu
          items={[
            {
              icon: "image-outline",
              label: "Photo — into the text",
              onPress: () => {
                setSheet(null);
                void media.pickImage();
              },
            },
            {
              icon: "videocam-outline",
              label: "Video — under the post",
              onPress: () => {
                setSheet(null);
                void media.pickVideo();
              },
            },
          ]}
          onClose={() => setSheet(null)}
          title="Attach"
          visible={sheet === "attach"}
        />

        {creating ? (
          <SenderPicker
            onClose={() => setSheet(null)}
            onSelect={(choice) => {
              setSource(
                sources.find((s) => s.sourceId === choice.id) ?? source,
              );
              setSheet(null);
            }}
            selected={source ? toChoice(source) : null}
            senders={sources.map(toChoice)}
            visible={sheet === "sender"}
          />
        ) : null}

        {creating && type === "prompt" ? (
          <>
            <PrivacySheet
              friends={novelist?.friends ?? []}
              onChange={(level, friends) => {
                setPrivacy(level);
                setSharedWith(friends);
              }}
              onClose={() => setSheet(null)}
              selected={sharedWith}
              value={privacy}
              visible={sheet === "privacy"}
            />
            <SongSheet
              onClose={() => setSheet(null)}
              onSelect={setSong}
              visible={sheet === "song"}
            />
          </>
        ) : null}

        {creating ? (
          <NovelistConfirmSheet
            hasMuseOptions={hasMuseOptions}
            novelistSource={novelistSource}
            onCharacterCreated={onCharacterCreated}
            onClose={() => setSheet(null)}
            onPostAsNovelist={() => {
              if (novelistSource) void send(novelistSource);
            }}
            onSelectCharacter={() => setSheet("sender")}
            visible={sheet === "confirm"}
          />
        ) : null}
      </View>
    </Modal>
  );
};

export interface KeyboardLiftHandle {
  /** A line took the keyboard (true) or let it go (false). */
  predict: (keyboardComing: boolean) => void;
}

/**
 * The page, lifted above the keyboard — and the only thing that re-renders
 * when the lift changes. See "Rising with the keyboard" at the top.
 *
 * Everything the lift depends on is read here rather than in the composer:
 * the keyboard's height, the prediction and its grace period. The composer
 * only says when a line gains or loses focus, through the handle.
 */
export const KeyboardLift = forwardRef<
  KeyboardLiftHandle,
  {
    backgroundColor: string;
    children: ReactNode;
    insetBottom: number;
    insetTop: number;
    /** The GIF tray takes the keyboard's place; the page does not lift. */
    trayOpen: boolean;
  }
>(function KeyboardLift(
  { backgroundColor, children, insetBottom, insetTop, trayOpen },
  ref,
) {
  // Kept so the composer's calls stay valid; there is nothing to predict any
  // more. The page follows the keyboard itself, below.
  useImperativeHandle(ref, () => ({ predict: () => undefined }), []);

  /*
   * The page's foot rides the keyboard, frame by frame, on the UI thread.
   *
   * It used to be a `marginBottom` set from React state when the keyboard was
   * *about* to show: the toolbar arrived at its final position in one frame
   * and waited over an empty gap while the keyboard slid up underneath it,
   * and the guess that got it there needed a grace timer and a forced blur to
   * stay honest. `KeyboardAvoidingView` here is keyboard-controller's — the
   * one written for an edge-to-edge window — and its padding is the
   * keyboard's own animated height, so there is no guess to be wrong.
   *
   * The offset gives back the navigation bar: the keyboard's height includes
   * it, and the page's own bottom padding already covers it.
   *
   * ## iOS takes the other road
   *
   * Riding the keyboard frame by frame means a layout of this whole page —
   * the post being answered, the editor, the toolbar — on every frame. On
   * Android the keyboard's slide runs on the same thread as that layout, so
   * a slow frame slows both and they stay together. On iOS the keyboard is
   * animated by the system, outside the app, and does not wait: the page fell
   * behind it, and the editor was seen shrinking after the keyboard had
   * already arrived.
   *
   * So on iOS the page is laid out once. React Native's own avoiding view
   * hears `keyboardWillChangeFrame`, sets the padding a single time and has
   * the system animate that one layout change on the keyboard's own curve and
   * duration — the two move as one because one animation is driving both. It
   * is the view this app cannot use on Android (an edge-to-edge window is
   * never resized there) and the one that has always worked on iOS.
   */
  const Avoiding =
    Platform.OS === "ios" ? NativeKeyboardAvoidingView : KeyboardAvoidingView;

  return (
    <Avoiding
      behavior="padding"
      enabled={!trayOpen}
      keyboardVerticalOffset={-insetBottom}
      style={[styles.root, { backgroundColor, paddingTop: insetTop }]}
    >
      <View
        style={[styles.root, { paddingBottom: trayOpen ? 0 : insetBottom }]}
      >
        {children}
      </View>
    </Avoiding>
  );
});

const styles = StyleSheet.create({
  attachment: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    padding: space.ms,
  },
  attachmentLabel: {
    flexShrink: 1,
    fontSize: fontSize.label,
    fontWeight: "600",
  },
  attachmentMeta: { fontSize: fontSize.caption },
  attachmentText: { flex: 1, gap: 1 },
  barSpacer: { width: 36 },
  chip: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.xs,
    height: 32,
    paddingHorizontal: space.ms,
  },
  chipLabel: { fontSize: fontSize.caption, fontWeight: "600" },
  fill: { flex: 1 },
  footer: { gap: space.sm, paddingBottom: space.md },
  gifLabel: { fontSize: fontSize.meta, fontWeight: "800", letterSpacing: 0.5 },
  iconButton: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  lockedLabel: { fontSize: fontSize.meta, fontWeight: "700" },
  meta: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingTop: space.sm,
  },
  metaRight: { flexDirection: "row", gap: space.s },
  parent: { flex: 1 },
  parentContent: { padding: space.md },
  replyDock: { borderTopWidth: StyleSheet.hairlineWidth },
  root: { flex: 1 },
  send: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 32,
    justifyContent: "center",
    minWidth: 72,
    paddingHorizontal: space.md,
  },
  sender: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flex: 1,
    flexDirection: "row",
    gap: space.sm,
    minHeight: 44,
    paddingLeft: space.s,
    paddingRight: space.ms,
  },
  senderEyebrow: {
    fontSize: fontSize.meta,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  senderName: { fontSize: fontSize.label, fontWeight: "700" },
  senderText: { flex: 1, gap: 1, minWidth: 0 },
  sendLabel: { color: "#ffffff", fontSize: fontSize.label, fontWeight: "700" },
  sharedFaces: { flexDirection: "row", gap: space.xxs },
  sharedLabel: { fontSize: fontSize.caption },
  sharedWith: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.s,
    paddingHorizontal: space.md,
    paddingTop: space.sm,
  },
  shell: { flex: 1 },
  title: {
    flex: 1,
    fontSize: fontSize.body,
    fontWeight: "700",
    textAlign: "center",
  },
  topBar: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  topRight: { alignItems: "center", flexDirection: "row", gap: space.sm },
});
