import { useSession, useUnreadConversations } from "@nw/features";
import { type Href, useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  Linking,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { GlassSurface } from "@/components/glass-surface";
import {
  Chip,
  PillButton,
  SettingsGroup,
  SettingsRow,
} from "@/components/settings";
import { useSignOut } from "@/hooks/use-sign-out";
import { env } from "@/lib/env";
import { useOutbox } from "@/lib/local-store";
import { border, fontSize, radius, space, useAppTheme } from "@/theme";
import { PRIVACY_URL, TERMS_URL, WEB_URL } from "@/lib/links";
import { IconButton } from "@/components/icon-button";

/**
 * The user menu, as a sheet.
 *
 * Laid out after the web app's `MobilePanel`: who you are first, then what you
 * can change about yourself, then where you can go, then help, with signing
 * out alone at the foot.
 *
 * ## What changed from web
 *
 * - **Edit profile is a group, not a pencil.** Web's pencil opens a landing
 *   page that lists Appearance, About and Account; here those sections are the
 *   rows themselves, each saying what is inside and how complete it is, so the
 *   landing step is one tap you do not have to take.
 * - **No Notifications row.** It is a tab in the bar already; a second way to
 *   reach it was a row that pushed the list below the fold on a 667pt phone.
 * - **Bookmarks, Music** are web routes with no native screen yet. A row
 *   that goes nowhere is worse than an absent one. Stories and Library have
 *   theirs: `screens/story-list.tsx` and `app/library.tsx`.
 *
 * ## Swiping it away
 *
 * It slides up from the bottom, so a swipe down puts it back — the same
 * thresholds `BottomSheet` answers. The route is a *transparent* modal with no
 * native animation, so this screen owns both moves: it slides itself up on
 * mount and off before popping. The header is always draggable; the list only
 * while scrolled to the top. Android's back does the same slide.
 */

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

/** `BottomSheet`'s thresholds, so the two sheets close on the same pull. */
const CLOSE_DISTANCE = 110;
const CLOSE_VELOCITY = 0.75;
const DRAG_SLOP = 6;


const stripHtml = (html: string | null | undefined) =>
  (html ?? "").replace(/<[^>]*>/g, "").trim();

export default function MenuScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { novelist, user } = useSession();
  const { unreadCount } = useUnreadConversations();
  const waiting = useOutbox().length;
  const { pending, signOut } = useSignOut();

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  /** Whether the list is at its top — read inside handlers built once. */
  const atTop = useRef(true);

  useEffect(() => {
    Animated.timing(translateY, {
      duration: 240,
      easing: Easing.out(Easing.cubic),
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, [translateY]);

  const close = useCallback(() => {
    Animated.timing(translateY, {
      duration: 180,
      easing: Easing.in(Easing.cubic),
      toValue: SCREEN_HEIGHT,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) router.back();
    });
  }, [router, translateY]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      close();
      return true;
    });
    return () => sub.remove();
  }, [close]);

  const settle = () => {
    Animated.spring(translateY, {
      bounciness: 2,
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const drag = (always: boolean) =>
    PanResponder.create({
      // Claimed in the capture phase so a pull on the list at its top reaches
      // the sheet before the scroll view takes it.
      onMoveShouldSetPanResponderCapture: (_event, gesture) =>
        (always || atTop.current) &&
        gesture.dy > DRAG_SLOP &&
        Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_event, gesture) => {
        translateY.setValue(Math.max(0, gesture.dy));
      },
      onPanResponderRelease: (_event, gesture) => {
        if (gesture.dy > CLOSE_DISTANCE || gesture.vy > CLOSE_VELOCITY) close();
        else settle();
      },
      onPanResponderTerminate: settle,
      onPanResponderTerminationRequest: () => false,
    });

  const headerDrag = useRef(drag(true)).current;
  const listDrag = useRef(drag(false)).current;

  /**
   * Leaves the sheet, then opens the destination beneath where it was.
   *
   * `anchored` puts the stack's first screen under the destination — for the
   * Profile tab's inner pages, which otherwise open as the only screen in a
   * stack nobody had visited yet, with no way back to the profile.
   *
   * `navigate`, never `push`. The action is worked out *now*, while this sheet
   * is still the top of the root stack, and only dispatched after the `back`
   * queued ahead of it — so a `push` to anything inside the tabs was a push of
   * `(tabs)` itself onto the root stack: a second copy of every tab, mounted
   * fresh on top of the first, with Home cold again and the old set frozen
   * underneath. `navigate` finds `(tabs)` already current once the sheet has
   * gone, and hands the rest of the path to the tab that owns it.
   */
  const go = (href: Href, anchored = false) => {
    router.back();
    router.navigate(href, anchored ? { withAnchor: true } : undefined);
  };

  const confirmSignOut = () =>
    Alert.alert("Log out?", "Are you sure you want to log out?", [
      { style: "cancel", text: "Cancel" },
      {
        onPress: () => void signOut(),
        style: "destructive",
        text: "Log out",
      },
    ]);

  const name = novelist
    ? [novelist.firstName, novelist.lastName].filter(Boolean).join(" ") ||
      novelist.username
    : "Signed in";
  const verified = novelist?.isVerified ?? user?.emailVerified ?? false;
  const hasBio = Boolean(stripHtml(novelist?.about));
  const hasNote = Boolean(novelist?.note?.text);
  const hasBanner = Boolean(novelist?.banner?.src);

  return (
    <Animated.View style={[styles.screen, { transform: [{ translateY }] }]}>
      {/*
        One glass sheet over the tabs it was opened from. The route is a
        transparent modal, so those tabs are still drawn behind it and there is
        something for the glass to show. The cards inside are translucent
        material, never glass of their own.
      */}
      <GlassSurface bordered={false} style={styles.screen} variant="sheet">
      <View
        {...headerDrag.panHandlers}
        style={[
          styles.header,
          {
            borderBottomColor: theme.glass.edge,
            paddingTop: insets.top + space.sm,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: theme.text }]}>Menu</Text>
        <IconButton
          accessibilityLabel="Close menu"
          hitSlop={space.sm}
          icon="close"
          onPress={close}
          tone="glass"
        />
      </View>

      <ScrollView
        {...listDrag.panHandlers}
        contentContainerStyle={[
          styles.body,
          { paddingBottom: insets.bottom + space.lg },
        ]}
        onScroll={(event) => {
          atTop.current = event.nativeEvent.contentOffset.y <= 0;
        }}
        scrollEventThrottle={32}
      >
        {/* Who is signed in, and the two things you do with that. */}
        <View
          style={[
            styles.identityCard,
            {
              backgroundColor: theme.material.fillTranslucent,
              borderColor: theme.material.edgeTranslucent,
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            onPress={() => go("/(tabs)/(profile)")}
            style={styles.identityTop}
          >
            <View
              style={[styles.avatarRing, { borderColor: theme.accent.solid }]}
            >
              <Avatar
                image={novelist?.avatar}
                name={novelist?.firstName}
                size={56}
                uri={novelist?.avatar?.src ?? novelist?.image}
                username={novelist?.username}
              />
            </View>
            <View style={styles.identity}>
              <Text
                numberOfLines={1}
                style={[styles.name, { color: theme.text }]}
              >
                {name}
              </Text>
              {novelist ? (
                <Text
                  numberOfLines={1}
                  style={[styles.handle, { color: theme.textGray }]}
                >
                  @{novelist.username}
                </Text>
              ) : null}
              <View style={styles.identityChips}>
                {verified ? (
                  <Chip icon="checkmark-circle" label="Verified" tone="positive" />
                ) : (
                  <Chip icon="alert-circle" label="Unverified" tone="danger" />
                )}
              </View>
            </View>
          </Pressable>
          <View style={styles.identityActions}>
            <View style={styles.identityAction}>
              <PillButton
                icon="person-outline"
                label="View profile"
                onPress={() => go("/(tabs)/(profile)")}
              />
            </View>
            <View style={styles.identityAction}>
              <PillButton
                icon="create-outline"
                label="Edit profile"
                onPress={() => go("/edit-profile")}
                tone="accent"
              />
            </View>
          </View>
        </View>

        <SettingsGroup title="Edit profile">
          <SettingsRow
            icon="color-palette-outline"
            label="Appearance"
            onPress={() => go("/edit-profile/appearance")}
            subtitle={
              <View style={styles.chips}>
                <Chip label="Avatar" tone={novelist?.image ? "accent" : "neutral"} />
                <Chip label="Banner" tone={hasBanner ? "accent" : "neutral"} />
                <Chip label="Note" tone={hasNote ? "accent" : "neutral"} />
                <Chip label="Theme" tone="accent" />
              </View>
            }
          />
          <SettingsRow
            icon="information-circle-outline"
            label="About"
            onPress={() => go("/edit-profile/about")}
            subtitle={hasBio ? "Bio added" : "Tell people about yourself"}
          />
          <SettingsRow
            icon="person-circle-outline"
            label="Account"
            onPress={() => go("/edit-profile/account")}
            subtitle="Email, username, password & connections"
          />
          <SettingsRow
            icon="phone-portrait-outline"
            label="Devices"
            onPress={() => go("/edit-profile/devices")}
            subtitle="Where you are signed in"
          />
          <SettingsRow
            icon="notifications-outline"
            label="Notifications"
            onPress={() => go("/edit-profile/notifications")}
            subtitle="Which notifications may interrupt you"
          />
        </SettingsGroup>

        <SettingsGroup title="Your space">
          <SettingsRow
            icon="sparkles-outline"
            label="Characters"
            onPress={() => go("/(tabs)/(profile)/muses", true)}
          />
          <SettingsRow
            icon="book-outline"
            label="Stories"
            onPress={() => go("/(tabs)/(profile)/stories", true)}
          />
          <SettingsRow
            icon="library-outline"
            label="Library"
            onPress={() => go("/library")}
          />
          <SettingsRow
            badge={unreadCount}
            icon="chatbubbles-outline"
            label="Inbox"
            onPress={() => go("/(tabs)/(inbox)")}
          />
          <SettingsRow
            badge={waiting}
            icon="cloud-upload-outline"
            label="Outbox"
            onPress={() => go("/outbox")}
            subtitle={
              waiting > 0
                ? `${waiting} waiting for a connection`
                : "Messages and posts written offline wait here"
            }
          />
          <SettingsRow
            icon="ribbon-outline"
            label="Badges"
            onPress={() => go("/(tabs)/(profile)/badges", true)}
          />
        </SettingsGroup>

        <SettingsGroup title="Community & help">
          {env.DISCORD_INVITE_URL ? (
            <SettingsRow
              external
              icon="logo-discord"
              label="Join NW Community"
              onPress={() => void Linking.openURL(env.DISCORD_INVITE_URL)}
              tone="discord"
            />
          ) : null}
          {env.SUPPORT_EMAIL ? (
            <SettingsRow
              external
              icon="help-buoy-outline"
              label="Help & support"
              onPress={() =>
                void Linking.openURL(`mailto:${env.SUPPORT_EMAIL}`)
              }
              tone="neutral"
            />
          ) : null}
          <SettingsRow
            external
            icon="globe-outline"
            label="Open novelist.world"
            onPress={() => void Linking.openURL(WEB_URL)}
            tone="neutral"
          />
          <SettingsRow
            external
            icon="document-text-outline"
            label="Terms & conditions"
            onPress={() => void Linking.openURL(TERMS_URL)}
            tone="neutral"
          />
          <SettingsRow
            external
            icon="shield-checkmark-outline"
            label="Privacy policy"
            onPress={() => void Linking.openURL(PRIVACY_URL)}
            tone="neutral"
          />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow
            busy={pending}
            chevron={false}
            icon="log-out-outline"
            label={pending ? "Logging out..." : "Log out"}
            onPress={confirmSignOut}
            tone="danger"
          />
        </SettingsGroup>
      </ScrollView>
      </GlassSurface>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  avatarRing: {
    borderRadius: radius.full,
    borderWidth: 2,
    padding: space.xxs,
  },
  body: { gap: space.md, padding: space.m, paddingTop: space.md },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space.xs, marginTop: 3 },
  handle: { fontSize: fontSize.caption },
  header: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: space.sm,
    paddingHorizontal: space.md,
  },
  headerTitle: { fontSize: fontSize.title, fontWeight: "700" },
  identity: { flex: 1, gap: space.xxs, minWidth: 0 },
  identityAction: { flex: 1 },
  identityActions: { flexDirection: "row", gap: space.sm },
  identityCard: {
    borderRadius: radius.group,
    borderWidth: border.edge,
    gap: space.md,
    padding: space.md,
  },
  identityChips: { flexDirection: "row", gap: space.s, marginTop: space.xs },
  identityTop: { alignItems: "center", flexDirection: "row", gap: space.md },
  name: { fontSize: fontSize.title - 2, fontWeight: "700" },
  screen: { flex: 1 },
});
