import { getProfileSong } from "@nw/api/endpoints/profile-song";
import { useApi } from "@nw/features";
import type { ProfileSong } from "@nw/types/music";
import { useQuery } from "@tanstack/react-query";

/**
 * The song pinned to a profile.
 *
 * It is its own endpoint rather than a field on the novelist, so it is its own
 * request — web does the same (`getProfileSongAction` in an effect after the
 * profile resolves). Kept in the app rather than `@nw/features` for that
 * package's stated rule: a hook there needs a consumer on both clients, and web
 * reaches this through a server action.
 *
 * A profile's song is public and the endpoint is deliberately unauthenticated,
 * so this is safe on a signed-out screen.
 */
export const useProfileSong = (novelistId: string | undefined) => {
  const api = useApi();

  const query = useQuery({
    enabled: Boolean(novelistId),
    queryFn: async (): Promise<ProfileSong | null> =>
      novelistId ? await getProfileSong(api, novelistId) : null,
    queryKey: ["profile-song", novelistId ?? ""],
    // Nobody changes the song they are featuring while someone is reading their
    // profile, and the profile itself is cached far longer than this.
    staleTime: 5 * 60_000,
  });

  return query.data ?? null;
};
