import { shareProfileToDiscord } from "@nw/api/endpoints/community";
import { useApi, useSession } from "@nw/features";
import type { Novelist } from "@nw/types";
import { mainVerseMuses } from "@nw/utils";
import { wsrvImage } from "@nw/utils/image";
import { Avatar } from "@/components/avatar";
import { PreviewText, ShareSheet } from "@/components/share/share-sheet";
import { env } from "@/lib/env";
import { fullName } from "@/lib/names";

/**
 * Web's `ShareProfileDialog`, as a tray.
 *
 * The link is the short handle form — `novelist.world/@username`, web's
 * `ROUTES.Profile.Share` — because this link is going somewhere a person
 * will read it, not into a router.
 */

/** How many muses get spotlighted in the Discord embed. */
const FEATURED_MUSE_LIMIT = 3;

/** The payload carries originals; the preview face is 40pt. */
const FACE = { fit: "inside" as const, h: 120, w: 120 };

/** Web's `ROUTES.Profile.Share`. */
const profileUrl = (username: string) => `${env.WEB_URL}/@${username}`;

export const ShareProfileSheet = ({
  novelist,
  onClose,
  visible,
}: {
  novelist: Novelist;
  onClose: () => void;
  visible: boolean;
}) => {
  const api = useApi();
  const session = useSession();

  const url = profileUrl(novelist.username);
  const name = fullName(novelist);
  const isOwnProfile = session.novelist?.username === novelist.username;

  const share = () =>
    shareProfileToDiscord(api, {
      novelistUsername: session.novelist?.username ?? "",
      profile: {
        about: novelist.about,
        avatarSrc: novelist.avatar?.src ?? null,
        bannerSrc: novelist.banner?.src ?? null,
        createdAt: novelist.createdAt ?? null,
        firstName: novelist.firstName,
        friendsCount: novelist.friendsCount,
        id: novelist.id,
        image: novelist.image,
        isVerified: novelist.isVerified,
        lastName: novelist.lastName,
        museCount: novelist.museCount,
        muses: mainVerseMuses(novelist.muses)
          .filter((muse) => Boolean(muse.id))
          .slice(0, FEATURED_MUSE_LIMIT)
          .map((muse) => ({ id: muse.id, name: fullName(muse) })),
        note: novelist.note?.text ?? null,
        palette: typeof novelist.palette === "number" ? novelist.palette : null,
        username: novelist.username,
      },
      profileUrl: url,
    });

  return (
    <ShareSheet
      copyLabel="Copy profile link"
      nativeTitle={name}
      onClose={onClose}
      preview={
        <>
          <Avatar
            image={novelist.avatar}
            name={novelist.firstName}
            size={40}
            uri={wsrvImage(novelist.avatar?.src ?? novelist.image, FACE)}
          />
          <PreviewText line={`@${novelist.username}`} name={name} />
        </>
      }
      share={share}
      subtitle={
        isOwnProfile
          ? "Post your profile to the NW Discord community."
          : `Post ${novelist.firstName || "this novelist"} to the NW Discord community.`
      }
      successBody={`${isOwnProfile ? "Your profile" : `@${novelist.username}`} is now live in the NW Community channel.`}
      title="Share profile"
      url={url}
      visible={visible}
    />
  );
};
