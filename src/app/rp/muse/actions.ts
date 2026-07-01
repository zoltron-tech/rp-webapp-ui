"use server";
import getConfig from "next/config";
import { authenticateAndGetJWT, getJWTIfExists } from "@/app/actions";
import type {
  CreateUpdateMuse,
  Fandom,
  MentionDataItem,
  Muse,
  MuseAboutSection,
} from "@/types";
import type { NWImage } from "@/types/novelist";
import type { PrivacyLevel } from "@/types/prompt";
import type { DataType, WithMessage } from "@/types/common";
import { API_MESSAGE, AUTH_HEADER_NAME } from "@/utils/constants";
import { reverseWsrvUrl, transformMuse } from "@/utils/image";
import { Logger } from "@/utils/services";

const { serverRuntimeConfig } = getConfig();
const { RP_SERVICE_URL } = serverRuntimeConfig;

export const getMuseAction = async (
  museId: string,
): Promise<DataType<Muse>> => {
  const jwt = await getJWTIfExists();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/${museId}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const response = await fetch(URL, {
    cache: "no-store",
    headers,
  });

  Logger.debug("getMuseAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const muse: Muse = await response.json();

  transformMuse(muse, "profile");

  return muse;
};

export const getMuseAboutSectionsAction = async (
  museId: string,
): Promise<DataType<MuseAboutSection[]>> => {
  const jwt = await getJWTIfExists();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/about/by/${museId}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const response = await fetch(URL, {
    cache: "no-store",
    headers,
  });

  Logger.debug("getMuseAboutSectionsAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const aboutSections: MuseAboutSection[] = await response.json();

  return aboutSections;
};

export const addMuseAboutSectionAction = async (
  museId: string,
  text: string,
  ordinal: number,
  image?: string | null,
) => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/about`;
  const response = await fetch(URL, {
    body: JSON.stringify({ image: image ?? null, museId, ordinal, text }),
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  Logger.debug("addMuseAboutSectionAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const newSection: MuseAboutSection = await response.json();

  return newSection;
};

export const getMuseAboutSectionAction = async (
  sectionId: string,
): Promise<DataType<MuseAboutSection>> => {
  const jwt = await getJWTIfExists();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/about/${sectionId}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const response = await fetch(URL, {
    cache: "no-store",
    headers,
  });

  Logger.debug("getMuseAboutSectionAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const section: MuseAboutSection = await response.json();

  return section;
};

export const deleteMuseAboutSectionAction = async (
  sectionId: string,
): Promise<WithMessage> => {
  const jwt = await getJWTIfExists();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/about/${sectionId}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  try {
    const response = await fetch(URL, {
      cache: "no-store",
      headers,
      method: "DELETE",
    });

    if (response.status !== 200) {
      Logger.debug(
        "deleteMuseAboutSectionAction error",
        response.status,
        response.statusText,
      );
      return { message: API_MESSAGE.Error };
    }

    Logger.debug("deleteMuseAboutSectionAction", response.status);
  } catch (e) {
    Logger.error("deleteMuseAboutSectionAction exception", e);
    return { message: API_MESSAGE.Error };
  }
  return { message: API_MESSAGE.Success };
};

export const updateMuseAboutSectionAction = async (
  sectionId: string,
  text: string,
  ordinal: number,
  image?: string | null,
): Promise<MuseAboutSection | WithMessage> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/about/${sectionId}`;
  const response = await fetch(URL, {
    body: JSON.stringify({ image: image ?? null, ordinal, text }),
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "PUT",
  });

  Logger.debug("updateMuseAboutSectionAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const updatedSection: MuseAboutSection = await response.json();

  return updatedSection;
};

export const getAllMusesByUsernameAction = async (
  username: string,
): Promise<DataType<Muse[]>> => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/by/${username}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: headers,
  });

  Logger.debug("getAllMusesByUsernameAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const muse: Muse[] = await response.json();

  for (const m of muse) transformMuse(m, "hero");

  return muse;
};

export const searchFandomsAction = async (prefix: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const URL = `${RP_SERVICE_URL}/rp/portfolio/fandom/search?prefix=${prefix}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: headers,
  });

  Logger.debug("searchFandomsAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const fandoms: Fandom[] = await response.json();

  return fandoms;
};

export const searchMentionMusesAction = async (prefix: string) => {
  const jwt = await getJWTIfExists();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/search/musesByFriends?prefix=${prefix}`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: headers,
  });

  Logger.debug("searchMentionMusesAction", response.status);

  if (response.status === 404) {
    return [];
  } else if (!response.ok) {
    return [];
  }

  const fandoms: MentionDataItem[] = await response.json();

  return fandoms;
};

