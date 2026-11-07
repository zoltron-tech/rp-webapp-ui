import type {
  CreateUpdateMuse,
  Fandom,
  MentionDataItem,
  Muse,
  MuseAboutSection,
} from "@nw/types";
import { API_MESSAGE } from "@nw/types";
import type { MediaMetadata } from "@nw/types/activity";
import type { DataType, WithMessage } from "@nw/types/common";
import type { ProfileSong } from "@nw/types/music";
import type { NWImage } from "@nw/types/novelist";
import type { PrivacyLevel } from "@nw/types/prompt";
import { reverseWsrvUrl, transformMuse } from "@nw/utils/image";
import type { ApiClient } from "../client";

const MUSE = "/rp/portfolio/muse";

/** Every muse write reports `{ message }` on any failure, network included. */
const guarded = <T>(
  api: ApiClient,
  path: string,
  label: string,
  init: Parameters<ApiClient["request"]>[1] = {},
): Promise<T | WithMessage> =>
  api.request<T>(path, { ...init, catchErrors: true, label });

/** Success is an acknowledgement — the body, if any, is not read. */
const ack = async <T>(
  api: ApiClient,
  path: string,
  label: string,
  init: Parameters<ApiClient["raw"]>[1],
  success: T,
): Promise<T | WithMessage> => {
  try {
    const response = await api.raw(path, { ...init, label });
    if (!response.ok) return { message: API_MESSAGE.Error };
    return success;
  } catch {
    return { message: API_MESSAGE.Error };
  }
};

const musesWith = async (
  api: ApiClient,
  path: string,
  label: string,
  size: "feed" | "hero",
  options: { anonymous?: boolean } = {},
): Promise<DataType<Muse[]>> => {
  const result = await api.requestNullable<Muse[]>(path, {
    ...options,
    label,
    notFound: "null",
  });
  if (Array.isArray(result)) for (const m of result) transformMuse(m, size);
  return result;
};

/**
 * Intentionally no wsrv transform: the muse profile page renders the original
 * full-resolution S3 images. Resized variants are only for the smaller muse
 * cards (feed / hero / novelist-profile lists).
 */
export const getMuse = (api: ApiClient, museId: string) =>
  api.requestNullable<Muse>(`${MUSE}/${museId}`, {
    label: "getMuseAction",
    notFound: "null",
  });

export const getMuseAboutSections = (api: ApiClient, museId: string) =>
  api.requestNullable<MuseAboutSection[]>(`${MUSE}/about/by/${museId}`, {
    label: "getMuseAboutSectionsAction",
    notFound: "null",
  });

export const getMuseAboutSection = (api: ApiClient, sectionId: string) =>
  api.requestNullable<MuseAboutSection>(`${MUSE}/about/${sectionId}`, {
    label: "getMuseAboutSectionAction",
    notFound: "null",
  });

export const addMuseAboutSection = (
  api: ApiClient,
  museId: string,
  text: string,
  ordinal: number,
  image?: string | null,
) =>
  api.request<MuseAboutSection>(`${MUSE}/about`, {
    body: { image: image ?? null, museId, ordinal, text },
    label: "addMuseAboutSectionAction",
    method: "POST",
  });

export const updateMuseAboutSection = (
  api: ApiClient,
  sectionId: string,
  text: string,
  ordinal: number,
  image?: string | null,
) =>
  api.request<MuseAboutSection>(`${MUSE}/about/${sectionId}`, {
    body: { image: image ?? null, ordinal, text },
    label: "updateMuseAboutSectionAction",
    method: "PUT",
  });

export const deleteMuseAboutSection = (api: ApiClient, sectionId: string) =>
  ack(
    api,
    `${MUSE}/about/${sectionId}`,
    "deleteMuseAboutSectionAction",
    { method: "DELETE" },
    { message: API_MESSAGE.Success } as WithMessage,
  );

export const getAllMusesByUsername = (api: ApiClient, username: string) =>
  musesWith(api, `${MUSE}/by/${username}`, "getAllMusesByUsernameAction", "hero");

export const getAllMuses = (api: ApiClient) =>
  musesWith(api, `${MUSE}/all`, "getAllMusesAction", "feed");

/** Public: the landing-page hero carousel. */
export const getHeroPageMuses = (api: ApiClient) =>
  musesWith(api, `${MUSE}/random`, "getHeroPageMusesAction", "hero", {
    anonymous: true,
  });

/**
 * One page of the character directory (`GET /muse/directory`): every muse the
 * caller may see, alphabetically.
 *
 * `query` matches a first, last or full name prefix, or a fandom ("hp");
 * `fandoms` are fandom ids, any of which a muse must be in — with an empty
 * query, every muse in them. Session optional: signed out sees PUBLIC only.
 * An empty page is the end of the directory.
 */
export const getMuseDirectory = (
  api: ApiClient,
  {
    fandoms = [],
    pageNumber,
    pageSize,
    query = "",
  }: {
    fandoms?: readonly string[];
    pageNumber: number;
    pageSize: number;
    query?: string;
  },
) => {
  const params = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  });
  const trimmed = query.trim();
  if (trimmed) params.set("query", trimmed);
  if (fandoms.length > 0) params.set("fandoms", fandoms.join(","));
  return musesWith(
    api,
    `${MUSE}/directory?${params.toString()}`,
    "getMuseDirectoryAction",
    "feed",
  );
};

