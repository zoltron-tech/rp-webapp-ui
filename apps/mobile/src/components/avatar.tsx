import { Ionicons } from "@expo/vector-icons";
import type { NWImage } from "@nw/types";
import { hasUsableCrop, wsrvImage } from "@nw/utils";
import { memo, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { CroppedImage } from "@/components/cropped-image";
import { Image } from "@/components/image";
import { Text } from "@/components/text";
import { useIsOnline } from "@/context/socket";
import { fontSize, useAppTheme } from "@/theme";

/**
 * A round avatar, or the person's initial when there is no image.
 *
 * The web app's `AvatarNew` positions the face through the crop an `NWImage`
 * carries — the pan and zoom the person set in the crop dialog. Given the
 * `image`, this does the same through `CroppedImage`, which reproduces web's
 * `background-size`/`background-position` model in layout; without one, or
 * with a crop that is not one of ours (`hasUsableCrop`), it is the plain
 * source, as web's fallback is. The CSS filter chain (`filterValues`) is not
 * applied on either the list or the profile yet.
 *
 * ## Why `expo-image` rather than React Native's `Image`
 *
 * `expo-image` is Glide on Android and SDWebImage on iOS: a decoded-bitmap
 * memory cache above an encoded disk cache, keyed by URL and global to the
 * process. This is the same mechanism Instagram's grid runs on, and it is what
 * "loaded once" actually means — a face that scrolls out and back re-binds to a
 * bitmap that is already decoded, with no network and no visible fade.
 *
 * React Native's `Image` has no such guarantee. Android's Fresco bitmap cache
 * is small and evicts a list's worth of faces quickly; iOS caches the encoded
 * bytes in `NSURLCache` and re-decodes on every mount. Either way a recycled
 * row paid for its pictures again.
 */

/**
 * The presence ring's green.
 *
 * A literal rather than a theme colour, because it is one on web too
 * (`avatar-new/styled.ts`: `0 0 0 2px #22c55e`) and it must read as the same
 * green on both. `theme.success` is a different, duller green used for form
 * validation — a person switching between the two clients would notice.
 */
const ONLINE_GREEN = "#22c55e";
const RING_WIDTH = 2;

/**
 * Memoised: every prop is a primitive, and a face appears four times on some
 * list rows — a parent re-render should not redraw any of them.
 */
export const Avatar = memo(function Avatar({
  image,
  name,
  placeholder = false,
  playing,
  size = 40,
  uri,
  username,
}: {
  /**
   * A disabled author's stand-in (ACCOUNT_DISABLE_PLAN.md §7.3): a neutral
   * silhouette instead of the initial — which for "A Quiet Novelist" would be
   * a misleading "A" — and no picture or presence ring, whatever is passed.
   */
  placeholder?: boolean;
  /** The stored picture with its crop, when the caller has one. */
  image?: NWImage | null;
  name?: string | null;
  /** Whether an animated face runs — see `Image`. Undefined: always. */
  playing?: boolean;
  size?: number;
  uri?: string | null;
  /**
   * When given, the avatar shows the green presence ring while this person is
   * connected to the chat socket.
   *
   * Passing a username is not enough on its own — the server only answers about
   * usernames the client has asked about, so the screen must also register them
   * with `useTrackOnline`. Without that registration everyone renders offline.
   */
  username?: string | null;
}) {
  const theme = useAppTheme();
  const isOnline = useIsOnline(placeholder ? null : username);

  const dimensions = { borderRadius: size / 2, height: size, width: size };

  if (placeholder) {
    return (
      <View
        accessibilityLabel={name ?? undefined}
        accessibilityRole="image"
        style={[
          dimensions,
          styles.fallback,
          { backgroundColor: theme.material.fillPressed },
        ]}
      >
        <Ionicons color={theme.textGray} name="person" size={size * 0.55} />
      </View>
    );
  }

  /*
   * Bounded to three times the drawn size, aspect kept. Feed and thread
   * sources carry the *original* under `avatar.src` — `@nw/api` sizes only
   * `image` — so a 40pt face in a card was a multi-megapixel decode. A URL
   * the API already proxied is left alone (it is not an S3 URL any more),
   * and `inside` never crops, so the stored pan and zoom still apply.
   */
  const src = useMemo(
    () => wsrvImage(uri, { fit: "inside", h: size * 3, w: size * 3 }),
    [size, uri],
  );

  const inner = src ? (
    hasUsableCrop(image?.crop) ? (
      <CroppedImage
        crop={image?.crop}
        playing={playing}
        style={[dimensions, { backgroundColor: theme.material.fillPressed }]}
        uri={src}
      />
    ) : (
      <Image
        cachePolicy="memory-disk"
        contentFit="cover"
        playing={playing}
        source={{ uri: src }}
        style={[dimensions, { backgroundColor: theme.material.fillPressed }]}
        // Keyed by the URL so a recycled view never shows the previous person's
        // face for a frame while the new one resolves.
        recyclingKey={src}
        // Nothing cross-fades in a list that is already scrolling.
        transition={0}
      />
    )
  ) : (
    <View
      style={[
        dimensions,
        styles.fallback,
        { backgroundColor: theme.primaryAlpha },
      ]}
    >
      <Text style={[styles.initial, { color: theme.text }]}>
        {(name?.trim()[0] ?? "?").toUpperCase()}
      </Text>
    </View>
  );

  if (!isOnline) return inner;

  // The ring is drawn outside the image rather than as a border on it, so an
  // online avatar is not a smaller avatar — a list where the connected faces
  // are 4dp narrower than everyone else looks broken rather than informative.
  return (
    <View
      style={[
        styles.ring,
        {
          borderColor: ONLINE_GREEN,
          borderRadius: (size + RING_WIDTH * 2) / 2,
          borderWidth: RING_WIDTH,
        },
      ]}
    >
      {inner}
    </View>
  );
});

const styles = StyleSheet.create({
  fallback: { alignItems: "center", justifyContent: "center" },
  initial: { fontSize: fontSize.body, fontWeight: "700" },
  ring: { alignItems: "center", justifyContent: "center" },
});