export const getAllMusesAction = async () => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/all`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
  });

  Logger.debug("getAllMusesAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const muse: Muse[] = await response.json();

  for (const m of muse) transformMuse(m, "feed");

  return muse;
};

export const getHeroPageMusesAction = async (): Promise<DataType<Muse[]>> => {
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/random`;

  const response = await fetch(URL, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  Logger.debug("getHeroPageMusesAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  const muse: Muse[] = await response.json();

  for (const m of muse) transformMuse(m, "hero");

  return muse;
};

export const updateMuseAction = async (
  _museId: string | null,
  _muse: CreateUpdateMuse,
) => {
  const jwt = await authenticateAndGetJWT();

  // Strip wsrv.nl proxy URLs back to original S3 URLs before sending to the
  // backend. getMuseAction transforms S3 URLs → wsrv.nl for display, but the
  // backend expects the raw S3 URL to correctly detect changes and manage S3
  // cleanup. Sending wsrv.nl URLs would cause the backend to delete the original
  // S3 file (URL mismatch) and persist a proxy URL in the DB.
  const muse: CreateUpdateMuse = {
    ..._muse,
    image: reverseWsrvUrl(_muse.image),
    wallpaper: _muse.wallpaper
      ? {
          ..._muse.wallpaper,
          src: reverseWsrvUrl(_muse.wallpaper.src),
          crop: _muse.wallpaper.crop
            ? {
                ..._muse.wallpaper.crop,
                src: reverseWsrvUrl(_muse.wallpaper.crop.src),
              }
            : _muse.wallpaper.crop,
        }
      : _muse.wallpaper,
    cardBackground: _muse.cardBackground
      ? {
          ..._muse.cardBackground,
          src: reverseWsrvUrl(_muse.cardBackground.src),
          crop: _muse.cardBackground.crop
            ? {
                ..._muse.cardBackground.crop,
                src: reverseWsrvUrl(_muse.cardBackground.crop.src),
              }
            : _muse.cardBackground.crop,
        }
      : _muse.cardBackground,
  };

  // Choose URL and HTTP method dynamically
  const isUpdate = !!_museId && _museId.trim() !== "";
  const URL = isUpdate
    ? `${RP_SERVICE_URL}/rp/portfolio/muse/${_museId}`
    : `${RP_SERVICE_URL}/rp/portfolio/muse`;
  const method = isUpdate ? "PUT" : "POST";

  Logger.debug("updateMuseAction", { method, muse, URL });

  try {
    const response = await fetch(URL, {
      body: JSON.stringify(muse),
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        [AUTH_HEADER_NAME]: jwt,
      },
      method,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "(unreadable)");
      Logger.debug(
        "updateMuseAction error",
        response.status,
        response.statusText,
        errorBody,
      );
      return { message: API_MESSAGE.Error };
    }

    const result: WithMessage<Muse> = await response.json();
    Logger.debug("updateMuseAction result", result);

    const savedMuse: Muse = Object.assign(
      {},
      {
        ...result,
        message: undefined,
      },
    );

    return savedMuse;
  } catch (e) {
    Logger.error("updateMuseAction exception", e);
    return { message: API_MESSAGE.Error };
  }
};

export const deleteMuseAction = async (museId: string) => {
  const jwt = await getJWTIfExists();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/${museId}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  try {
    const response = await fetch(URL, {
      cache: "no-store",
      headers: headers,
      method: "DELETE",
    });

    if (!response.ok) {
      Logger.debug(
        "deleteMuseAction error",
        response.status,
        response.statusText,
      );
      return { message: API_MESSAGE.Error };
    }

    const result: WithMessage<Muse> = await response.json();
    Logger.debug("deleteMuseAction result", result);
  } catch (e) {
    Logger.error("deleteMuseAction exception", e);
    return { message: API_MESSAGE.Error };
  }
  return { message: API_MESSAGE.Success };
};

