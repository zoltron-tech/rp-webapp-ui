import { setMuseAvatar, updateMuse } from "@nw/api/endpoints/muse";
import { queryKeys, useApi, useSession } from "@nw/features";
import type { CreateUpdateMuse, Fandom, Muse, NWImage } from "@nw/types";
import type { PrivacyLevel } from "@nw/types/prompt";
import { toCropFilter } from "@nw/utils";
import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import type { CropState } from "@/hooks/use-muse-edit";

/**
 * The character form's own writes — web's `useMuseSave` — for everything that
 * has no endpoint of its own: the name, the wallpaper and its filters, the
 * profile colour and "use accent", "extra images", and the advanced colour
 * overrides. (What does have one — avatar, card image, nicknames, details,
 * fandom, privacy, quote, song — stays with `useMuseEdit`.)
 *
 * ## One field at a time, the whole muse every time
 *
 * `PUT /muse/:id` takes the whole character, as web's form sends it. A phone
 * saves each control as it is confirmed (the way the profile editor does), so
 * every save builds the payload from the cached muse with the change laid over
 * it. The change goes into the cache first — the preview answers on the next
 * frame — and back out if the write fails.
 *
 * Saves queue per character: two toggles in quick succession must not race
 * each other to the server with a payload that forgot the other.
 *
 * ## What the payload keeps
 *
 * Web's form sends `null` for the song, video and tags (and drops the accent
 * when "use accent" is off). This sends what the muse already has instead, so
 * a save from a phone never clears something the phone does not show, and
 * switching the profile colour off keeps the colour for when it comes back.
 * The advanced colours go as `""` when unset — `null` would read as "not
 * sending this" and leave a cleared override in place (`Muse.nameColor`).
 */

/** The fields a form save may change. */
export type MuseFormChanges = Partial<
  Pick<
    Muse,
    | "accent"
    | "cardBackground"
    | "extraAttributes"
    | "firstName"
    | "hideExpandedBackground"
    | "hideSideMenuBackground"
    | "lastName"
    | "nameColor"
    | "pennedByColor"
    | "sideMenuBgColor"
    | "sideMenuTextColor"
    | "useAccent"
    | "useExtraImages"
    | "wallpaper"
  >
>;

const failed = (result: unknown) =>
  !result || (typeof result === "object" && "message" in result);

/** Web's `FANDOMLESS` constant, which a new character starts in. */
export const FANDOMLESS: Fandom = {
  color: "rgb(51, 102, 153)",
  description: "rgb(51, 102, 153)",
  id: "FANDOMLESS",
  name: "Fandomless Original Characters",
} as Fandom;

const payloadOf = (muse: Muse): CreateUpdateMuse => ({
  accent: muse.accent?.trim() || null,
  cardBackground: muse.cardBackground ?? null,
  connections: [],
  extraAttributes: muse.extraAttributes ?? null,
  // The service reads the fandom by id, as web's hidden form input sent it.
  fandom: (muse.fandom?.id ?? "FANDOMLESS") as unknown as Fandom,
  firstName: muse.firstName?.trim() ?? "",
  hideExpandedBackground: muse.hideExpandedBackground ?? false,
  hideSideMenuBackground: muse.hideSideMenuBackground ?? false,
  image: muse.image ?? "",
  lastName: muse.lastName?.trim() ?? "",
  nameColor: muse.nameColor?.trim() ?? "",
  nicknames: muse.nicknames ?? [],
  note: muse.note ?? "",
  originalVerseId: muse.originalVerseId ?? null,
  pennedByColor: muse.pennedByColor?.trim() ?? "",
  privacy: muse.privacy ?? "PUBLIC",
  sideMenuBgColor: muse.sideMenuBgColor?.trim() ?? "",
  sideMenuTextColor: muse.sideMenuTextColor?.trim() ?? "",
  song: muse.song ?? null,
  story: muse.story ?? null,
  /*
   * Never the muse's own tags. The service reads a tag as its *entity*
   * (`createdAt` and all), while it hands tags out as `{ label, color }`, so
   * a muse with any tag at all sent back as read is "Request data is
   * invalid" — every appearance switch said "Not saved" on a tagged character
   * and worked on an untagged one. The update never stores what is sent
   * here anyway (tags have their own endpoints; this field is only echoed in
   * the response), and web's edit forms send `null` for the same reason.
   */
  tags: null,
  useAccent: muse.useAccent ?? false,
  useExtraImages: muse.useExtraImages ?? false,
  video: muse.video ?? null,
  wallpaper: muse.wallpaper ?? null,
});

/** The tail of each character's save queue. */
const queues = new Map<string, Promise<unknown>>();

/** Everything that shows a character's face or name, refreshed in the background. */
const refreshLists = (queryClient: QueryClient, username?: string) => {
  if (username) {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.novelistMuses(username),
    });
    void queryClient.invalidateQueries({
      queryKey: queryKeys.profile(username),
    });
  }
  void queryClient.invalidateQueries({ queryKey: queryKeys.session() });
};

