import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { Platform } from "react-native";
import { authedApi } from "@/lib/api";
import { notificationHref } from "@/lib/notification-target";

/**
 * Push on the phone (NOTIFICATIONS_PLAN.md, phase 3A).
 *
 * The same `push_device` registration the browser makes, with an Expo token
 * in place of a subscription. chat-server pushes to it through Expo, which
 * hands it to FCM (Android) or APNs (iOS). Everything here is shared by both
 * platforms; what differs is set up outside the code: FCM credentials on the
 * Expo project for Android, an APNs key for iOS, which is paused.
 *
 * Nothing here throws out to the app. A phone with no credentials behind it
 * (no `google-services.json` yet, an emulator, a build without the native
 * module) logs one line and is simply not registered.
 */

/**
 * The Android channels, one per kind of notification, so the phone's own
 * settings can silence each. Ids must match chat-server's `channelFor`.
 * Importance is fixed here and cannot be changed by the app afterwards: a
 * like is quiet, everything else makes a sound.
 */
const CHANNELS: {
  id: string;
  name: string;
  importance: Notifications.AndroidImportance;
}[] = [
  {
    id: "messages",
    importance: Notifications.AndroidImportance.HIGH,
    name: "Messages",
  },
  {
    id: "comments",
    importance: Notifications.AndroidImportance.HIGH,
    name: "Comments and replies",
  },
  {
    id: "mentions",
    importance: Notifications.AndroidImportance.HIGH,
    name: "Mentions",
  },
  {
    id: "requests",
    importance: Notifications.AndroidImportance.DEFAULT,
    name: "Friend requests",
  },
  {
    id: "muses",
    importance: Notifications.AndroidImportance.DEFAULT,
    name: "Character connections",
  },
  {
    id: "stories",
    importance: Notifications.AndroidImportance.DEFAULT,
    name: "Stories",
  },
  {
    id: "reactions",
    importance: Notifications.AndroidImportance.LOW,
    name: "Likes",
  },
  {
    id: "other",
    importance: Notifications.AndroidImportance.DEFAULT,
    name: "Other",
  },
];

/** What a push carries, as chat-server builds it (`push-payload.ts`). */
type PushData = {
  url?: string;
  kind?: string;
  conversationId?: string;
  notificationId?: string;
  badge?: number;
};

/** The conversation on screen, if any: a push for it is not shown over it. */
let openConversationId: string | null = null;

export const setOpenConversation = (conversationId: string | null) => {
  openConversationId = conversationId;
};

/**
 * What to do with a push that arrives while the app is open. A message for
 * the conversation being read is already in front of the reader: nothing.
 * Anything else is shown as it would be in the background, so the app is
 * not silent just because it is open.
 */
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data as PushData | undefined;
    const hidden =
      data?.kind === "MESSAGE" &&
      !!data.conversationId &&
      data.conversationId === openConversationId;
    return {
      shouldPlaySound: !hidden,
      shouldSetBadge: false,
      shouldShowBanner: !hidden,
      shouldShowList: !hidden,
    };
  },
});

let channelsReady = false;

const ensureChannels = async () => {
  if (channelsReady || Platform.OS !== "android") return;
  await Promise.all(
    CHANNELS.map((channel) =>
      Notifications.setNotificationChannelAsync(channel.id, {
        importance: channel.importance,
        name: channel.name,
        sound:
          channel.importance >= Notifications.AndroidImportance.DEFAULT
            ? "default"
            : undefined,
      }),
    ),
  );
  channelsReady = true;
};

/** Whether the phone would show a push at all. Asks once; later calls read the answer. */
const permissionGranted = async (ask: boolean): Promise<boolean> => {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!ask || !current.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
};

const projectId = (): string | undefined =>
  (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)
    ?.eas?.projectId;

/** The token registered last, so a repeat registration costs nothing. */
let registeredToken: string | null = null;

/**
 * Registers this phone for push: channels, permission, token, server.
 *
 * `ask: false` is the silent path for a launch — it registers only when
 * permission was already given. `ask: true` is for a moment the person has a
 * reason to want pushes, and may show the system prompt once.
 */
