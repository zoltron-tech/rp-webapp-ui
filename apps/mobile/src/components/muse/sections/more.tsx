import { Ionicons } from "@expo/vector-icons";
import { deleteMuse } from "@nw/api/endpoints/muse";
import { report } from "@nw/api/endpoints/thread";
import { queryKeys, useApi, useSession } from "@nw/features";
import { API_MESSAGE, type Muse } from "@nw/types";
import { useQueryClient } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { MiniHeader } from "@/components/muse/mini-header";
import {
  Divider,
  MusePanel,
  PANEL,
  SectionLabel,
} from "@/components/muse/panel";
import { ShareMuseSheet } from "@/components/share/share-muse-sheet";
import { Text } from "@/components/text";
import { env } from "@/lib/env";
import type { MuseLook } from "@/lib/muse-appearance";
import { fontSize, radius, space } from "@/theme";

/**
 * Web's `MoreSection`: what you can do with this character.
 *
 * Web's list is edit, share, export the card, delete for the owner; share,
 * export, report for everyone else. Here:
 *
 * - **Share** opens web's `ShareMuseDialog` as a tray — the NW Discord
 *   community, the link, and the platform sheet behind "More options" — and
 *   **Copy link** beside it for the one-tap case.
 * - **Report** and **Delete** are the same endpoints web calls, behind the
 *   platform's own confirmation.
 * - **Edit** opens the character's settings (`app/edit-muse`): the name, the
 *   looks, the story, the gallery and the connections, section by section.
 * - **Export card** is not offered: it renders the card to an image through a
 *   DOM canvas on web, and there is no equivalent on this client.
 */

/** Web's `ROUTES.Muse.View`. */
const museUrl = (museId: string) => `${env.WEB_URL}/rp/muse/${museId}`;

export const MuseMoreSection = ({
  isOwnMuse,
  look,
  muse,
}: {
  isOwnMuse: boolean;
  look: MuseLook;
  muse: Muse | null;
}) => {
  const api = useApi();
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useSession();
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [busy, setBusy] = useState<"delete" | "report" | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  const id = muse?.id ?? null;
  const url = id ? museUrl(id) : "";

  const copy = async () => {
    if (!url) return;
    await Clipboard.setStringAsync(url);
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1800);
  };

  const confirmReport = () => {
    if (!id) return;
    Alert.alert(
      "Report this character?",
      "We strive to maintain a safe and welcoming community. If you notice any misconduct, please report it. Our team will review the issue and take appropriate action as quickly as possible.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            setBusy("report");
            const response = await report(api, id, "", "MUSE");
            setBusy(null);
            Alert.alert(
              response?.message === API_MESSAGE.Success
                ? "Reported"
                : "Not reported",
              response?.message === API_MESSAGE.Success
                ? "Thank you. Our team will take a look."
                : "There was an issue while reporting this character.",
            );
          },
          text: "Report",
        },
      ],
    );
  };

  const confirmDelete = () => {
    if (!muse || !id) return;
    const isVerse = Boolean(muse.originalVerseId);
    Alert.alert(
      `Delete ${muse.firstName}?`,
      "This action is permanent and cannot be undone. The character and all associated data will be removed.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: async () => {
            setBusy("delete");
            const response = await deleteMuse(api, id);
            setBusy(null);
            if (
              response &&
              "message" in response &&
              response.message !== API_MESSAGE.Success
            ) {
              Alert.alert(
                "Not deleted",
                "The character could not be deleted. Try again.",
              );
              return;
            }
            // The owner's lists and profile counts all carried this muse.
            const username = session.novelist?.username;
            if (username) {
              void queryClient.invalidateQueries({
                queryKey: queryKeys.novelistMuses(username),
              });
              void queryClient.invalidateQueries({
                queryKey: queryKeys.profile(username),
              });
            }
            void queryClient.invalidateQueries({
              queryKey: queryKeys.session(),
            });
            queryClient.removeQueries({ queryKey: queryKeys.muse(id) });
            if (isVerse && muse.originalVerseId) {
              router.replace({
                params: { museId: muse.originalVerseId },
                pathname: "/muse/[museId]",
              });
            } else {
              router.back();
            }
          },
          style: "destructive",
          text: isVerse ? "Delete verse" : "Delete character",
        },
      ],
    );
  };

  return (
    <MusePanel
      accent={look.accent}
      hideBackground={look.hideExpandedBackground}
    >
      <MiniHeader look={look} muse={muse} />
      <Divider accent={look.accent} />
      <SectionLabel>Options</SectionLabel>

      <View style={styles.list}>
        {isOwnMuse ? (
          <Row
            disabled={!id}
            hint="Name, looks, story, gallery and connections"
            icon="create-outline"
            label="Edit character"
            onPress={() =>
              id &&
              router.push({
                params: { museId: id },
                pathname: "/edit-muse/[museId]",
              })
            }
          />
        ) : null}
        <Row
          disabled={!id}
          icon="share-social-outline"
          label="Share character"
          onPress={() => setSharing(true)}
        />
        <Row
          disabled={!id}
          icon={copied ? "checkmark-outline" : "link-outline"}
          label={copied ? "Link copied" : "Copy link"}
          onPress={() => void copy()}
        />
        {isOwnMuse ? (
          <Row
            busy={busy === "delete"}
            disabled={!id || busy !== null}
            icon="trash-outline"
            label={muse?.originalVerseId ? "Delete verse" : "Delete character"}
            onPress={confirmDelete}
            variant="danger"
          />
        ) : (
          <Row
            busy={busy === "report"}
            disabled={!id || busy !== null}
            icon="flag-outline"
            label="Report character"
            onPress={confirmReport}
            variant="warn"
          />
        )}
      </View>

      {muse ? (
        <ShareMuseSheet
          muse={muse}
          onClose={() => setSharing(false)}
          visible={sharing}
        />
      ) : null}
    </MusePanel>
  );
};

/** Web's `MoreMenuItem`: a full-width row, red or amber when it bites. */
const Row = ({
  busy,
  disabled,
  hint,
  icon,
  label,
  onPress,
  variant,
}: {
  busy?: boolean;
  disabled?: boolean;
  hint?: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  variant?: "danger" | "warn";
}) => {
  const color =
    variant === "danger"
      ? "#e5484d"
      : variant === "warn"
        ? "#f5a623"
        : PANEL.primary;

  return (
    <Pressable
      accessibilityHint={hint}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ busy, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed
            ? "rgba(255,255,255,0.1)"
            : "rgba(255,255,255,0.05)",
          opacity: disabled && !busy ? 0.5 : 1,
        },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={color} size="small" />
      ) : (
        <Ionicons color={color} name={icon} size={19} />
      )}
      <View style={styles.text}>
        <Text style={[styles.label, { color }]}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  hint: { color: PANEL.muted, fontSize: fontSize.caption },
  label: { fontSize: fontSize.body, fontWeight: "500" },
  list: { gap: space.sm, paddingVertical: space.sm },
  row: {
    alignItems: "center",
    borderRadius: radius.md,
    flexDirection: "row",
    gap: space.m,
    paddingHorizontal: space.md + 2,
    paddingVertical: space.sm + 6,
  },
  text: { flex: 1, gap: 1 },
});
