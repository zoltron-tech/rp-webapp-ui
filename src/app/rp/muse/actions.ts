import {
  addMuseAboutSection,
  addMuseExtraAttribute,
  addMuseMedia,
  addMuseNickname,
  changeMuseFandom,
  deleteMuse,
  deleteMuseAboutSection,
  deleteMuseMedia,
  deleteMuseSong,
  editMediaDescription,
  editMuseExtraAttribute,
  editMuseNickname,
  getAllMuses,
  getAllMusesByUsername,
  getHeroPageMuses,
  getMuse,
  getMuseAboutSection,
  getMuseAboutSections,
  getMuseMedia,
  getMuseMediaMetadata,
  removeMuseAvatar,
  removeMuseCardBackground,
  removeMuseExtraAttribute,
  removeMuseNickname,
  removeMuseNote,
  searchFandoms,
  searchMentionMuses,
  setMuseAvatar,
  setMuseCardBackground,
  setMuseNote,
  setMusePrivacy,
  setMuseSong,
  updateMuse,
  updateMuseAboutSection,
} from "@nw/api/endpoints/muse";
import type { CreateUpdateMuse } from "@nw/types";
import type { ProfileSong } from "@nw/types/music";
import type { NWImage } from "@nw/types/novelist";
import type { PrivacyLevel } from "@nw/types/prompt";
import { api, authedApi } from "@/lib/api";

export const getMuseAction = (museId: string) => getMuse(api, museId);

export const getMuseAboutSectionsAction = (museId: string) =>
  getMuseAboutSections(api, museId);

export const addMuseAboutSectionAction = (
  museId: string,
  text: string,
  ordinal: number,
  image?: string | null,
) => addMuseAboutSection(authedApi, museId, text, ordinal, image);

export const getMuseAboutSectionAction = (sectionId: string) =>
  getMuseAboutSection(api, sectionId);

export const deleteMuseAboutSectionAction = (sectionId: string) =>
  deleteMuseAboutSection(api, sectionId);

export const updateMuseAboutSectionAction = (
  sectionId: string,
  text: string,
  ordinal: number,
  image?: string | null,
) => updateMuseAboutSection(authedApi, sectionId, text, ordinal, image);

export const getAllMusesByUsernameAction = (username: string) =>
  getAllMusesByUsername(api, username);

export const searchFandomsAction = (prefix: string) =>
  searchFandoms(api, prefix);

export const searchMentionMusesAction = (prefix: string) =>
  searchMentionMuses(api, prefix);

export const getAllMusesAction = () => getAllMuses(authedApi);

export const getHeroPageMusesAction = () => getHeroPageMuses(api);

export const updateMuseAction = (
  _museId: string | null,
  _muse: CreateUpdateMuse,
) => updateMuse(authedApi, _museId, _muse);

export const deleteMuseAction = (museId: string) => deleteMuse(api, museId);

export const getMuseMediaAction = (museId: string) => getMuseMedia(api, museId);

export const addMuseMediaAction = (museId: string, urls: string[]) =>
  addMuseMedia(authedApi, museId, urls);

export const deleteMuseMediaAction = (museId: string, url: string) =>
  deleteMuseMedia(authedApi, museId, url);

export const getMuseMediaMetadataAction = (museId: string) =>
  getMuseMediaMetadata(api, museId);

export const editMediaDescriptionAction = (
  museId: string,
  mediaUrl: string,
  description: string,
) => editMediaDescription(authedApi, museId, mediaUrl, description);

export const changeMuseFandomAction = (museId: string, fandomId: string) =>
  changeMuseFandom(authedApi, museId, fandomId);

export const addMuseNicknameAction = (museId: string, nickname: string) =>
  addMuseNickname(authedApi, museId, nickname);

export const editMuseNicknameAction = (
  museId: string,
  oldNickname: string,
  newNickname: string,
) => editMuseNickname(authedApi, museId, oldNickname, newNickname);

export const removeMuseNicknameAction = (museId: string, nickname: string) =>
  removeMuseNickname(authedApi, museId, nickname);

export const setMusePrivacyAction = (museId: string, privacy: PrivacyLevel) =>
  setMusePrivacy(authedApi, museId, privacy);

export const addMuseExtraAttributeAction = (
  museId: string,
  key: string,
  value: string,
) => addMuseExtraAttribute(authedApi, museId, key, value);

export const removeMuseExtraAttributeAction = (museId: string, key: string) =>
  removeMuseExtraAttribute(authedApi, museId, key);

export const editMuseExtraAttributeAction = (
  museId: string,
  oldKey: string,
  key: string,
  value: string,
) => editMuseExtraAttribute(authedApi, museId, oldKey, key, value);

export const setMuseSongAction = (
  museId: string,
  payload: Partial<ProfileSong> & {
    source: ProfileSong["source"];
    title: string;
  },
) => setMuseSong(authedApi, museId, payload);

/** Clears the muse's featured song. Owner only. */
export const deleteMuseSongAction = (museId: string) =>
  deleteMuseSong(authedApi, museId);

export const setMuseAvatarAction = (museId: string, image: NWImage) =>
  setMuseAvatar(authedApi, museId, image);

export const setMuseCardBackgroundAction = (museId: string, image: NWImage) =>
  setMuseCardBackground(authedApi, museId, image);

export const removeMuseCardBackgroundAction = (museId: string) =>
  removeMuseCardBackground(authedApi, museId);

export const removeMuseAvatarAction = (museId: string) =>
  removeMuseAvatar(authedApi, museId);

export const setMuseNoteAction = (museId: string, note: string) =>
  setMuseNote(authedApi, museId, note);

export const removeMuseNoteAction = (museId: string) =>
  removeMuseNote(authedApi, museId);