/** Public: the fandom picker is usable before sign-in. */
export const searchFandoms = (api: ApiClient, prefix: string) =>
  api.requestNullable<Fandom[]>(
    `/rp/portfolio/fandom/search?prefix=${encodeURIComponent(prefix)}`,
    {
      anonymous: true,
      label: "searchFandomsAction",
      notFound: "null",
    },
  );

/** Falls back to an empty list — the mention dropdown has nothing to say on failure. */
export const searchMentionMuses = async (
  api: ApiClient,
  prefix: string,
): Promise<MentionDataItem[]> => {
  const response = await api.raw(
    `${MUSE}/search/musesByFriends?prefix=${prefix}`,
    { label: "searchMentionMusesAction" },
  );
  if (!response.ok) return [];
  return (await response.json()) as MentionDataItem[];
};

/**
 * Strips wsrv.nl proxy URLs back to original S3 URLs before sending.
 *
 * Muse data reaching edit flows may carry wsrv.nl display URLs (from list/card
 * actions or the store), but the backend expects the raw S3 URL to detect
 * changes and manage S3 cleanup. Sending a proxy URL makes the backend delete
 * the original S3 file (URL mismatch) and persist the proxy URL in the DB.
 */
const unproxyMuse = (muse: CreateUpdateMuse): CreateUpdateMuse => ({
  ...muse,
  cardBackground: muse.cardBackground
    ? {
        ...muse.cardBackground,
        crop: muse.cardBackground.crop
          ? {
              ...muse.cardBackground.crop,
              src: reverseWsrvUrl(muse.cardBackground.crop.src),
            }
          : muse.cardBackground.crop,
        src: reverseWsrvUrl(muse.cardBackground.src),
      }
    : muse.cardBackground,
  image: reverseWsrvUrl(muse.image),
  wallpaper: muse.wallpaper
    ? {
        ...muse.wallpaper,
        crop: muse.wallpaper.crop
          ? {
              ...muse.wallpaper.crop,
              src: reverseWsrvUrl(muse.wallpaper.crop.src),
            }
          : muse.wallpaper.crop,
        src: reverseWsrvUrl(muse.wallpaper.src),
      }
    : muse.wallpaper,
});

export const updateMuse = async (
  api: ApiClient,
  museId: string | null,
  muse: CreateUpdateMuse,
): Promise<Muse | WithMessage> => {
  const isUpdate = !!museId && museId.trim() !== "";

  const result = await guarded<WithMessage<Muse>>(
    api,
    isUpdate ? `${MUSE}/${museId}` : MUSE,
    "updateMuseAction",
    { body: unproxyMuse(muse), method: isUpdate ? "PUT" : "POST" },
  );

  if ("message" in result && !("id" in result)) return result as WithMessage;

  // The service echoes a `message` alongside the muse; drop it so callers can
  // keep using `"message" in result` to mean failure. The key itself has to
  // go — `{ ...result, message: undefined }` still answers `"message" in`
  // with `true`, which is how every save read as "Not saved" after a 200.
  const { message: _echoed, ...saved } = result as WithMessage<Muse>;
  return saved as unknown as Muse;
};

export const deleteMuse = (api: ApiClient, museId: string) =>
  ack(
    api,
    `${MUSE}/${museId}`,
    "deleteMuseAction",
    { method: "DELETE" },
    { message: API_MESSAGE.Success } as WithMessage,
  );

// ─── Media ───────────────────────────────────────────────────────────────────

export const getMuseMedia = (api: ApiClient, museId: string) =>
  api.requestNullable<string[]>(`${MUSE}/${museId}/media`, {
    label: "getMuseMediaAction",
    notFound: "null",
  });

export const addMuseMedia = (api: ApiClient, museId: string, urls: string[]) =>
  ack(
    api,
    `${MUSE}/${museId}/media`,
    "addMuseMediaAction",
    { body: { urls }, method: "POST" },
    { message: API_MESSAGE.Success } as WithMessage,
  );

export const deleteMuseMedia = (api: ApiClient, museId: string, url: string) =>
  ack(
    api,
    `${MUSE}/${museId}/media?url=${encodeURIComponent(url)}`,
    "deleteMuseMediaAction",
    { method: "DELETE" },
    { message: API_MESSAGE.Success } as WithMessage,
  );

export const getMuseMediaMetadata = (api: ApiClient, museId: string) =>
  api.requestNullable<MediaMetadata[]>(`${MUSE}/${museId}/media/metadata`, {
    label: "getMuseMediaMetadataAction",
    notFound: "null",
  });

export const editMediaDescription = (
  api: ApiClient,
  museId: string,
  mediaUrl: string,
  description: string,
) =>
  api.request<MediaMetadata>(`${MUSE}/${museId}/media/description`, {
    body: { description, mediaUrl },
    label: "editMediaDescriptionAction",
    method: "PUT",
  });

