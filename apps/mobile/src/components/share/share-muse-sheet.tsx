import { shareMuseToDiscord } from "@nw/api/endpoints/community";
import { useApi, useSession } from "@nw/features";
import type { Muse } from "@nw/types";
import { wsrvImage } from "@nw/utils/image";
import { Avatar } from "@/components/avatar";
import { PreviewText, ShareSheet } from "@/components/share/share-sheet";
import { env } from "@/lib/env";
import { museName } from "@/lib/muse-appearance";

/**
 * Web's `ShareMuseDialog`, as a tray.
 *
 * The preview names the character in their own accent, as web's `MuseName`
 * does when the muse has one switched on.
 */

/** The payload carries originals; the preview face is 40pt. */
const FACE = { fit: "inside" as const, h: 120, w: 120 };

/** Web's `ROUTES.Muse.View`. */
const museUrl = (museId: string) => `${env.WEB_URL}/rp/muse/${museId}`;

export const ShareMuseSheet = ({
  muse,
  onClose,
  visible,
}: {
  muse: Muse;
  onClose: () => void;
  visible: boolean;
}) => {
  const api = useApi();
  const { novelist } = useSession();

  const url = muse.id ? museUrl(muse.id) : "";
  const name = museName(muse);
  const accent = muse.useAccent && muse.accent ? muse.accent : undefined;

  const share = () =>
    shareMuseToDiscord(api, {
      muse: {
        accent: muse.accent,
        avatarSrc: muse.avatar?.src ?? null,
        cardBackgroundSrc: muse.cardBackground?.src ?? null,
        extraAttributes: muse.extraAttributes,
        fandom: { name: muse.fandom.name },
        firstName: muse.firstName,
        image: muse.image,
        lastName: muse.lastName,
        level: muse.level,
        nicknames: muse.nicknames,
        note: muse.note,
        pennedBy: {
          firstName: muse.pennedBy.firstName,
          id: muse.pennedBy.id,
          image: muse.pennedBy.image,
          lastName: muse.pennedBy.lastName,
          username: muse.pennedBy.username,
        },
        tags: muse.tags.map((tag) => ({ label: tag.label })),
        useAccent: muse.useAccent,
      },
      museUrl: url,
      novelistUsername: novelist?.username ?? "",
    });

  return (
    <ShareSheet
      copyLabel="Copy character link"
      nativeMessage={`${name} — ${url}`}
      nativeTitle={name}
      onClose={onClose}
      preview={
        <>
          <Avatar
            image={muse.avatar}
            name={muse.firstName}
            size={40}
            uri={wsrvImage(muse.avatar?.src ?? muse.image, FACE)}
          />
          <PreviewText color={accent} line={muse.fandom?.name} name={name} />
        </>
      }
      share={share}
      subtitle={`Post ${muse.firstName || "this character"} to the NW Discord community.`}
      successBody={`${muse.firstName} is now live in the NW Community channel.`}
      title="Share character"
      url={url}
      visible={visible}
    />
  );
};
