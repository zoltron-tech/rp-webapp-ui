import { Ionicons } from "@expo/vector-icons";
import { type StickerItem, searchStickers } from "@nw/api/endpoints/community";
import { HELLO_STICKER_QUERIES, helloNoticeFor, pickNotice } from "@nw/chat";
import { useApi } from "@nw/features";
import { useEffect, useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * What an empty conversation offers instead of "No messages yet".
 *
 * A thread with nothing in it is the moment a conversation is most likely to
 * never happen. There is no history to react to, the composer is a blank box,
 * and the hardest message to write is the first one — so the screen writes it:
 * a waving sticker, and one tap to send it. Web does exactly this, and the copy
 * and the search terms are shared (`@nw/chat/notices`) so the two clients open
 * the same empty room the same way.
 *
 * ## The sticker is fetched here, not globally
 *
 * Web resolves the hello stickers once at layout level and keeps them in its
 * global store, because on the web the conversation list and the thread are on
 * screen together and the fetch is amortised. On a phone a conversation is a
 * screen you push, and this component only mounts when a thread is *actually*
 * empty — which is rare — so a global prefetch would be a request every session
 * for something almost nobody sees.
 *
 * ## Nothing is shown until something loads
 *
 * No spinner, no placeholder box. An empty thread is already quiet, and a
 * loading state over it draws attention to the wait rather than to the
 * conversation. If the search fails the notice appears alone: the words are the
 * useful part, and the sticker is the shortcut.
 */

/** Enough to pick from without paying for a page nobody scrolls. */
const SEARCH_LIMIT = 20;

export const HelloState = ({
  conversationId,
  disabled,
  onSend,
}: {
  conversationId: string;
  disabled?: boolean;
  /** Sends the sticker as the message body, exactly as the picker does. */
  onSend: (stickerUrl: string) => void;
}) => {
  const theme = useAppTheme();
  const api = useApi();
  const [sticker, setSticker] = useState<StickerItem | null>(null);

  // Seeded on the conversation, like the retention notice: a `Math.random()`
  // here would reshuffle the line on every keystroke in the composer above it.
  const notice = useMemo(
    () => helloNoticeFor(conversationId),
    [conversationId],
  );

  useEffect(() => {
    let cancelled = false;
    const query = pickNotice([...HELLO_STICKER_QUERIES], conversationId);

    searchStickers(api, query, SEARCH_LIMIT)
      .then((page) => {
        if (cancelled || page.items.length === 0) return;
        // Picked by conversation too, so the same empty thread greets you with
        // the same face each time you open it rather than a new one.
        setSticker(pickNotice(page.items, conversationId));
      })
      .catch(() => {
        // Non-critical: the notice below stands on its own.
      });

    return () => {
      cancelled = true;
    };
  }, [api, conversationId]);

  return (
    <View style={styles.root}>
      <Pressable
        accessibilityHint="Sends a waving sticker"
        accessibilityLabel="Say hello"
        accessibilityRole="button"
        disabled={disabled || !sticker}
        onPress={() => sticker && onSend(sticker.stickerUrl)}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: theme.material.fillPressed,
            borderColor: theme.material.edge,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text style={[styles.line1, { color: theme.text }]}>
          {notice.line1}
        </Text>
        <Text style={[styles.line2, { color: theme.textGray }]}>
          {notice.line2}
        </Text>

        {sticker ? (
          <>
            <Image
              // The preview, not the full sticker: this is a thumbnail-sized
              // slot and the preview is what the picker's grid draws too.
              resizeMode="contain"
              source={{ uri: sticker.previewUrl }}
              style={styles.sticker}
            />
            <View
              style={[
                styles.cta,
                {
                  backgroundColor: theme.accent.surface,
                  borderColor: theme.accent.surfaceHover,
                },
              ]}
            >
              <Ionicons color={theme.accent.text} name="hand-left" size={14} />
              <Text style={[styles.ctaLabel, { color: theme.accent.text }]}>
                Tap here to say hello
              </Text>
            </View>
          </>
        ) : null}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: border.edge,
    gap: space.xs,
    maxWidth: 320,
    padding: space.lg,
  },
  cta: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.xs,
    marginTop: space.xs,
    paddingHorizontal: space.md,
    paddingVertical: space.s,
  },
  ctaLabel: { fontSize: fontSize.caption, fontWeight: "700" },
  line1: { fontSize: fontSize.body, fontWeight: "700", textAlign: "center" },
  line2: { fontSize: fontSize.caption, textAlign: "center" },
  root: { alignItems: "center", padding: space.lg },
  sticker: { height: 140, marginTop: space.sm, width: 140 },
});
