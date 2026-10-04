import type { Muse } from "@nw/types";
import { wsrvImage } from "@nw/utils";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import { Avatar } from "@/components/avatar";
import { PANEL, Shimmer } from "@/components/muse/panel";
import { PennedBy } from "@/components/muse/penned-by";
import type { MuseLook } from "@/lib/muse-appearance";
import { museName } from "@/lib/muse-appearance";
import { fontSize, space } from "@/theme";

/** Web's `InfoCardAvatar` at its ≤600px size. */
export const MUSE_AVATAR = 72;

/**
 * The face, bounded to three times its drawn size with the aspect kept, so the
 * stored pan and zoom still describe the picture they were set on.
 */
export const museAvatarUri = (muse: Muse, size: number) =>
  wsrvImage(muse.avatar?.src ?? muse.image, {
    fit: "inside",
    h: size * 3,
    w: size * 3,
  });

/**
 * A muse's face with web's ring: 3px of white at 20%, over a soft shadow.
 *
 * The avatar's own crop is honoured by `Avatar` → `CroppedImage`; the `image`
 * fallback is drawn uncropped, as web draws it.
 */
export const MuseFace = ({ muse, size }: { muse: Muse; size: number }) => (
  <View
    style={[
      styles.ring,
      { borderRadius: (size + 6) / 2, height: size + 6, width: size + 6 },
    ]}
  >
    <Avatar
      image={muse.avatar?.src ? muse.avatar : null}
      name={muse.firstName}
      size={size}
      uri={museAvatarUri(muse, size)}
    />
  </View>
);

/**
 * Web's `SectionMiniHeader`: the face beside the name and the author, at the
 * top of every section but INFO — which lays the same things out in a column.
 */
export const MiniHeader = ({
  look,
  muse,
}: {
  look: MuseLook;
  muse: Muse | null;
}) => {
  if (!muse) {
    return (
      <View style={styles.row}>
        <Shimmer height={56} radius={28} width={56} />
        <View style={styles.text}>
          <Shimmer height={14} width={120} />
          <Shimmer height={10} width={80} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <MuseFace muse={muse} size={56} />
      <View style={styles.text}>
        <Text
          numberOfLines={1}
          style={[styles.name, { color: look.nameColor ?? PANEL.primary }]}
        >
          {museName(muse)}
        </Text>
        <PennedBy
          accent={look.accent}
          novelist={muse.pennedBy}
          textColor={look.pennedByColor}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  name: { fontSize: fontSize.body + 1, fontWeight: "600" },
  ring: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: 3,
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.ms,
    paddingHorizontal: space.xs,
    paddingVertical: space.sm,
    width: "100%",
  },
  text: { alignItems: "flex-start", flex: 1, gap: 5 },
});
