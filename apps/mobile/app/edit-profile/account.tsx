import {
  forgotPassword,
  getDiscordConnection,
  getSpotifyConnection,
  sendVerificationEmail,
  unlinkDiscord,
  unlinkSpotify,
} from "@nw/api/endpoints/account";
import {
  getBlacklistedNovelists,
  getBlockedNovelists,
  loadStorageUsage,
  unblacklistNovelist,
  unblockNovelist,
} from "@nw/api/endpoints/profile";
import { syncMyBadges } from "@nw/api/endpoints/badges";
import { queryKeys, useApi, useSession } from "@nw/features";
import {
  API_MESSAGE,
  BLOCK_BLACKLIST_COPY,
  DISABLE_ACCOUNT_COPY,
  type Friend,
  type LinkProvider,
} from "@nw/types";
import {
  STORAGE_WARNING_RATIO,
  storageDailySummary,
  storageSummary,
  storageUsedRatio,
} from "@nw/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { DisableAccountSheet } from "@/components/edit-profile/disable-account-sheet";
import { StorageSheet } from "@/components/edit-profile/storage-sheet";
import { UsernameSheet } from "@/components/edit-profile/username-sheet";
import { useSignOut } from "@/hooks/use-sign-out";
import {
  Notice,
  PillButton,
  SettingsGroup,
  SettingsRow,
} from "@/components/settings";
import { describeAuthError } from "@/lib/auth-errors";
import { env } from "@/lib/env";
import { linkAccount } from "@/lib/oauth";
import { openExternalLink } from "@/lib/safe-link";
import { fontSize, space, useAppTheme } from "@/theme";

/**
 * Web's `AccountSection`: sign-in and security, badges and your circle,
 * connected accounts, where you are signed in, and who you have blocked.
 *
 * Linking Discord or Spotify runs the provider's consent in the same in-app
 * browser sheet as social sign-in and comes back through the app's own
 * scheme (`linkAccount` in `lib/oauth.ts`); nothing leaves for the website.
 */

type Async = "idle" | "loading" | "success" | "error";

const PAGE_SIZE = 5;

