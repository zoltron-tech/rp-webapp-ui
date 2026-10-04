import { Ionicons } from "@expo/vector-icons";
import {
  hasMarkdown,
  iceBreakerSources,
  isOwnIceBreaker,
  markdownToHtml,
  parseIceBreakerTimestamp,
} from "@nw/chat";
import { useSession } from "@nw/features";
import type { IceBreaker } from "@nw/types";
import { toFormattedDate } from "@nw/utils";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { Avatar } from "@/components/avatar";
import {
  IceBreakerTrail,
  useIceBreakerPaint,
} from "@/components/chat/ice-breaker-paint";
import { MarkdownInput } from "@/components/chat/markdown-input";
import {
  QuickAddMuseError,
  QuickAddMuseRow,
} from "@/components/chat/quick-add-muse-row";
import { SourcePicker } from "@/components/chat/source-picker";
import { GradientSurface } from "@/components/gradient-surface";
import { BottomSheet } from "@/components/sheet";
import { useChatSocket } from "@/context/socket";
import {
  useDeleteIceBreaker,
  useReplyToIceBreaker,
} from "@/hooks/use-ice-breakers";
import { useQuickAddMuse } from "@/hooks/use-quick-add-muse";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";
import { IconButton } from "@/components/icon-button";

/**
 * One ice breaker, opened.
 *
 * The sheet is two different screens depending on whose it is, and that is the
 * whole design: you cannot answer your own prompt, so an owner gets a delete
 * and everyone else gets a reply box. Offering both to everybody would mean a
 * reply control that fails on the server and a delete that is not yours.
 *
 * ## Replying starts the conversation
 *
 * There may be no thread with this person yet. Sending creates it, posts the
 * answer tagged as a reply to the prompt, and pushes you into it — one action
 * from "a line on a rail" to "a conversation in progress", which is the entire
 * point of the feature. `useReplyToIceBreaker` owns that sequence.
 *
 * Socket-only, so the send is disabled rather than optimistic while the
 * connection is down: a reply that quietly failed would leave someone believing
 * they had started a conversation that does not exist.
 */
