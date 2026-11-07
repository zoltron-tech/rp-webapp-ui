import { sendFeedbackMessage } from "@nw/api/endpoints/profile";
import { useApi } from "@nw/features";
import { API_MESSAGE } from "@nw/types";
import * as Clipboard from "expo-clipboard";
import { useEffect, useRef, useState } from "react";
import { Alert, Linking, StyleSheet, View } from "react-native";
import { Button } from "@/components/button";
import { IconButton } from "@/components/icon-button";
import { BottomSheet } from "@/components/sheet";
import { Text, TextInput } from "@/components/text";
import { env } from "@/lib/env";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Help & support, in the app — web's Contact Support form.
 */
export const SupportSheet = ({
  onClose,
  visible,
}: {
  onClose: () => void;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const api = useApi();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const canSend = message.trim().length > 0 && !sending;

  const send = async () => {
    if (!canSend) return;
    setSending(true);
    const result = await sendFeedbackMessage(api, message.trim()).catch(
      () => null,
    );
    setSending(false);
    if (result?.message !== API_MESSAGE.Success) {
      Alert.alert(
        "Not sent",
        `There was an issue while sending that. Please contact ${env.SUPPORT_EMAIL}.`,
      );
      return;
    }
    setMessage("");
    onClose();
    Alert.alert("Sent", "The team will get back to you as soon as they can.");
  };

  return (
    <BottomSheet
      headerAction={
        <View style={styles.headerActions}>
          <IconButton
            accessibilityLabel="Close"
            icon="close"
            onPress={onClose}
            size={36}
            tone="surface"
          />
          <IconButton
            accessibilityLabel="Send message"
            disabled={!canSend}
            icon="arrow-up"
            onPress={() => void send()}
            size={36}
            tone="primary"
          />
        </View>
      }
      onClose={onClose}
      title="Help & support"
      visible={visible}
    >
      <View style={styles.body}>
        <Text style={[styles.description, { color: theme.textGray }]}>
          The team will get back to you ASAP. Check your inbox for updates.
        </Text>
        <TextInput
          accessibilityLabel="Your message"
          multiline
          onChangeText={setMessage}
          placeholder="Type your message..."
          placeholderTextColor={theme.textGray}
          style={[
            styles.input,
            {
              backgroundColor: theme.material.fill,
              borderColor: theme.material.edge,
              color: theme.text,
            },
          ]}
          textAlignVertical="top"
          value={message}
        />
      </View>
    </BottomSheet>
  );
};

/**
 * Join the community — web's `DiscordCommunityDialog`, with the invite link to
 * copy for reading on another device.
 */
export const DiscordSheet = ({
  onClose,
  visible,
}: {
  onClose: () => void;
  visible: boolean;
}) => {
  const theme = useAppTheme();
  const invite = env.DISCORD_INVITE_URL;
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    await Clipboard.setStringAsync(invite);
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <BottomSheet
      ignoreKeyboard
      onClose={onClose}
      title="Be a part of NW Community"
      visible={visible}
    >
      <View style={styles.body}>
        <Text style={[styles.description, { color: theme.textGray }]}>
          Connect and hang out with fellow novelists, get the latest app
          updates, share feedback and receive support; all in the Novelist World
          Discord server.
        </Text>
        <View
          style={[
            styles.linkRow,
            {
              backgroundColor: theme.material.fill,
              borderColor: theme.material.edge,
            },
          ]}
        >
          <Text numberOfLines={1} style={[styles.link, { color: theme.text }]}>
            {invite.replace(/^https?:\/\//, "")}
          </Text>
          <Button
            accessibilityLabel={
              copied ? "Invite link copied" : "Copy invite link"
            }
            icon={copied ? "checkmark" : "copy-outline"}
            label={copied ? "Copied" : "Copy"}
            onPress={() => void copy()}
            size="xs"
          />
        </View>
        <Button
          icon="logo-discord"
          label="Join the server"
          onPress={() => {
            onClose();
            void Linking.openURL(invite);
          }}
          variant="primary"
        />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  body: { gap: space.m, paddingBottom: space.lg, paddingHorizontal: space.md },
  description: { fontSize: fontSize.body, lineHeight: 21 },
  headerActions: { flexDirection: "row", gap: space.sm },
  input: {
    borderRadius: radius.field,
    borderWidth: border.edge,
    fontSize: fontSize.input,
    minHeight: 140,
    padding: space.m,
  },
  link: { flex: 1, fontSize: fontSize.label },
  linkRow: {
    alignItems: "center",
    borderRadius: radius.field,
    borderWidth: border.edge,
    flexDirection: "row",
    gap: space.sm,
    paddingLeft: space.m,
    paddingRight: space.sm,
    paddingVertical: space.sm,
  },
});
