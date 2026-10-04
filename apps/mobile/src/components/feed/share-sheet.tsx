import { Ionicons } from "@expo/vector-icons";
import { sharePromptToDiscord } from "@nw/api/endpoints/community";
import { useApi, useSession } from "@nw/features";
import { parseRichText, richTextToPlainText } from "@nw/richtext";
import type { Prompt } from "@nw/types";
import { toFormattedDate } from "@nw/utils";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { Avatar } from "@/components/avatar";
import { BottomSheet } from "@/components/sheet";
import { env } from "@/lib/env";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Web's `SharePromptDialog` — already a tray on a phone there, and a tray
 * here.
 *
 * The same four parts in the same order: a preview of the prompt, its link
 * with a copy button, "Share in Community" (the NW Discord, through the same
 * endpoint), and the platform's own share sheet as "More options". The link
 * is the web one — a prompt opens in a browser, not in this app, until there
 * is a route for it to land on.
 *
 * The excerpt is `richTextToPlainText` over the parsed body rather than web's
 * regex over the HTML: same words, and the one parser rather than a second
 * opinion about what a `<br>` is worth.
 */

type ShareState =
  | { status: "idle" }
  | { status: "sharing" }
  | { status: "success"; messageUrl: string }
  | { status: "error" };

/** Web's `ROUTES.Prompt.View`. */
const promptUrl = (promptId: string) => `${env.WEB_URL}/rp/prompt/${promptId}`;