// ─── Attributes ──────────────────────────────────────────────────────────────

export const changeMuseFandom = (
  api: ApiClient,
  museId: string,
  fandomId: string,
) =>
  guarded<Fandom>(api, `${MUSE}/${museId}/fandom`, "changeMuseFandomAction", {
    body: { fandomId },
    method: "PUT",
  });

export const addMuseNickname = (
  api: ApiClient,
  museId: string,
  nickname: string,
) =>
  guarded<string[]>(
    api,
    `${MUSE}/${museId}/nickname`,
    "addMuseNicknameAction",
    { body: { nickname }, method: "POST" },
  );

export const editMuseNickname = (
  api: ApiClient,
  museId: string,
  oldNickname: string,
  newNickname: string,
) =>
  guarded<string[]>(
    api,
    `${MUSE}/${museId}/nickname`,
    "editMuseNicknameAction",
    { body: { newNickname, oldNickname }, method: "PUT" },
  );

export const removeMuseNickname = (
  api: ApiClient,
  museId: string,
  nickname: string,
) =>
  guarded<string[]>(
    api,
    `${MUSE}/${museId}/nickname?nickname=${encodeURIComponent(nickname)}`,
    "removeMuseNicknameAction",
    { method: "DELETE" },
  );

export const setMusePrivacy = (
  api: ApiClient,
  museId: string,
  privacy: PrivacyLevel,
) =>
  guarded<PrivacyLevel>(
    api,
    `${MUSE}/${museId}/privacy`,
    "setMusePrivacyAction",
    { body: { privacy }, method: "PUT" },
  );

export const addMuseExtraAttribute = (
  api: ApiClient,
  museId: string,
  key: string,
  value: string,
) =>
  guarded<Record<string, string>>(
    api,
    `${MUSE}/${museId}/extra-attribute`,
    "addMuseExtraAttributeAction",
    { body: { key, value }, method: "POST" },
  );

export const removeMuseExtraAttribute = (
  api: ApiClient,
  museId: string,
  key: string,
) =>
  guarded<Record<string, string>>(
    api,
    `${MUSE}/${museId}/extra-attribute/${encodeURIComponent(key)}`,
    "removeMuseExtraAttributeAction",
    { method: "DELETE" },
  );

export const editMuseExtraAttribute = (
  api: ApiClient,
  museId: string,
  oldKey: string,
  key: string,
  value: string,
) =>
  guarded<Record<string, string>>(
    api,
    `${MUSE}/${museId}/extra-attribute/${encodeURIComponent(oldKey)}`,
    "editMuseExtraAttributeAction",
    { body: { key, value }, method: "PUT" },
  );

// ─── Song, avatar, background, note ──────────────────────────────────────────

export const setMuseSong = (
  api: ApiClient,
  museId: string,
  payload: Partial<ProfileSong> & {
    source: ProfileSong["source"];
    title: string;
  },
) =>
  guarded<ProfileSong>(api, `${MUSE}/${museId}/song`, "setMuseSongAction", {
    body: payload,
    method: "PUT",
  });

/** Clears the muse's featured song. Owner only. */
export const deleteMuseSong = (api: ApiClient, museId: string) =>
  ack(
    api,
    `${MUSE}/${museId}/song`,
    "deleteMuseSongAction",
    { method: "DELETE" },
    { message: API_MESSAGE.Success } as WithMessage,
  );

export const setMuseAvatar = (
  api: ApiClient,
  museId: string,
  image: NWImage,
) =>
  guarded<NWImage>(api, `${MUSE}/${museId}/avatar`, "setMuseAvatarAction", {
    body: image,
    method: "PUT",
  });

export const removeMuseAvatar = (api: ApiClient, museId: string) =>
  ack(
    api,
    `${MUSE}/${museId}/avatar`,
    "removeMuseAvatarAction",
    { method: "DELETE" },
    true,
  );

export const setMuseCardBackground = (
  api: ApiClient,
  museId: string,
  image: NWImage,
) =>
  guarded<NWImage>(
    api,
    `${MUSE}/${museId}/card-background`,
    "setMuseCardBackgroundAction",
    { body: image, method: "PUT" },
  );

export const removeMuseCardBackground = (api: ApiClient, museId: string) =>
  ack(
    api,
    `${MUSE}/${museId}/card-background`,
    "removeMuseCardBackgroundAction",
    { method: "DELETE" },
    true,
  );

/** The note comes back as plain text, not JSON. */
export const setMuseNote = async (
  api: ApiClient,
  museId: string,
  note: string,
): Promise<string | WithMessage> => {
  try {
    const response = await api.raw(`${MUSE}/${museId}/note`, {
      body: { note },
      label: "setMuseNoteAction",
      method: "PUT",
    });
    if (!response.ok) return { message: API_MESSAGE.Error };
    return await response.text();
  } catch {
    return { message: API_MESSAGE.Error };
  }
};

export const removeMuseNote = (api: ApiClient, museId: string) =>
  ack(
    api,
    `${MUSE}/${museId}/note`,
    "removeMuseNoteAction",
    { method: "DELETE" },
    true,
  );
