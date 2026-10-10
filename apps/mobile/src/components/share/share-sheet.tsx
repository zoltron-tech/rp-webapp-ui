import { Ionicons } from "@expo/vector-icons";
import type { DiscordShareResult } from "@nw/api/endpoints/community";
import * as Clipboard from "expo-clipboard";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { BottomSheet } from "@/components/sheet";
import { Text } from "@/components/text";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The share tray, for anything that has a web link and a place in Discord.
 *
 * Web has four share dialogs — prompt, profile, muse, story/chapter — that are
 * the same dialog with a different preview card and a different endpoint
 * (`share-prompt-dialog`, `share-profile-dialog`, `share-muse-dialog`,
 * `share-story-dialog`, `share-chapter-dialog`). This is that one dialog,
 * once: the four parts in web's order — a preview of the thing, its link
 * with a copy button, "Share in Community" (the NW Discord, through the same
 * portfolio endpoint web calls), and the platform's own share sheet as "More
 * options" — and the success state with a link to the posted message.
 *
 * What differs per kind is handed in: the `preview` node, the `url`, the
 * `share` call that posts it, and the words. The wrappers beside this file
 * are those differences and nothing else, so the prompt tray and the profile
 * tray cannot drift the way web's four dialogs have.
 *
 * The link is always the web one: a profile or a muse opens in a browser from
 * Discord or a message, and that is where the link has to land.
 */

export type ShareState =
  | { status: "idle" }
  | { status: "sharing" }
  | { status: "success"; messageUrl: string }
  | { status: "error" };

/** The Discord brand blue, as web's `DiscordButton` paints it. */
const DISCORD = "#5865f2";
const DISCORD_PRESSED = "#4752c4";

export const ShareSheet = ({
  copyLabel,
  nativeMessage,
  nativeTitle,
  onClose,
  preview,
  share,
  subtitle,
  successBody,
  title,
  url,
  visible,
}: {
  /** The copy button's accessibility label, e.g. "Copy profile link". */
  copyLabel: string;
  /**
   * What the platform sheet is handed. Defaults to the link alone, which is
   * what most targets (Messages, WhatsApp) want; a name before it reads as a
   * caption on the ones that show text.
   */
  nativeMessage?: string;
  /** The platform sheet's title, where it shows one. */
  nativeTitle: string;
  onClose: () => void;
  /** The card at the top: who or what is being shared. */
  preview: ReactNode;
  /**
   * Posts the share to the community Discord. Resolves to the endpoint's
   * answer, or null when the request itself failed.
   */
  share: () => Promise<DiscordShareResult | { message: string } | null>;
  subtitle: string;
  /** Under "Shared to Discord!" — what is now live in the channel. */
  successBody: string;
  title: string;
  url: string;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const [copied, setCopied] = useState(false);
  const [state, setState] = useState<ShareState>({ status: "idle" });
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Transient state is reset each time the sheet opens.
  useEffect(() => {
    if (visible) {
      setState({ status: "idle" });
      setCopied(false);
    }
  }, [visible]);

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  const copy = async () => {
    if (!url) return;
    await Clipboard.setStringAsync(url);
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  };

  const shareToDiscord = async () => {
    if (!url || state.status === "sharing") return;
    setState({ status: "sharing" });
    const result = await share().catch(() => null);
    if (result && "messageUrl" in result) {
      setState({ messageUrl: result.messageUrl, status: "success" });
    } else {
      setState({ status: "error" });
    }
  };

  const shareElsewhere = () => {
    if (!url) return;
    void Share.share({
      message: nativeMessage ?? url,
      title: nativeTitle,
      url,
    });
  };

  return (
    <BottomSheet
      maxHeightRatio={0.8}
      onClose={onClose}
      subtitle={subtitle}
      title={title}
      visible={visible}
    >
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
              {successBody}
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
              {preview}
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
                <Ionicons color={theme.textGray} name="link-outline" size={16} />
                <Text
                  numberOfLines={1}
                  style={[styles.linkText, { color: theme.textGray }]}
                >
                  {url.replace(/^https?:\/\//, "")}
                </Text>
              </View>
              <Pressable
                accessibilityLabel={copied ? "Link copied" : copyLabel}
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
                  backgroundColor: pressed ? DISCORD_PRESSED : DISCORD,
                  borderColor: DISCORD,
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
    </BottomSheet>
  );
};

/**
 * The preview card's text column: a name and a line under it, beside
 * whatever face or cover the wrapper draws. Shared so the four trays' cards
 * line up.
 */
export const PreviewText = ({
  children,
  color,
  line,
  name,
}: {
  /** Anything under the two lines — an excerpt. */
  children?: ReactNode;
  /** The name's colour, where the thing has one of its own (a muse's accent). */
  color?: string;
  line?: string | null;
  name: string;
}) => {
  const theme = useAppTheme();
  return (
    <View style={styles.previewText}>
      <Text
        numberOfLines={1}
        style={[styles.previewName, { color: color ?? theme.text }]}
      >
        {name}
      </Text>
      {line ? (
        <Text
          numberOfLines={1}
          style={[styles.previewLine, { color: theme.textGray }]}
        >
          {line}
        </Text>
      ) : null}
      {children}
    </View>
  );
};

export const shareStyles = StyleSheet.create({
  previewBody: { fontSize: fontSize.caption, lineHeight: 17 },
  previewDate: { fontSize: fontSize.meta },
  previewMeta: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.s,
  },
  thumb: { borderRadius: radius.sm, height: 48, width: 48 },
});

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
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.ms,
    padding: space.ms,
  },
  previewLine: { fontSize: fontSize.caption },
  previewName: { fontSize: fontSize.label, fontWeight: "700" },
  previewText: { flex: 1, gap: space.xxs, minWidth: 0 },
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
});