export const getMuseMediaAction = async (
  museId: string,
): Promise<DataType<string[]>> => {
  const jwt = await getJWTIfExists();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/${museId}/media`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (jwt) {
    headers[AUTH_HEADER_NAME] = jwt;
  }

  const response = await fetch(URL, {
    cache: "no-store",
    headers,
  });

  Logger.debug("getMuseMediaAction", response.status);

  if (response.status === 404) {
    return null;
  } else if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return response.json();
};

export const addMuseMediaAction = async (
  museId: string,
  urls: string[],
): Promise<WithMessage> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/${museId}/media`;

  const response = await fetch(URL, {
    body: JSON.stringify({ urls }),
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "POST",
  });

  Logger.debug("addMuseMediaAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return { message: API_MESSAGE.Success };
};

export const deleteMuseMediaAction = async (
  museId: string,
  url: string,
): Promise<WithMessage> => {
  const jwt = await authenticateAndGetJWT();
  const endpoint = `${RP_SERVICE_URL}/rp/portfolio/muse/${museId}/media?url=${encodeURIComponent(url)}`;

  const response = await fetch(endpoint, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      [AUTH_HEADER_NAME]: jwt,
    },
    method: "DELETE",
  });

  Logger.debug("deleteMuseMediaAction", response.status);

  if (!response.ok) {
    return { message: API_MESSAGE.Error };
  }

  return { message: API_MESSAGE.Success };
};

export const changeMuseFandomAction = async (
  museId: string,
  fandomId: string,
): Promise<Fandom | { message: string }> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/${museId}/fandom`;
  try {
    const response = await fetch(URL, {
      method: "PUT",
      cache: "no-store",
      headers: { "Content-Type": "application/json", [AUTH_HEADER_NAME]: jwt },
      body: JSON.stringify({ fandomId }),
    });
    if (!response.ok) return { message: API_MESSAGE.Error };
    return response.json();
  } catch (e) {
    Logger.error("changeMuseFandomAction exception", e);
    return { message: API_MESSAGE.Error };
  }
};

export const addMuseNicknameAction = async (
  museId: string,
  nickname: string,
): Promise<string[] | { message: string }> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/${museId}/nickname`;
  try {
    const response = await fetch(URL, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", [AUTH_HEADER_NAME]: jwt },
      body: JSON.stringify({ nickname }),
    });
    if (!response.ok) return { message: API_MESSAGE.Error };
    return response.json();
  } catch (e) {
    Logger.error("addMuseNicknameAction exception", e);
    return { message: API_MESSAGE.Error };
  }
};

export const editMuseNicknameAction = async (
  museId: string,
  oldNickname: string,
  newNickname: string,
): Promise<string[] | { message: string }> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/${museId}/nickname`;
  try {
    const response = await fetch(URL, {
      method: "PUT",
      cache: "no-store",
      headers: { "Content-Type": "application/json", [AUTH_HEADER_NAME]: jwt },
      body: JSON.stringify({ oldNickname, newNickname }),
    });
    if (!response.ok) return { message: API_MESSAGE.Error };
    return response.json();
  } catch (e) {
    Logger.error("editMuseNicknameAction exception", e);
    return { message: API_MESSAGE.Error };
  }
};

export const removeMuseNicknameAction = async (
  museId: string,
  nickname: string,
): Promise<string[] | { message: string }> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/${museId}/nickname?nickname=${encodeURIComponent(nickname)}`;
  try {
    const response = await fetch(URL, {
      method: "DELETE",
      cache: "no-store",
      headers: { "Content-Type": "application/json", [AUTH_HEADER_NAME]: jwt },
    });
    if (!response.ok) return { message: API_MESSAGE.Error };
    return response.json();
  } catch (e) {
    Logger.error("removeMuseNicknameAction exception", e);
    return { message: API_MESSAGE.Error };
  }
};

export const setMusePrivacyAction = async (
  museId: string,
  privacy: PrivacyLevel,
): Promise<PrivacyLevel | { message: string }> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/${museId}/privacy`;
  try {
    const response = await fetch(URL, {
      method: "PUT",
      cache: "no-store",
      headers: { "Content-Type": "application/json", [AUTH_HEADER_NAME]: jwt },
      body: JSON.stringify({ privacy }),
    });
    if (!response.ok) return { message: API_MESSAGE.Error };
    return response.json();
  } catch (e) {
    Logger.error("setMusePrivacyAction exception", e);
    return { message: API_MESSAGE.Error };
  }
};

export const addMuseExtraAttributeAction = async (
  museId: string,
  key: string,
  value: string,
): Promise<Record<string, string> | { message: string }> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/${museId}/extra-attribute`;
  try {
    const response = await fetch(URL, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        [AUTH_HEADER_NAME]: jwt,
      },
      body: JSON.stringify({ key, value }),
    });
    if (!response.ok) return { message: API_MESSAGE.Error };
    return response.json();
  } catch (e) {
    Logger.error("addMuseExtraAttributeAction exception", e);
    return { message: API_MESSAGE.Error };
  }
};