export default function AccountScreen() {
  const theme = useAppTheme();
  const api = useApi();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { novelist, user } = useSession();

  const [usernameOpen, setUsernameOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const { signOutLocally } = useSignOut();
  const [verify, setVerify] = useState<Async>("idle");
  const [reset, setReset] = useState<Async>("idle");
  const [unlinking, setUnlinking] = useState<LinkProvider | null>(null);
  const [linking, setLinking] = useState<LinkProvider | null>(null);

  const [blocked, setBlocked] = useState<Friend[]>([]);
  const [blockedPage, setBlockedPage] = useState(1);
  const [blockedState, setBlockedState] = useState<"loading" | "idle" | "more">(
    "loading",
  );
  const [hasMore, setHasMore] = useState(false);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  // Blacklisted novelists (BLOCK_BLACKLIST_PLAN.md B15), the same list
  // pattern as Blocked accounts, with Remove.
  const [blacklisted, setBlacklisted] = useState<Friend[]>([]);
  const [blacklistedPage, setBlacklistedPage] = useState(1);
  const [blacklistedState, setBlacklistedState] = useState<
    "loading" | "idle" | "more"
  >("loading");
  const [hasMoreBlacklisted, setHasMoreBlacklisted] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const discord = useQuery({
    queryFn: () => getDiscordConnection(api),
    queryKey: ["account", "discord"],
  });
  const spotify = useQuery({
    queryFn: () => getSpotifyConnection(api),
    queryKey: ["account", "spotify"],
  });
  // Uploads against the account's total (AWS_COST_SECURITY_PLAN.md §2.2).
  // `null` when /s3/usage fails: the row is then left out, not drawn broken.
  // Read fresh, which also refreshes the cache the upload checks use.
  const storage = useQuery({
    queryFn: () => loadStorageUsage(api, { fresh: true }),
    queryKey: ["account", "storage"],
  });
  const [storageOpen, setStorageOpen] = useState(false);

  useEffect(() => {
    void getBlockedNovelists(api, 1, PAGE_SIZE).then((page) => {
      setBlocked(page);
      setHasMore(page.length === PAGE_SIZE);
      setBlockedState("idle");
    });
    void getBlacklistedNovelists(api, 1, PAGE_SIZE).then((page) => {
      setBlacklisted(page);
      setHasMoreBlacklisted(page.length === PAGE_SIZE);
      setBlacklistedState("idle");
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

  // Both accounts earn a badge, and the throttle would hide the change.
  const resyncBadges = () =>
    void syncMyBadges(api).then((badges) => {
      if (badges.length > 0) {
        queryClient.setQueryData(queryKeys.myBadges(), badges);
      }
    });

  const unlink = (provider: LinkProvider) => {
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
          resyncBadges();
        },
        style: "destructive",
        text: "Unlink",
      },
    ]);
  };

  const connect = async (provider: LinkProvider) => {
    const label = provider === "discord" ? "Discord" : "Spotify";
    setLinking(provider);
    try {
      const outcome = await linkAccount(provider);
      if (outcome === "cancelled") return;
      if (outcome === "already_linked") {
        Alert.alert(
          "Already linked",
          `That ${label} account is already linked to another Novelist World profile.`,
        );
        return;
      }
      // The redirect said "linked"; the row's details come from the API.
      await queryClient.invalidateQueries({ queryKey: ["account", provider] });
      resyncBadges();
    } catch (cause) {
      Alert.alert(
        "Not linked",
        describeAuthError(cause, `Could not link ${label}. Try again.`),
      );
    } finally {
      setLinking(null);
    }
  };

  const loadMore = async () => {
    const next = blockedPage + 1;
    setBlockedState("more");
    const page = await getBlockedNovelists(api, next, PAGE_SIZE);
    setBlocked((current) => [...current, ...page]);
    setBlockedPage(next);
    setHasMore(page.length === PAGE_SIZE);
    setBlockedState("idle");
  };

  const loadMoreBlacklisted = async () => {
    const next = blacklistedPage + 1;
    setBlacklistedState("more");
    const page = await getBlacklistedNovelists(api, next, PAGE_SIZE);
    setBlacklisted((current) => [
      ...current,
      ...page.filter((it) => !current.some((c) => c.id === it.id)),
    ]);
    setBlacklistedPage(next);
    setHasMoreBlacklisted(page.length === PAGE_SIZE);
    setBlacklistedState("idle");
  };

  const removeFromBlacklist = async (person: Friend) => {
    setRemovingId(person.id);
    const result = await unblacklistNovelist(api, person.id).catch(() => null);
    setRemovingId(null);
    if (result?.message !== API_MESSAGE.Success) {
      Alert.alert("Not removed", "Could not remove them from your blacklist. Try again.");
      return;
    }
    setBlacklisted((current) => current.filter((it) => it.id !== person.id));
    // Their profile and the inbox move with it (the DM leaves Archived).
    void queryClient.invalidateQueries({ queryKey: queryKeys.profile(person.username) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.conversations() });
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
    provider: LinkProvider,
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
      <PillButton
        busy={linking === provider}
        icon="link-outline"
        label="Connect"
        onPress={() => void connect(provider)}
      />
    );

  const discordName = discord.data
    ? `@${discord.data.discordGlobalName || discord.data.discordUsername}`
    : null;
  const spotifyName = spotify.data
    ? spotify.data.displayName || spotify.data.spotifyUserId
    : null;

  const storageUsage = storage.data ?? null;
  const storagePct = storageUsage
    ? Math.round(storageUsedRatio(storageUsage) * 1000) / 10
    : 0;
  const storageDaily = storageUsage ? storageDailySummary(storageUsage) : null;
  const storageHidden = storage.data === null || storage.isError;

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
              verified ? (
                user?.email || "—"
              ) : (
                <View style={styles.detail}>
                  <Text
                    numberOfLines={1}
                    style={[styles.value, { color: theme.textGray }]}
                  >
                    {user?.email || "—"}
                  </Text>
                  <Text style={[styles.unverified, { color: theme.error }]}>
                    Not verified
                  </Text>
                </View>
              )
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
            icon="at-outline"
            label="Username"
            onPress={() => setUsernameOpen(true)}
            subtitle={user?.username ? `@${user.username}` : "—"}
          />
          {isOauth ? (
            <Notice>
              Your account is linked to {user?.authApp}. Manage your password
              through that provider.
            </Notice>
          ) : (
            <SettingsRow
              busy={reset === "loading"}
              chevron={false}
              disabled={!user?.email}
              icon="key-outline"
              label="Reset password"
              onPress={() => void resetPassword()}
              subtitle="We'll email you a link"
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
            subtitle="What you have earned"
          />
          <SettingsRow
            icon="people-outline"
            label="Your circle"
            onPress={() => router.push("/edit-profile/referrals")}
            subtitle="Novelists you invited"
          />
        </SettingsGroup>

        {storageHidden ? null : (
          <SettingsGroup title="Storage">
            <SettingsRow
              disabled={!storageUsage}
              icon="server-outline"
              label="Storage"
              onPress={() => setStorageOpen(true)}
              subtitle={
                storageUsage ? (
                  <View style={styles.storage}>
                    <Text
                      numberOfLines={1}
                      style={[styles.value, { color: theme.textGray }]}
                    >
                      {storageSummary(storageUsage)}
                    </Text>
                    <View
                      accessibilityLabel={`${Math.round(storagePct)} percent of your storage used`}
                      accessibilityRole="progressbar"
                      accessibilityValue={{
                        max: 100,
                        min: 0,
                        now: Math.round(storagePct),
                      }}
                      style={[
                        styles.storageTrack,
                        { backgroundColor: theme.material.edgeTranslucent },
                      ]}
                    >
                      <View
                        style={[
                          styles.storageFill,
                          {
                            backgroundColor:
                              storagePct >= STORAGE_WARNING_RATIO * 100
                                ? theme.warning
                                : theme.accent.solid,
                            width: `${storagePct}%`,
                          },
                        ]}
                      />
                    </View>
                    {storageDaily ? (
                      <Text
                        numberOfLines={2}
                        style={[styles.value, { color: theme.textGray }]}
                      >
                        {storageDaily}
                      </Text>
                    ) : null}
                  </View>
                ) : (
                  "…"
                )
              }
            />
          </SettingsGroup>
        )}

        <SettingsGroup
          footer="Connect signs you in with the provider in a secure sheet. You can unlink at any time."
          title="Connected accounts"
        >
          <SettingsRow
            accessory={
              <View style={styles.connection}>
                {discord.data?.avatarUrl ? (
                  <Avatar
                    name={discordName ?? undefined}
                    size={28}
                    uri={discord.data.avatarUrl}
                  />
                ) : null}
                {connection("discord", discord)}
              </View>
            }
            icon="logo-discord"
            label="Discord"
            subtitle={
              discord.isPending ? "…" : discordName ?? "Not connected"
            }
            tone="discord"
          />
          {discord.data && !discord.data.isServerMember && env.DISCORD_INVITE_URL ? (
            <SettingsRow
              external
              icon="people-outline"
              label="Join the NW server"
              onPress={() => void Linking.openURL(env.DISCORD_INVITE_URL)}
              subtitle="Linked, but not in the community yet"
              tone="discord"
            />
          ) : null}
          <SettingsRow
            accessory={connection("spotify", spotify)}
            icon="musical-notes"
            label="Spotify"
            onPress={
              spotify.data?.profileUrl
                ? () => void openExternalLink(spotify.data?.profileUrl ?? "")
                : undefined
            }
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

        {/* Directly above the people lists, Blacklisted then Blocked
            (ACCOUNT_DISABLE_PLAN.md D15; BLOCK_BLACKLIST_PLAN.md B15). */}
        <SettingsGroup
          footer={DISABLE_ACCOUNT_COPY.groupBody}
          title={DISABLE_ACCOUNT_COPY.groupTitle}
        >
          <SettingsRow
            icon="pause-circle-outline"
            label={DISABLE_ACCOUNT_COPY.action}
            onPress={() => setDisableOpen(true)}
            subtitle="Hide everything until you sign back in"
            tone="neutral"
          />
        </SettingsGroup>

        <SettingsGroup
          footer={
            blacklisted.length > 0
              ? BLOCK_BLACKLIST_COPY.blacklistedList.hint
              : undefined
          }
          title={BLOCK_BLACKLIST_COPY.blacklistedList.heading}
        >
          {blacklistedState === "loading" ? (
            <View style={styles.loading}>
              <ActivityIndicator color={theme.textGray} />
            </View>
          ) : blacklisted.length === 0 ? (
            <SettingsRow
              icon="eye-off-outline"
              label="Nobody blacklisted"
              subtitle={BLOCK_BLACKLIST_COPY.blacklistedList.empty}
              tone="neutral"
            />
          ) : (
            blacklisted.map((person) => (
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
                  busy={removingId === person.id}
                  label="Remove"
                  onPress={() => void removeFromBlacklist(person)}
                />
              </View>
            ))
          )}
          {hasMoreBlacklisted ? (
            <SettingsRow
              busy={blacklistedState === "more"}
              chevron={false}
              label="Load more"
              onPress={() => void loadMoreBlacklisted()}
            />
          ) : null}
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
      <DisableAccountSheet
        onClose={() => setDisableOpen(false)}
        onDisabled={() => void signOutLocally()}
        visible={disableOpen}
      />
      {storageUsage ? (
        <StorageSheet
          onClose={() => setStorageOpen(false)}
          usage={storageUsage}
          visible={storageOpen}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  unverified: { fontSize: fontSize.caption, fontWeight: "600" },
  connection: { alignItems: "center", flexDirection: "row", gap: space.sm },
  blockedName: { fontSize: fontSize.body, fontWeight: "600" },
  blockedRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.m,
    paddingHorizontal: space.md,
    paddingVertical: space.ms,
  },
  blockedText: { flex: 1, minWidth: 0 },
  body: { gap: space.lg, padding: space.m },
  detail: { alignItems: "flex-start", gap: space.xs },
  loading: { padding: space.lg },
  storage: { gap: space.xs, paddingTop: 2 },
  storageFill: { borderRadius: 3, height: "100%", minWidth: 3 },
  storageTrack: { borderRadius: 3, height: 6, overflow: "hidden" },
  value: { fontSize: fontSize.caption },
});
