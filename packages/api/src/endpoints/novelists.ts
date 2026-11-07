import type {
  DisableAccountPayload,
  Friend,
  NotificationCounts,
  NotificationFeed,
  NotificationMute,
  Novelist,
  NovelistNote,
  NovelistWorldNotification,
  UpdateNovelistPayload,
} from "@nw/types";
import { API_MESSAGE } from "@nw/types";
import type { DataType, SearchResult, WithMessage } from "@nw/types/common";
import type { Message } from "@nw/types/conversation";
import {
  reverseWsrvUrl,
  transformFriend,
  transformNovelist,
} from "@nw/utils/image";
import type { ApiClient } from "../client";

/** What the portfolio service returns from a reaction write. */
export type ReactionResponse = {
  reacted: boolean;
  reactions: number;
};

const NOVELIST = "/rp/portfolio/novelist";

/**
 * Public: the landing-page carousel.
 *
 * Uses the "carousel" image sizes rather than "profile" — the latter leaves
 * avatars as un-resized S3 originals, which is right for a full profile page
 * but far too heavy for eight cards loading at once.
 */
export const getNovelists = async (
  api: ApiClient,
): Promise<Novelist[] | WithMessage> => {
  const result = await api.requestNullable<Novelist[]>(`${NOVELIST}/all`, {
    anonymous: true,
    contentType: false,
    label: "getNovelists",
    notFound: "empty-array",
  });
  if (Array.isArray(result)) {
    for (const n of result) transformNovelist(n, "carousel");
    return result;
  }
  return result ?? { message: API_MESSAGE.Error };
};

const oneNovelist = async (
  api: ApiClient,
  path: string,
  label: string,
  catchErrors = false,
): Promise<DataType<Novelist>> => {
  const result = await api.requestNullable<Novelist>(path, {
    catchErrors,
    label,
    notFound: "null",
  });
  if (result && !("message" in result)) transformNovelist(result, "profile");
  return result;
};

export const getNovelistById = (api: ApiClient, novelistId: string) =>
  oneNovelist(api, `${NOVELIST}/${novelistId}`, "getNovelistByIdAction");

export const getNovelist = (api: ApiClient, username: string) =>
  oneNovelist(
    api,
    `${NOVELIST}/get?username=${username}`,
    "getNovelistAction",
    true,
  );

/**
 * Disables the caller's account and signs them out everywhere
 * (ACCOUNT_DISABLE_PLAN.md). Signing in again switches it back on. The
 * reason is optional. Call `logoutEverywhere` after it, as the normal sign-out
 * path, so the client's own session state clears too.
 */
export const disableAccount = async (
  api: ApiClient,
  payload: DisableAccountPayload = {},
): Promise<WithMessage> => {
  const response = await api.raw(`${NOVELIST}/disable`, {
    body: payload,
    label: "disableAccount",
    method: "POST",
  });

  if (response.status === 401) return { message: API_MESSAGE.Unauthorized };
  if (!response.ok) return { message: API_MESSAGE.UncategorizedError };
  return { message: API_MESSAGE.Success };
};

/** Distinguishes "no novelist yet" (404) from a real failure — onboarding depends on it. */
export const getUserNovelist = async (
  api: ApiClient,
): Promise<Novelist | WithMessage> => {
  const response = await api.raw(NOVELIST, { label: "getUserNovelist" });

  if (response.status === 404) return { message: API_MESSAGE.NotFound };
  if (!response.ok) return { message: API_MESSAGE.UncategorizedError };

  const novelist = (await response.json()) as Novelist;
  transformNovelist(novelist, "profile");
  return novelist;
};