export const removeMuseExtraAttributeAction = async (
  museId: string,
  key: string,
): Promise<Record<string, string> | { message: string }> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/${museId}/extra-attribute/${encodeURIComponent(key)}`;
  try {
    const response = await fetch(URL, {
      method: "DELETE",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        [AUTH_HEADER_NAME]: jwt,
      },
    });
    if (!response.ok) return { message: API_MESSAGE.Error };
    return response.json();
  } catch (e) {
    Logger.error("removeMuseExtraAttributeAction exception", e);
    return { message: API_MESSAGE.Error };
  }
};

export const editMuseExtraAttributeAction = async (
  museId: string,
  oldKey: string,
  key: string,
  value: string,
): Promise<Record<string, string> | { message: string }> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/${museId}/extra-attribute/${encodeURIComponent(oldKey)}`;
  try {
    const response = await fetch(URL, {
      method: "PUT",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        [AUTH_HEADER_NAME]: jwt,
      },
      body: JSON.stringify({ key, value }),
    });
    if (!response.ok) return { message: API_MESSAGE.Error };
    return response.json();
  } catch (e) {
    Logger.error("editMuseExtraAttributeAction exception", e);
    return { message: API_MESSAGE.Error };
  }
};

export const setMuseAvatarAction = async (
  museId: string,
  image: NWImage,
): Promise<NWImage | { message: string }> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/${museId}/avatar`;
  try {
    const response = await fetch(URL, {
      method: "PUT",
      cache: "no-store",
      headers: { "Content-Type": "application/json", [AUTH_HEADER_NAME]: jwt },
      body: JSON.stringify(image),
    });
    if (!response.ok) return { message: API_MESSAGE.Error };
    return response.json();
  } catch (e) {
    Logger.error("setMuseAvatarAction exception", e);
    return { message: API_MESSAGE.Error };
  }
};

export const setMuseCardBackgroundAction = async (
  museId: string,
  image: NWImage,
): Promise<NWImage | { message: string }> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/${museId}/card-background`;
  try {
    const response = await fetch(URL, {
      method: "PUT",
      cache: "no-store",
      headers: { "Content-Type": "application/json", [AUTH_HEADER_NAME]: jwt },
      body: JSON.stringify(image),
    });
    if (!response.ok) return { message: API_MESSAGE.Error };
    return response.json();
  } catch (e) {
    Logger.error("setMuseCardBackgroundAction exception", e);
    return { message: API_MESSAGE.Error };
  }
};

export const removeMuseCardBackgroundAction = async (
  museId: string,
): Promise<boolean | { message: string }> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/${museId}/card-background`;
  try {
    const response = await fetch(URL, {
      method: "DELETE",
      cache: "no-store",
      headers: { "Content-Type": "application/json", [AUTH_HEADER_NAME]: jwt },
    });
    if (!response.ok) return { message: API_MESSAGE.Error };
    return true;
  } catch (e) {
    Logger.error("removeMuseCardBackgroundAction exception", e);
    return { message: API_MESSAGE.Error };
  }
};

export const removeMuseAvatarAction = async (
  museId: string,
): Promise<boolean | { message: string }> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/${museId}/avatar`;
  try {
    const response = await fetch(URL, {
      method: "DELETE",
      cache: "no-store",
      headers: { "Content-Type": "application/json", [AUTH_HEADER_NAME]: jwt },
    });
    if (!response.ok) return { message: API_MESSAGE.Error };
    return true;
  } catch (e) {
    Logger.error("removeMuseAvatarAction exception", e);
    return { message: API_MESSAGE.Error };
  }
};

export const setMuseNoteAction = async (
  museId: string,
  note: string,
): Promise<string | { message: string }> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/${museId}/note`;
  try {
    const response = await fetch(URL, {
      method: "PUT",
      cache: "no-store",
      headers: { "Content-Type": "application/json", [AUTH_HEADER_NAME]: jwt },
      body: JSON.stringify({ note }),
    });
    if (!response.ok) return { message: API_MESSAGE.Error };
    return response.text();
  } catch (e) {
    Logger.error("setMuseNoteAction exception", e);
    return { message: API_MESSAGE.Error };
  }
};

export const removeMuseNoteAction = async (
  museId: string,
): Promise<boolean | { message: string }> => {
  const jwt = await authenticateAndGetJWT();
  const URL = `${RP_SERVICE_URL}/rp/portfolio/muse/${museId}/note`;
  try {
    const response = await fetch(URL, {
      method: "DELETE",
      cache: "no-store",
      headers: { "Content-Type": "application/json", [AUTH_HEADER_NAME]: jwt },
    });
    if (!response.ok) return { message: API_MESSAGE.Error };
    return true;
  } catch (e) {
    Logger.error("removeMuseNoteAction exception", e);
    return { message: API_MESSAGE.Error };
  }
};
