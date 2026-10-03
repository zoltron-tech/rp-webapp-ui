import type { ReactNode } from "react";
import { useState } from "react";
import { type LayoutChangeEvent, StyleSheet, View } from "react-native";
import { NAV_TAB_WIDTH } from "@/components/muse/nav-tabs";
import { space } from "@/theme";

/**
 * The 9:16 frame every section is drawn in — web's `CardExpandedWrapper`.
 *
 * On web the card and each section share one portrait frame: the same
 * `aspect-ratio: 9 / 16`, the same corner radius, one shape swapping its
 * contents as the menu is tapped. This is that frame, sized once from the
 * space between the two edge tabs and the height left under the song bar:
 *
 *  - as wide as fits with a tab and a gutter clear on each side — web's
 *    `min(240px, calc(100vw - 120px))`, computed rather than tabled;
 *  - never taller than the stage — the height wins on a short phone;
 *  - then a hair under that (`SCALE`), so the frame reads as a card sitting on
 *    the wallpaper rather than a panel touching everything round it.
 *
 * The edge tabs are laid over the stage by the screen, centred on the same
 * mid-line the frame is centred on.
 */

/** Slightly under the largest fit — web's frame never touches its neighbours. */
const SCALE = 0.94;

export const MuseStage = ({
  children,
  tabs,
}: {
  children: (frame: { height: number; width: number }) => ReactNode;
  /** The edge tabs, laid over the stage at its mid-height. */
  tabs?: ReactNode;
}) => {
  const [box, setBox] = useState<{ height: number; width: number } | null>(
    null,
  );

  const onLayout = (event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;
    if (!box || box.width !== width || box.height !== height) {
      setBox({ height, width });
    }
  };

  const frame = box
    ? (() => {
        const clearance = (NAV_TAB_WIDTH + space.sm) * 2;
        const width =
          Math.min(box.width - clearance, (box.height * 9) / 16) * SCALE;
        return { height: (width * 16) / 9, width };
      })()
    : null;

  return (
    <View onLayout={onLayout} style={styles.stage}>
      {frame && frame.width > 0 ? (
        <View style={[styles.frame, frame]}>{children(frame)}</View>
      ) : null}
      {tabs}
    </View>
  );
};

const styles = StyleSheet.create({
  /*
   * No shadow and no border, as web's `CardExpandedWrapper` has neither on a
   * phone. A shadow on a view whose background is a gradient fading from
   * near-transparent draws, on device, as a dark accent-tinted outline round
   * the frame rather than as depth under it.
   */
  frame: {
    borderRadius: 8,
    overflow: "hidden",
  },
  stage: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingVertical: space.sm,
    position: "relative",
    width: "100%",
  },
});