export const getNotifications = (
  api: ApiClient,
  pageNumber: number,
  pageSize: number,
): Promise<DataType<NovelistWorldNotification[]>> =>
  api.requestNullable<NovelistWorldNotification[]>(
    `/rp/portfolio/notification?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    { label: "getNotifications", notFound: "null" },
  );

/**
 * The feed by cursor: leave `cursor` out for the newest rows, then pass back
 * each page's `nextCursor` until it is null.
 */
export const getNotificationFeed = (
  api: ApiClient,
  cursor: string | null,
  limit: number,
): Promise<DataType<NotificationFeed>> => {
  const query = new URLSearchParams({ limit: String(limit) });
  if (cursor) query.set("cursor", cursor);
  return api.requestNullable<NotificationFeed>(
    `/rp/portfolio/notification/feed?${query.toString()}`,
    { label: "getNotificationFeed", notFound: "null" },
  );
};

/** `null` from a server that has no such endpoint yet. */
export const getNotificationCounts = (
  api: ApiClient,
): Promise<DataType<NotificationCounts>> =>
  api.requestNullable<NotificationCounts>(
    "/rp/portfolio/notification/unread-count",
    { label: "getNotificationCounts", notFound: "null" },
  );

/** The list was opened: clears the badge, leaves the rows highlighted. */
export const markNotificationsSeen = (api: ApiClient): Promise<Response> =>
  api.raw("/rp/portfolio/notification/seen", {
    label: "markNotificationsSeen",
    method: "POST",
  });

/** One row was opened. A pending request has no stored row and is not sent here. */
export const markNotificationRead = (
  api: ApiClient,
  notificationId: string,
): Promise<Response> =>
  api.raw(`/rp/portfolio/notification/${notificationId}/read`, {
    label: "markNotificationRead",
    method: "PATCH",
  });

// ── Mutes ───────────────────────────────────────────────────────────────────

/** `null` from a server that has no such endpoint yet. */
export const getNotificationMutes = (
  api: ApiClient,
): Promise<DataType<NotificationMute[]>> =>
  api.requestNullable<NotificationMute[]>("/rp/portfolio/notification/mutes", {
    label: "getNotificationMutes",
    notFound: "null",
  });

/** Mutes `key` until `until` (ISO), or until unmuted when `until` is null. */
export const setNotificationMute = async (
  api: ApiClient,
  key: string,
  until: string | null,
): Promise<NotificationMute | null> => {
  const response = await api.raw(
    `/rp/portfolio/notification/mutes/${encodeURIComponent(key)}`,
    { body: { until }, label: "setNotificationMute", method: "PUT" },
  );
  if (!response.ok) return null;
  return (await response.json()) as NotificationMute;
};

export const clearNotificationMute = async (
  api: ApiClient,
  key: string,
): Promise<boolean> => {
  const response = await api.raw(
    `/rp/portfolio/notification/mutes/${encodeURIComponent(key)}`,
    { label: "clearNotificationMute", method: "DELETE" },
  );
  return response.ok;
};

export const patchNotifications = async (
  api: ApiClient,
): Promise<"success" | null> => {
  const response = await api.raw("/rp/portfolio/notification", {
    label: "patchNotifications",
    method: "PATCH",
  });
  return response.status === 404 ? null : "success";
};

/**
 * Strips wsrv.nl proxy URLs back to original S3 URLs before sending.
 *
 * The global novelist state is seeded via `getUserNovelist`, which runs
 * `transformNovelist` (S3 → wsrv.nl). Sending a proxy URL back makes the
 * backend see a changed URL, delete the original S3 file, and persist the proxy
 * URL — the same bug that affects `updateMuse`.
 */
const unproxyNovelist = (
  novelist: UpdateNovelistPayload,
): UpdateNovelistPayload => ({
  ...novelist,
  avatar: novelist.avatar
    ? {
        ...novelist.avatar,
        crop: novelist.avatar.crop
          ? {
              ...novelist.avatar.crop,
              src: reverseWsrvUrl(novelist.avatar.crop.src),
            }
          : novelist.avatar.crop,
        src: reverseWsrvUrl(novelist.avatar.src),
      }
    : novelist.avatar,
  banner: novelist.banner
    ? {
        ...novelist.banner,
        crop: novelist.banner.crop
          ? {
              ...novelist.banner.crop,
              src: reverseWsrvUrl(novelist.banner.crop.src),
            }
          : novelist.banner.crop,
        src: reverseWsrvUrl(novelist.banner.src),
      }
    : novelist.banner,
  image: reverseWsrvUrl(novelist.image),
});

export const updateUserNovelist = async (
  api: ApiClient,
  payload: UpdateNovelistPayload,
  create = false,
): Promise<Novelist | WithMessage> => {
  const result = await api.request<WithMessage<Novelist>>(NOVELIST, {
    body: unproxyNovelist(payload),
    label: "updateUserNovelist",
    method: create ? "POST" : "PUT",
  });

  if ("message" in result && !("id" in result)) return result;

  // The service echoes a `message` alongside the novelist; drop it so callers
  // can keep using `"message" in result` to mean failure. The key itself has
  // to go — `message: undefined` still answers `"message" in` with `true`.
  const { message: _echoed, ...novelist } = result;
  return novelist as unknown as Novelist;
};

export const search = (
  api: ApiClient,
  searchTerm: string,
  type = "novelist",
): Promise<DataType<SearchResult[]>> =>
  api.requestNullable<SearchResult[]>(
    `/rp/portfolio/${type}/search?prefix=${encodeURIComponent(searchTerm)}`,
    { label: "searchAction", notFound: "empty-array" },
  );

export const getChatMessages = (
  api: ApiClient,
  targetUserName: string,
): Promise<DataType<Message[]>> =>
  api.requestNullable<Message[]>(
    `/rp/portfolio/chat/getMessages/${encodeURIComponent(targetUserName)}`,
    { label: "chatAction", notFound: "empty-array" },
  );

export const addNote = (
  api: ApiClient,
  text: string,
  color: string | null,
  emoji: string | null,
): Promise<NovelistNote | WithMessage> =>
  api.request<NovelistNote>("/rp/portfolio/note", {
    body: { color, emoji, text },
    label: "addNoteAction",
    method: "POST",
  });

/** 404 means it did not exist — still a success state for a delete. */
const deleteIgnoringMissing = async (
  api: ApiClient,
  path: string,
  label: string,
): Promise<WithMessage> => {
  const response = await api.raw(path, { label, method: "DELETE" });
  const ok = response.ok || response.status === 404;
  return { message: ok ? API_MESSAGE.Success : API_MESSAGE.Error };
};

export const deleteBanner = (api: ApiClient) =>
  deleteIgnoringMissing(api, `${NOVELIST}/banner`, "deleteBannerAction");

export const deleteNote = (api: ApiClient) =>
  deleteIgnoringMissing(api, "/rp/portfolio/note", "deleteNoteAction");

/**
 * `"row"` rather than `"feed"`: every consumer of this endpoint draws the
 * result as a list row, on both clients, and `"feed"` was sizing the banner for
 * a web card four times as wide as the row it actually lands in.
 */
const friendsOrEmpty = async (
  api: ApiClient,
  path: string,
  label: string,
): Promise<Friend[]> => {
  const response = await api.raw(path, { label });
  if (!response.ok) return [];
  const friends = (await response.json()) as Friend[];
  for (const f of friends) transformFriend(f, "row");
  return friends;
};

export const getFriendsByUsername = (
  api: ApiClient,
  username: string,
  pageNumber: number,
  pageSize: number,
) =>
  friendsOrEmpty(
    api,
    `${NOVELIST}/friends?username=${username}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
    "getFriendsByUsernameAction",
  );

