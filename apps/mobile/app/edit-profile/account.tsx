import {
  forgotPassword,
  getDiscordConnection,
  getSpotifyConnection,
  sendVerificationEmail,
  unlinkDiscord,
  unlinkSpotify,
} from "@nw/api/endpoints/account";
import {
  getBlockedNovelists,
  unblockNovelist,
} from "@nw/api/endpoints/profile";
import { useApi, useSession } from "@nw/features";
import { API_MESSAGE, type Friend } from "@nw/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { UsernameSheet } from "@/components/edit-profile/username-sheet";
import {
  Chip,
  Notice,
  PillButton,
  SettingsGroup,
  SettingsRow,
} from "@/components/settings";
import { env } from "@/lib/env";
import { fontSize, space, useAppTheme } from "@/theme";

/**
 * Web's `AccountSection`: sign-in and security, badges and your circle,
 * connected accounts, where you are signed in, and who you have blocked.
 *
 * Linking Discord or Spotify is an OAuth round trip that lands back on a web
 * page, so "Connect" opens that page in the browser; seeing and ending a link
 * is native.
 */

type Async = "idle" | "loading" | "success" | "error";

const PAGE_SIZE = 5;
const WEB_URL = env.WEB_URL || "https://novelist.world";

export default function AccountScreen() {
  const theme = useAppTheme();
  const api = useApi();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { novelist, user } = useSession();

  const [usernameOpen, setUsernameOpen] = useState(false);
  const [verify, setVerify] = useState<Async>("idle");
  const [reset, setReset] = useState<Async>("idle");
  const [unlinking, setUnlinking] = useState<"discord" | "spotify" | null>(null);

  const [blocked, setBlocked] = useState<Friend[]>([]);
  const [blockedPage, setBlockedPage] = useState(1);
  const [blockedState, setBlockedState] = useState<"loading" | "idle" | "more">(
    "loading",
  );
  const [hasMore, setHasMore] = useState(false);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const discord = useQuery({
    queryFn: () => getDiscordConnection(api),
    queryKey: ["account", "discord"],
  });
  const spotify = useQuery({
    queryFn: () => getSpotifyConnection(api),
    queryKey: ["account", "spotify"],
  });

  useEffect(() => {
    void getBlockedNovelists(api, 1, PAGE_SIZE).then((page) => {
      setBlocked(page);
      setHasMore(page.length === PAGE_SIZE);
      setBlockedState("idle");
    });
  }, [api]);

  const verified = novelist?.isVerified ?? user?.emailVerified ?? false;
  const isOauth = Boolean(user?.authApp && user.authApp !== "NOVELIST_WORLD");

  const resendVerification = async () => {
    setVerify("loading");
    const result = await sendVerificationEmail(api).catch(() => null);
    setVerify(result?.message === API_MESSAGE.Success ? "success" : "error");
  };

  const resetPassword = async () => {
    if (!user?.email) return;
    setReset("loading");
    const result = await forgotPassword(api, user.email).catch(() => null);
    setReset(result?.message === API_MESSAGE.Success ? "success" : "error");
  };

  const unlink = (provider: "discord" | "spotify") => {
    const label = provider === "discord" ? "Discord" : "Spotify";
    Alert.alert(`Unlink ${label}?`, `Your ${label} account will be disconnected.`, [
      { style: "cancel", text: "Cancel" },
      {
        onPress: async () => {
          setUnlinking(provider);
          const result = await (provider === "discord"
            ? unlinkDiscord(api)
            : unlinkSpotify(api)
          ).catch(() => null);
          setUnlinking(null);
          if (result?.message !== API_MESSAGE.Success) {
            Alert.alert("Not unlinked", `Could not unlink ${label}. Try again.`);
            return;
          }
          queryClient.setQueryData(["account", provider], null);
        },
        style: "destructive",
        text: "Unlink",
      },
    ]);
  };

  const connect = () =>
    void Linking.openURL(`${WEB_URL}/rp/profile/edit`);

  const loadMore = async () => {
    const next = blockedPage + 1;
    setBlockedState("more");
    const page = await getBlockedNovelists(api, next, PAGE_SIZE);
    setBlocked((current) => [...current, ...page]);
    setBlockedPage(next);
    setHasMore(page.length === PAGE_SIZE);
    setBlockedState("idle");
  };

  const unblock = async (person: Friend) => {
    setUnblockingId(person.id);
    const result = await unblockNovelist(api, person.id).catch(() => null);
    setUnblockingId(null);
    if (result?.message !== API_MESSAGE.Success) {
      Alert.alert("Not unblocked", "Could not unblock. Try again.");
      return;
    }
    setBlocked((current) => current.filter((it) => it.id !== person.id));
  };

  const connection = (
    provider: "discord" | "spotify",
    query: { data: unknown; isPending: boolean },
  ) =>
    query.isPending ? (
      <ActivityIndicator color={theme.textGray} size="small" />
    ) : query.data ? (
      <PillButton
        busy={unlinking === provider}
        icon="unlink-outline"
        label="Unlink"
        onPress={() => unlink(provider)}
      />
    ) : (
      <PillButton icon="link-outline" label="Connect" onPress={connect} />
    );

  const discordName = discord.data
    ? `@${discord.data.discordGlobalName || discord.data.discordUsername}`
    : null;
  const spotifyName = spotify.data
    ? spotify.data.displayName || spotify.data.spotifyUserId
    : null;

  return (
    <>
      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingBottom: insets.bottom + space.xl },
        ]}
      >
        <SettingsGroup title="Sign-in & security">
          <SettingsRow
            accessory={
              verified ? null : (
                <PillButton
                  busy={verify === "loading"}
                  icon="mail-outline"
                  label="Resend"
                  onPress={() => void resendVerification()}
                />
              )
            }
            icon="mail-outline"
            label="Email"
            subtitle={
              <View style={styles.detail}>
                <Text
                  numberOfLines={1}
                  style={[styles.value, { color: theme.textGray }]}
                >
                  {user?.email || "—"}
                </Text>
                <Chip
                  icon={verified ? "checkmark-circle" : "close-circle"}
                  label={verified ? "Verified" : "Unverified"}
                  tone={verified ? "positive" : "danger"}
                />
              </View>
            }
          />
          {verify === "success" ? (
            <Notice tone="success">
              Verification email sent. Check your inbox and follow the link.
            </Notice>
          ) : null}
          {verify === "error" ? (
            <Notice tone="error">
              Could not send the verification email. Try again in a moment.
            </Notice>
          ) : null}
          <SettingsRow
            accessory={
              <PillButton
                icon="pencil"
                label="Change"
                onPress={() => setUsernameOpen(true)}
              />
            }
            icon="at-outline"
            label="Username"
            subtitle={user?.username ? `@${user.username}` : "—"}
          />
          {isOauth ? (
            <Notice>
              Your account is linked to {user?.authApp}. Manage your password
              through that provider.
            </Notice>
          ) : (
            <SettingsRow
              accessory={
                <PillButton
                  busy={reset === "loading"}
                  disabled={!user?.email}
                  icon="key-outline"
                  label="Reset"
                  onPress={() => void resetPassword()}
                />
              }
              icon="key-outline"
              label="Password"
              subtitle="••••••••"
            />
          )}
          {reset === "success" ? (
            <Notice tone="success">
              We sent instructions to {user?.email}. Check your inbox to reset
              your password.
            </Notice>
          ) : null}
          {reset === "error" ? (
            <Notice tone="error">
              Could not send the password reset email. Try again.
            </Notice>
          ) : null}
        </SettingsGroup>

        <SettingsGroup title="Badges & your circle">
          <SettingsRow
            icon="ribbon-outline"
            label="Badges"
            // Back down to the tabs and into Profile, rather than a push: these
            // settings sit above the tabs on the root stack, so a push would
            // mount a second copy of every tab on top of them. See `menu.tsx`.
            onPress={() =>
              router.dismissTo("/(tabs)/(profile)/badges", { withAnchor: true })
            }
            subtitle="What you have earned around Novelist World"
          />
          <SettingsRow
            external
            icon="people-outline"
            label="Your circle"
            onPress={() =>
              void Linking.openURL(`${WEB_URL}/rp/profile/referrals`)
            }
            subtitle="Novelists who joined using your referral link"
          />
        </SettingsGroup>

        <SettingsGroup
          footer="Connecting opens novelist.world in your browser."
          title="Connected accounts"
        >
          <SettingsRow
            accessory={connection("discord", discord)}
            icon="logo-discord"
            label="Discord"
            subtitle={
              discord.isPending ? "…" : discordName ?? "Not connected"
            }
            tone="discord"
          />
          <SettingsRow
            accessory={connection("spotify", spotify)}
            icon="musical-notes"
            label="Spotify"
            subtitle={
              spotify.isPending ? "…" : spotifyName ?? "Not connected"
            }
            tone="spotify"
          />
        </SettingsGroup>

        <SettingsGroup title="Security">
          <SettingsRow
            icon="phone-portrait-outline"
            label="Where you are signed in"
            onPress={() => router.push("/edit-profile/devices")}
            subtitle="Review devices and sign them out"
          />
        </SettingsGroup>

        <SettingsGroup title="Blocked accounts">
          {blockedState === "loading" ? (
            <View style={styles.loading}>
              <ActivityIndicator color={theme.textGray} />
            </View>
          ) : blocked.length === 0 ? (
            <SettingsRow
              icon="shield-outline"
              label="Nobody blocked"
              subtitle="You have not blocked anyone."
              tone="neutral"
            />
          ) : (
            blocked.map((person) => (
              <View key={person.id} style={styles.blockedRow}>
                <Avatar
                  image={person.avatar}
                  name={person.firstName}
                  size={38}
                  uri={person.image}
                />
                <View style={styles.blockedText}>
                  <Text
                    numberOfLines={1}
                    style={[styles.blockedName, { color: theme.text }]}
                  >
                    {[person.firstName, person.lastName]
                      .filter(Boolean)
                      .join(" ")}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.value, { color: theme.textGray }]}
                  >
                    @{person.username}
                  </Text>
                </View>
                <PillButton
                  busy={unblockingId === person.id}
                  label="Unblock"
                  onPress={() => void unblock(person)}
                />
              </View>
            ))
          )}
          {hasMore ? (
            <SettingsRow
              busy={blockedState === "more"}
              chevron={false}
              label="Load more"
              onPress={() => void loadMore()}
            />
          ) : null}
        </SettingsGroup>
      </ScrollView>

      <UsernameSheet
        current={user?.username ?? novelist?.username ?? ""}
        onClose={() => setUsernameOpen(false)}
        visible={usernameOpen}
      />
    </>
  );
}

const styles = StyleSheet.create({
  blockedName: { fontSize: fontSize.body, fontWeight: "600" },
  blockedRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm + 4,
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 2,
  },
  blockedText: { flex: 1, minWidth: 0 },
  body: { gap: space.lg, padding: space.sm + 4 },
  detail: { alignItems: "flex-start", gap: 4 },
  loading: { padding: space.lg },
  value: { fontSize: fontSize.caption },
});