export const IceBreakerSheet = ({
  iceBreaker,
  onClose,
  onReplied,
}: {
  /** Null closes the sheet. */
  iceBreaker: IceBreaker | null;
  onClose: () => void;
  /** Handed the conversation the reply started or continued. */
  onReplied: (conversationId: string) => void;
}) => {
  const theme = useAppTheme();
  const { novelist } = useSession();
  const { isConnected } = useChatSocket();
  const deleteIceBreaker = useDeleteIceBreaker();
  const reply = useReplyToIceBreaker();

  // "accent", not "card": web fills a colourless bubble with the accent
  // gradient inside a dialog and with `--bg-3` on the rail. A dialog is a
  // surface of its own, where the accent is what says "this is what you
  // opened"; the rail sits over the page, where a row of accent bubbles would
  // read as a row of buttons.
  const paint = useIceBreakerPaint(iceBreaker?.color, "accent");
  const sources = useMemo(() => iceBreakerSources(novelist), [novelist]);
  const [sourceId, setSourceId] = useState<string | undefined>();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [museName, setMuseName] = useState("");
  const [addingMuse, setAddingMuse] = useState(false);
  const addMuse = useQuickAddMuse();

  const source =
    sources.find((entry) => entry.sourceId === sourceId) ?? sources[0];

  // A draft belongs to the prompt it answers, so it clears when the sheet moves
  // to a different one — not when it closes, which would lose a reply to a
  // mis-tap on the backdrop. Keyed on the ice breaker rather than run once on
  // mount: this component is mounted for the life of the inbox screen, so an
  // empty dependency list left the previous prompt's draft sitting in the next
  // one's field.
  const openedId = iceBreaker?.sourceId;
  const resetAddMuse = addMuse.reset;
  useEffect(() => {
    if (!openedId) return;
    setMessage("");
    setSourceId(undefined);
    setAddingMuse(false);
    setMuseName("");
    resetAddMuse();
  }, [openedId, resetAddMuse]);

  const mine = iceBreaker ? isOwnIceBreaker(iceBreaker, novelist) : false;
  const trimmed = message.trim();
  const canSend =
    Boolean(trimmed) && Boolean(source) && isConnected && !sending;

  const send = async () => {
    if (!iceBreaker || !source || !canSend) return;
    setSending(true);
    const conversationId = await reply({
      iceBreaker,
      /*
       * Converted, exactly as the chat composer converts what it sends.
       *
       * A reply is an ordinary chat message once it lands, and chat messages
       * are stored as rich-text HTML — web's dialog sends `replyHtml` for the
       * same reason. Sending the raw markdown here would put a message reading
       * `**hello**`, asterisks and all, at the top of a conversation that has
       * nothing else in it.
       */
      message: hasMarkdown(trimmed) ? markdownToHtml(trimmed) : trimmed,
      source,
    });
    setSending(false);

    if (!conversationId) {
      Alert.alert(
        "Not sent",
        "The reply could not be sent. Check your connection and try again.",
      );
      return;
    }

    setMessage("");
    onClose();
    onReplied(conversationId);
  };

  const createMuse = () => {
    const name = museName.trim();
    if (!name || addMuse.isPending) return;

    addMuse
      .mutateAsync(name)
      .then((muse) => {
        // Selected straight away: someone who has just named a character meant
        // to answer as them.
        setSourceId(muse.id ?? undefined);
        setAddingMuse(false);
        setMuseName("");
      })
      .catch(() => {
        // Reported under the field by `QuickAddMuseError` rather than in an
        // alert over a sheet with the keyboard up.
      });
  };

  const confirmDelete = () => {
    if (!iceBreaker) return;
    Alert.alert(
      "Delete ice breaker?",
      "This can't be undone.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: () => {
            deleteIceBreaker
              .mutateAsync(iceBreaker.sourceId)
              .then(onClose)
              .catch(() =>
                Alert.alert(
                  "Not deleted",
                  "The ice breaker could not be deleted. Try again.",
                ),
              );
          },
          style: "destructive",
          text: "Delete",
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <BottomSheet
      maxHeightRatio={0.8}
      onClose={onClose}
      title="Ice breaker"
      visible={iceBreaker !== null}
    >
      {iceBreaker ? (
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <Avatar
              name={iceBreaker.source.name}
              size={56}
              uri={iceBreaker.source.image}
            />
            <Text
              numberOfLines={1}
              style={[styles.author, { color: theme.text }]}
            >
              {iceBreaker.source.name}
            </Text>
          </View>

          {/*
            The prompt, drawn the way the rail draws it — the same gradient and
            the same trailing circles, only larger. Someone who tapped a bubble
            on the rail should land on that bubble; a different treatment here
            reads as having opened something else.

            The trail runs upward, toward the face above it, and sits in flow
            rather than absolutely, so nothing has to know how tall the bubble
            grew with the message in it.
          */}
          <View style={styles.quote}>
            <IceBreakerTrail
              border={paint.border}
              color={paint.from}
              direction="up"
            />

            <GradientSurface
              from={paint.from}
              style={[styles.bubble, { borderColor: paint.border }]}
              to={paint.to}
            >
              <Ionicons
                color={paint.watermark}
                name="chatbubble-ellipses"
                size={22}
                style={styles.watermark}
              />
              <Text style={[styles.message, { color: paint.ink }]}>
                {iceBreaker.message}
              </Text>
            </GradientSurface>

            <Text style={[styles.when, { color: theme.textGray }]}>
              {/* The endpoint sends epoch seconds, not ISO — unparsed, every
                  ice breaker is dated 1970. See `parseIceBreakerTimestamp`. */}
              {toFormattedDate(parseIceBreakerTimestamp(iceBreaker.createdOn))}
            </Text>
          </View>

          {mine ? (
            <Pressable
              accessibilityRole="button"
              onPress={confirmDelete}
              style={({ pressed }) => [
                styles.delete,
                {
                  backgroundColor: pressed
                    ? theme.glass.fillPressed
                    : theme.material.fillTranslucent,
                  borderColor: theme.error,
                },
              ]}
            >
              {deleteIceBreaker.isPending ? (
                <ActivityIndicator color={theme.error} size="small" />
              ) : (
                <Ionicons color={theme.error} name="trash-outline" size={16} />
              )}
              <Text style={[styles.deleteLabel, { color: theme.error }]}>
                Delete this ice breaker
              </Text>
            </Pressable>
          ) : (
            <>
              <SourcePicker
                label="Reply as"
                onAddMuse={() => setAddingMuse(true)}
                onSelect={(next) => setSourceId(next.sourceId)}
                selected={source}
                sources={sources}
              />

              {addingMuse ? (
                <QuickAddMuseRow
                  busy={addMuse.isPending}
                  onCancel={() => {
                    setAddingMuse(false);
                    setMuseName("");
                    addMuse.reset();
                  }}
                  onChange={setMuseName}
                  onConfirm={createMuse}
                  value={museName}
                />
              ) : null}

              {addMuse.isError ? (
                <QuickAddMuseError message="The character could not be created. Try again." />
              ) : null}

              <View style={styles.replyLine}>
                {/* Whose voice this is, beside the field rather than only in
                    the placeholder. Web keeps the face here for the same
                    reason: once the keyboard is up the picker has scrolled
                    away, and sending as the wrong character cannot be undone. */}
                <Avatar name={source?.name} size={32} uri={source?.image} />

                <View
                  style={[
                    styles.replyRow,
                    {
                      backgroundColor: theme.glass.field,
                      borderColor: trimmed
                        ? theme.accent.solid
                        : theme.material.edgeTranslucent,
                    },
                  ]}
                >
                  <MarkdownInput
                    onChangeText={setMessage}
                    placeholder={`Reply as ${source?.name.split(" ")[0] ?? ""}...`}
                    style={styles.replyInput}
                    value={message}
                  />
                  <IconButton
                    accessibilityLabel="Send reply"
                    busy={sending}
                    disabled={!canSend}
                    hitSlop={space.sm}
                    icon="send"
                    iconSize={15}
                    onPress={() => void send()}
                    style={styles.send}
                    tone="primary"
                  />
                </View>
              </View>

              <Text style={[styles.note, { color: theme.textGray }]}>
                {isConnected
                  ? "Replying starts a conversation with them."
                  : "Reconnecting — you can reply once you are back online."}
              </Text>
            </>
          )}
        </ScrollView>
      ) : null}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  author: { fontSize: fontSize.body, fontWeight: "700" },
  body: {
    gap: space.md,
    paddingBottom: space.lg,
    paddingHorizontal: space.md,
  },
  bubble: {
    borderRadius: radius.lg,
    borderWidth: border.edge,
    paddingHorizontal: space.md,
    paddingRight: space.lg,
    paddingVertical: space.ms,
  },
  delete: {
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    justifyContent: "center",
    padding: space.md,
  },
  deleteLabel: { fontSize: fontSize.body, fontWeight: "600" },
  hero: { alignItems: "center", gap: space.xs },
  message: { fontSize: fontSize.body, lineHeight: 21 },
  note: { fontSize: fontSize.meta, textAlign: "center" },
  quote: { gap: space.xs },
  replyInput: {
    flex: 1,
    fontSize: fontSize.body,
    maxHeight: 96,
    paddingHorizontal: space.sm,
    paddingVertical: space.sm,
    textAlignVertical: "top",
  },
  replyLine: { alignItems: "flex-end", flexDirection: "row", gap: space.sm },
  replyRow: {
    alignItems: "flex-end",
    borderRadius: radius.lg,
    borderWidth: border.edge,
    flex: 1,
    flexDirection: "row",
    paddingBottom: space.xs,
    paddingRight: space.xs,
  },
  send: { marginBottom: space.xxs },
  watermark: { position: "absolute", right: space.sm, top: space.sm },
  when: { alignSelf: "flex-end", fontSize: fontSize.caption },
});
