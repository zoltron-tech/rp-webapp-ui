import {
  END_OF_LIST_LABEL,
  END_OF_LIST_VIEW_BOX,
  EndOfListArt,
  MotionProvider,
} from "@nw/animations";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import Svg from "react-native-svg";
import { useScenePalette } from "@/components/scene-art";
import { useScrollIdle } from "@/context/scroll-activity";
import { fontSize, space, useAppTheme } from "@/theme";
import { useIsFocused } from "@react-navigation/native";

/**
 * "You've made it to the end", at the foot of a list that has run out.
 *
 * Web has shown this for as long as it has had paged lists; the phone showed
 * nothing, so a list with no more pages looked exactly like one still fetching
 * — the spinner simply never came back. The drawing now lives in
 * `@nw/animations` and this is the native frame round it: a sized `<Svg>`, the
 * label, and the palette resolved from the theme.
 *
 * ## Only under a list that really ended
 *
 * It is a `ListFooterComponent`, and every caller draws it only when the query
 * has no next page *and* has something in it. An end marker under an empty list
 * is a joke at the reader's expense — the empty state already said there was
 * nothing, and this would add that they had reached the end of it.
 *
 * ## The book holds still while the list moves
 *
 * `MotionProvider` was `enabled` here unconditionally, which broke the rule the
 * native motion kit states about itself: its clocks run `useNativeDriver:
 * false`, because `react-native-svg` props are not native-drivable, *"which is
 * why motion is gated at the call site: nothing in a scrolling list animates"*.
 * This is in a scrolling list, six of them, and under the New Architecture a
 * non-native-driven value reaches the view by re-rendering it — so the scene's
 * fourteen animated groups were re-rendering through React on every frame, on
 * the same JS thread the list renders cells on, for as long as the footer was
 * mounted. With `PAGE_SIZE` at five that is from the first page onwards.
 *
 * So the motion is gated on `useScrollIdle`: the book breathes while the reader
 * is reading and stops while they are moving, which is the half of it anybody
 * can actually see.
 */

/** Web's `96 × 77`, which is the drawing's own 120 × 96 grid at 0.8. */
const WIDTH = 96;
const HEIGHT = 77;

export const EndOfList = ({
  label = END_OF_LIST_LABEL,
  motion,
}: {
  label?: string;
  /** Overrides the scroll gate. Given by a caller that is not in a list. */
  motion?: boolean;
}) => {
  const theme = useAppTheme();
  // The theme as the drawing asks for it — shared with the muse scenes.
  const palette = useScenePalette();
  const idle = useScrollIdle();
  // Not while another screen or tab is in front: the scene is a dozen SVG
  // groups re-rendered through React every frame, for nobody.
  const focused = useIsFocused();

  return (
    <View accessibilityRole="text" style={styles.root}>
      <MotionProvider enabled={motion ?? (idle && focused)}>
        <Svg height={HEIGHT} viewBox={END_OF_LIST_VIEW_BOX} width={WIDTH}>
          <EndOfListArt palette={palette} />
        </Svg>
      </MotionProvider>

      <Text style={[styles.label, { color: theme.textGray }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  label: { fontSize: fontSize.label, fontWeight: "500", textAlign: "center" },
  root: {
    alignItems: "center",
    gap: space.sm,
    paddingBottom: space.sm,
    paddingTop: space.lg,
    width: "100%",
  },
});