/**
 * Adds or removes this novelist's reaction on a target.
 *
 * Went through a Next route handler until the React migration, purely so the
 * JWT cookie could be turned into a header server-side. The browser attaches
 * that header itself now, so this calls the portfolio service directly and the
 * proxy is gone.
 */
export const setReaction = (
  api: ApiClient,
  targetId: string,
  targetType: string,
): Promise<ReactionResponse | WithMessage> =>
  api.request<ReactionResponse>(
    `/rp/portfolio/react/${encodeURIComponent(targetId)}?targetType=${encodeURIComponent(targetType)}`,
    { label: "setReaction", method: "PATCH", requireAuth: true },
  );

export const removeReaction = (
  api: ApiClient,
  targetId: string,
): Promise<ReactionResponse | WithMessage> =>
  api.request<ReactionResponse>(
    `/rp/portfolio/react/${encodeURIComponent(targetId)}`,
    {
      label: "removeReaction",
      method: "DELETE",
      requireAuth: true,
    },
  );

export const getReactionLikers = (
  api: ApiClient,
  targetId: string,
  pageNumber: number,
  pageSize: number,
) =>
  friendsOrEmpty(
    api,
    `/rp/portfolio/react/${encodeURIComponent(targetId)}/likers?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    "getReactionLikersAction",
  );

/**
 * The guides this novelist has already been through, by their own ids.
 *
 * Null when nobody is signed in, or when the service could not be reached —
 * both mean "we do not know", and a guide that auto-opens must not fire on a
 * guess. See `useUserGuide`.
 */
export const getViewedGuides = async (
  api: ApiClient,
): Promise<string[] | null> => {
  try {
    const response = await api.raw(`${NOVELIST}/guides`, {
      contentType: false,
      label: "getViewedGuidesAction",
    });
    if (!response.ok) return null;
    return (await response.json()) as string[];
  } catch {
    return null;
  }
};

/**
 * Records that this novelist finished a guide, and returns the whole list back.
 * Idempotent server-side, so finishing one twice is not worth guarding against.
 */
export const markGuideViewed = async (
  api: ApiClient,
  guideId: string,
): Promise<string[] | null> => {
  try {
    const response = await api.raw(
      `${NOVELIST}/guides/${encodeURIComponent(guideId)}`,
      { contentType: false, label: "markGuideViewedAction", method: "POST" },
    );
    if (!response.ok) return null;
    return (await response.json()) as string[];
  } catch {
    return null;
  }
};