export const useMuseForm = (museId: string | null | undefined) => {
  const api = useApi();
  const queryClient = useQueryClient();
  const session = useSession();
  const username = session.novelist?.username;
  const id = museId ?? "";
  const [pending, setPending] = useState(0);

  const save = useCallback(
    (changes: MuseFormChanges): Promise<boolean> => {
      if (!id) return Promise.resolve(false);
      const key = queryKeys.muse(id);
      const before = queryClient.getQueryData<Muse | null>(key);
      if (!before) return Promise.resolve(false);

      // The preview answers now; the write follows in turn.
      const previous: MuseFormChanges = {};
      for (const field of Object.keys(changes) as (keyof MuseFormChanges)[]) {
        (previous as Record<string, unknown>)[field] = before[field];
      }
      queryClient.setQueryData<Muse | null>(key, (muse) =>
        muse ? { ...muse, ...changes } : muse,
      );
      setPending((count) => count + 1);

      const run = async () => {
        const muse = queryClient.getQueryData<Muse | null>(key);
        if (!muse) return false;
        const result = await updateMuse(api, id, payloadOf(muse));
        if (failed(result)) {
          // Undo only what this save changed, and only if nothing since has.
          queryClient.setQueryData<Muse | null>(key, (current) => {
            if (!current) return current;
            const restored = { ...current };
            for (const field of Object.keys(
              changes,
            ) as (keyof MuseFormChanges)[]) {
              if (current[field] === changes[field]) {
                (restored as Record<string, unknown>)[field] = previous[field];
              }
            }
            return restored;
          });
          return false;
        }
        // Take the service's word for what it stored (a trimmed name, say).
        const saved = result as Muse;
        queryClient.setQueryData<Muse | null>(key, (current) => {
          if (!current) return current;
          const next = { ...current };
          for (const field of Object.keys(
            changes,
          ) as (keyof MuseFormChanges)[]) {
            if (
              saved[field] !== undefined &&
              current[field] === changes[field]
            ) {
              (next as Record<string, unknown>)[field] = saved[field];
            }
          }
          return next;
        });
        refreshLists(queryClient, username);
        return true;
      };

      const tail = queues.get(id) ?? Promise.resolve();
      const task = tail.then(run, run);
      queues.set(
        id,
        task.catch(() => false),
      );
      return task
        .catch(() => false)
        .finally(() => setPending((count) => count - 1));
    },
    [api, id, queryClient, username],
  );

  return useMemo(() => ({ save, saving: pending > 0 }), [pending, save]);
};

export type MuseForm = ReturnType<typeof useMuseForm>;

/** What the first step of "Add a new character" collects. */
export interface NewMuse {
  avatar: { crop: CropState; src: string } | null;
  fandom: Fandom;
  firstName: string;
  lastName: string;
  /** Set to make the new character a verse of that one. */
  originalVerseId: string | null;
  privacy: PrivacyLevel;
}

/**
 * Web's `CreateInitialSection` save: the character, then its avatar once there
 * is an id to hang it on. A failed avatar is not a failed character — the
 * appearance page can add it again — so only the first write decides.
 */
export const useCreateMuse = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  const session = useSession();

  return useCallback(
    async (draft: NewMuse): Promise<string | null> => {
      const payload: CreateUpdateMuse = {
        accent: null,
        cardBackground: null,
        connections: [],
        extraAttributes: null,
        fandom: draft.fandom.id as unknown as Fandom,
        firstName: draft.firstName.trim(),
        hideExpandedBackground: false,
        hideSideMenuBackground: false,
        image: draft.avatar?.src ?? "",
        lastName: draft.lastName.trim(),
        nameColor: "",
        nicknames: [],
        note: "",
        originalVerseId: draft.originalVerseId,
        pennedByColor: "",
        privacy: draft.privacy,
        sideMenuBgColor: "",
        sideMenuTextColor: "",
        song: null,
        story: null,
        tags: null,
        useAccent: false,
        useExtraImages: false,
        video: null,
        wallpaper: null,
      };
      const result = await updateMuse(api, null, payload);
      if (failed(result)) return null;
      const created = result as Muse;
      const id = created.id;
      if (!id) return null;

      let muse = created;
      if (draft.avatar) {
        const image: NWImage = {
          crop: toCropFilter(
            draft.avatar.src,
            draft.avatar.crop.x,
            draft.avatar.crop.y,
            draft.avatar.crop.scale,
          ),
          filterValues: { blur: 0, brightness: 100, greyscale: 0 },
          src: draft.avatar.src,
        };
        const avatar = await setMuseAvatar(api, id, image);
        if (!failed(avatar)) muse = { ...muse, avatar: avatar as NWImage };
      }

      queryClient.setQueryData<Muse | null>(queryKeys.muse(id), muse);
      refreshLists(queryClient, session.novelist?.username);
      return id;
    },
    [api, queryClient, session.novelist?.username],
  );
};