export const ShareSheet = ({
  onClose,
  prompt,
}: {
  onClose: () => void;
  /** Null closes the sheet. */
  prompt: Prompt | null;
}) => {
  const theme = useAppTheme();
  const api = useApi();
  const { novelist } = useSession();
  const [copied, setCopied] = useState(false);
  const [state, setState] = useState<ShareState>({ status: "idle" });
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Transient state is reset each time the sheet opens for a prompt.
  useEffect(() => {
    if (prompt) {
      setState({ status: "idle" });
      setCopied(false);
    }
  }, [prompt]);

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  const url = prompt ? promptUrl(prompt.id) : "";
  const excerpt = useMemo(
    () =>
      prompt
        ? richTextToPlainText(parseRichText(prompt.text)).slice(0, 200)
        : "",
    [prompt],
  );

  const copy = async () => {
    await Clipboard.setStringAsync(url);
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  };

  const shareToDiscord = async () => {
    if (!prompt || state.status === "sharing") return;
    setState({ status: "sharing" });
    const result = await sharePromptToDiscord(api, {
      novelistUsername: novelist?.username ?? "",
      prompt: {
        createdOn: prompt.createdOn,
        media: prompt.media,
        source: prompt.source,
        text: prompt.text,
      },
      promptUrl: url,
    }).catch(() => null);
    if (result && "messageUrl" in result) {
      setState({ messageUrl: result.messageUrl, status: "success" });
    } else {
      setState({ status: "error" });
    }
  };

  const shareElsewhere = () => {
    if (!prompt) return;
    void Share.share({
      message: url,
      title: `Prompt by ${prompt.source.name}`,
      url,
    });
  };

  return (
    <BottomSheet
      maxHeightRatio={0.8}
      onClose={onClose}
      subtitle="Post it to the NW Discord community or copy its link."
      title="Share prompt"
      visible={prompt !== null}
    >
      {prompt ? (
        <View style={styles.body}>
          {state.status === "success" ? (
            <View style={styles.result}>
              <View
                style={[
                  styles.resultIcon,
                  {
                    backgroundColor: theme.accent.tint,
                    borderColor: theme.accent.surfaceHover,
                  },
                ]}
              >
                <Ionicons color={theme.success} name="checkmark" size={28} />
              </View>
              <Text style={[styles.resultTitle, { color: theme.text }]}>
                Shared to Discord!
              </Text>
              <Text style={[styles.resultBody, { color: theme.textGray }]}>
                The prompt is now live in the NW Community channel.
              </Text>
              <Pressable
                accessibilityRole="link"
                onPress={() => void Linking.openURL(state.messageUrl)}
                style={({ pressed }) => [
                  styles.button,
                  {
                    backgroundColor: pressed
                      ? theme.glass.fillPressed
                      : theme.material.fillTranslucent,
                    borderColor: theme.material.edgeTranslucent,
                  },
                ]}
              >
                <Ionicons color={theme.text} name="open-outline" size={16} />
                <Text style={[styles.buttonLabel, { color: theme.text }]}>
                  View message
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={onClose}
                style={({ pressed }) => [
                  styles.button,
                  {
                    backgroundColor: pressed
                      ? theme.accent.fillPressed
                      : theme.accent.fill,
                    borderColor: theme.accent.fill,
                  },
                ]}
              >
                <Text style={[styles.buttonLabel, styles.onAccent]}>Done</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View
                style={[
                  styles.preview,
                  {
                    backgroundColor: theme.material.fillTranslucent,
                    borderColor: theme.material.edgeTranslucent,
                  },
                ]}
              >
                <Avatar
                  name={prompt.source.name}
                  size={36}
                  image={prompt.source.avatar}
                  uri={prompt.source.avatar?.src ?? prompt.source.image}
                />
                <View style={styles.previewText}>
                  <View style={styles.previewMeta}>
                    <Text
                      numberOfLines={1}
                      style={[styles.previewName, { color: theme.text }]}
                    >
                      {prompt.source.name}
                    </Text>
                    <Text
                      style={[styles.previewDate, { color: theme.textGray }]}
                    >
                      {toFormattedDate(prompt.createdOn)}
                    </Text>
                  </View>
                  {excerpt ? (
                    <Text
                      numberOfLines={3}
                      style={[styles.previewBody, { color: theme.textGray }]}
                    >
                      {excerpt}
                    </Text>
                  ) : null}
                </View>
                {prompt.media && !prompt.media.toLowerCase().endsWith("mp4") ? (
                  <Image
                    contentFit="cover"
                    source={{ uri: prompt.media }}
                    style={styles.thumb}
                  />
                ) : null}
              </View>

              <View style={styles.linkRow}>
                <View
                  style={[
                    styles.link,
                    {
                      backgroundColor: theme.glass.field,
                      borderColor: theme.material.edgeTranslucent,
                    },
                  ]}
                >
                  <Ionicons
                    color={theme.textGray}
                    name="link-outline"
                    size={16}
                  />
                  <Text
                    numberOfLines={1}
                    style={[styles.linkText, { color: theme.textGray }]}
                  >
                    {url.replace(/^https?:\/\//, "")}
                  </Text>
                </View>
                <Pressable
                  accessibilityLabel={
                    copied ? "Link copied" : "Copy prompt link"
                  }
                  accessibilityRole="button"
                  onPress={() => void copy()}
                  style={({ pressed }) => [
                    styles.copy,
                    {
                      backgroundColor: copied
                        ? theme.accent.surfaceActive
                        : pressed
                          ? theme.glass.fillPressed
                          : theme.material.fillTranslucent,
                      borderColor: copied
                        ? theme.accent.solid
                        : theme.material.edgeTranslucent,
                    },
                  ]}
                >
                  <Ionicons
                    color={copied ? theme.accent.textStrong : theme.text}
                    name={copied ? "checkmark" : "copy-outline"}
                    size={16}
                  />
                  <Text
                    style={[
                      styles.buttonLabel,
                      { color: copied ? theme.accent.textStrong : theme.text },
                    ]}
                  >
                    {copied ? "Copied" : "Copy"}
                  </Text>
                </Pressable>
              </View>

              <Pressable
                accessibilityRole="button"
                disabled={state.status === "sharing"}
                onPress={() => void shareToDiscord()}
                style={({ pressed }) => [
                  styles.button,
                  {
                    backgroundColor: pressed ? "#4752c4" : "#5865f2",
                    borderColor: "#5865f2",
                    opacity: state.status === "sharing" ? 0.7 : 1,
                  },
                ]}
              >
                {state.status === "sharing" ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Ionicons color="#ffffff" name="logo-discord" size={18} />
                )}
                <Text style={[styles.buttonLabel, styles.onAccent]}>
                  {state.status === "sharing"
                    ? "Sharing..."
                    : "Share in Community"}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={shareElsewhere}
                style={({ pressed }) => [
                  styles.button,
                  {
                    backgroundColor: pressed
                      ? theme.glass.fillPressed
                      : theme.material.fillTranslucent,
                    borderColor: theme.material.edgeTranslucent,
                  },
                ]}
              >
                <Ionicons color={theme.text} name="share-outline" size={18} />
                <Text style={[styles.buttonLabel, { color: theme.text }]}>
                  More options
                </Text>
              </Pressable>

              {state.status === "error" ? (
                <View style={styles.error}>
                  <Ionicons
                    color={theme.error}
                    name="alert-circle-outline"
                    size={14}
                  />
                  <Text style={[styles.errorText, { color: theme.error }]}>
                    Couldn't post to Discord. Please try again.
                  </Text>
                </View>
              ) : null}
            </>
          )}
        </View>
      ) : null}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  body: { gap: space.ms, padding: space.md, paddingBottom: space.xl },
  button: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: space.md,
  },
  buttonLabel: { fontSize: fontSize.label, fontWeight: "700" },
  copy: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.xs,
    height: 40,
    paddingHorizontal: space.ms,
  },
  error: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.xs,
    justifyContent: "center",
  },
  errorText: { fontSize: fontSize.caption, fontWeight: "600" },
  link: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    flex: 1,
    flexDirection: "row",
    gap: space.s,
    height: 40,
    paddingHorizontal: space.ms,
  },
  linkRow: { alignItems: "center", flexDirection: "row", gap: space.sm },
  linkText: { flex: 1, fontSize: fontSize.caption },
  onAccent: { color: "#ffffff" },
  preview: {
    alignItems: "flex-start",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.ms,
    padding: space.ms,
  },
  previewBody: { fontSize: fontSize.caption, lineHeight: 17 },
  previewDate: { fontSize: fontSize.meta },
  previewMeta: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.s,
  },
  previewName: { flexShrink: 1, fontSize: fontSize.label, fontWeight: "700" },
  previewText: { flex: 1, gap: space.xxs },
  result: { alignItems: "center", gap: space.sm, paddingVertical: space.md },
  resultBody: { fontSize: fontSize.label, textAlign: "center" },
  resultIcon: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: border.edge,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  resultTitle: { fontSize: fontSize.title, fontWeight: "700" },
  thumb: { borderRadius: radius.sm, height: 48, width: 48 },
});