export const registerForPush = async (ask: boolean): Promise<void> => {
  try {
    if (!Device.isDevice) return;
    await ensureChannels();
    if (!(await permissionGranted(ask))) return;

    const id = projectId();
    const { data: token } = await Notifications.getExpoPushTokenAsync(
      id ? { projectId: id } : undefined,
    );
    if (!token || token === registeredToken) return;

    const response = await authedApi.raw("/rp/portfolio/push/device", {
      body: { platform: "EXPO", token },
      label: "pushRegisterDevice",
      method: "POST",
    });
    if (response.ok) registeredToken = token;
    else console.warn("[Push] device was not accepted", response.status);
  } catch (err) {
    // No credentials yet, an emulator, or the native module is missing from
    // this build. One line; the app carries on without push.
    console.warn(
      "[Push] not registered:",
      err instanceof Error ? err.message : err,
    );
  }
};

/** Called before the session is forgotten, while the token still authenticates. */
export const unregisterFromPush = async (): Promise<void> => {
  const token = registeredToken;
  registeredToken = null;
  if (!token) return;
  try {
    await authedApi.raw("/rp/portfolio/push/device", {
      body: { platform: "EXPO", token },
      label: "pushUnregisterDevice",
      method: "DELETE",
    });
  } catch {
    // The server prunes a token the push service reports gone; nothing to do.
  }
};

/** Keeps the server's copy current when the platform rotates the token. */
export const watchPushToken = (): (() => void) => {
  const subscription = Notifications.addPushTokenListener(() => {
    void registerForPush(false);
  });
  return () => subscription.remove();
};

/**
 * Where a tapped push goes. A message opens its conversation; a notification
 * opens what it is about, by the same table the Alerts list uses, or the list
 * itself when the kind is unknown here. Pushed from wherever the app was,
 * never into a second copy of the tab tree.
 */
export const openPush = (data: PushData | undefined) => {
  if (!data) return;

  if (data.kind === "MESSAGE" && data.conversationId) {
    router.push({
      params: { conversationId: data.conversationId },
      pathname: "/(tabs)/(inbox)/[conversationId]",
    });
    return;
  }

  const href = data.url ? hrefFromUrl(data.url) : null;
  if (href) router.push(href);
  else router.push("/(tabs)/(notifications)");
};

/**
 * The web path a push carries (`/rp/thread/<id>`), read back into a screen.
 * The same destinations `notificationHref` knows; a path with no screen here
 * opens the Alerts list.
 */
const hrefFromUrl = (
  url: string,
): { pathname: string; params: Record<string, string> } | null => {
  const match = url.match(
    /^\/rp\/(thread|prompt|muse|story|notifications)(?:\/event)?\/?([^/?#]*)/,
  );
  if (!match) return null;
  const [, kind, id] = match;
  if (!id && kind !== "notifications") return null;

  // Through the one table, so a change there is a change here.
  const type =
    kind === "thread"
      ? "PROMPT_COMMENT"
      : kind === "prompt"
        ? "REACTION"
        : kind === "muse"
          ? "MUSE_CONNECTION_UPDATE"
          : null;
  if (!type) return null;

  return notificationHref({
    id: "",
    type,
    source: {
      id: "",
      title: "",
      sourceType: "NOVELIST",
      urlProp: "",
      image: "",
    },
    target: { targetType: kind === "prompt" ? "PROMPT" : "", urlProp: id },
    notificationText: "",
    isRead: true,
    date: 0,
  });
};

/** Listens for taps while the app runs, and handles the one that launched it. */
export const watchPushTaps = (): (() => void) => {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      openPush(response.notification.request.content.data as PushData);
    },
  );
  return () => subscription.remove();
};

/** The tap that opened the app from cold, if there was one; handled once. */
let launchHandled = false;

export const openLaunchPush = async () => {
  if (launchHandled) return;
  launchHandled = true;
  try {
    const response = await Notifications.getLastNotificationResponseAsync();
    if (response)
      openPush(response.notification.request.content.data as PushData);
  } catch {
    // Nothing to open.
  }
};

/** The number on the app icon. The server's count, set whenever it changes. */
export const setAppBadge = (count: number) => {
  void Notifications.setBadgeCountAsync(Math.max(0, count)).catch(
    () => undefined,
  );
};

/** Pushes shown for a conversation are stale once it is open. */
export const dismissConversationPushes = async (conversationId: string) => {
  try {
    const shown = await Notifications.getPresentedNotificationsAsync();
    await Promise.all(
      shown
        .filter(
          (notification) =>
            (notification.request.content.data as PushData | undefined)
              ?.conversationId === conversationId,
        )
        .map((notification) =>
          Notifications.dismissNotificationAsync(
            notification.request.identifier,
          ),
        ),
    );
  } catch {
    // Not supported here; the tray clears itself in time.
  }
};
