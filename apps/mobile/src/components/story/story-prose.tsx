import type { StoryBoardEventThread } from "@nw/types";
import { memo, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { RichText } from "@/components/rich-text";
import { DialogLine } from "@/components/story/dialog-line";
import {
  type DialogDesign,
  resolveDialogDesign,
  splitDialogs,
} from "@/lib/story";

/**
 * A passage of a story: rich text with its characters' lines woven in.
 *
 * Web inflates each `.dialog-embed` in place with the design its author fixed
 * when writing the passage. Here the passage is cut at its embeds (see
 * `splitDialogs`), the prose between them goes through the ordinary renderer,
 * and each embed becomes a `DialogLine` in that same design.
 */
export const StoryProse = memo(function StoryProse({
  design,
  html,
  speakers,
}: {
  design?: string | null;
  html: string | null | undefined;
  speakers?: StoryBoardEventThread["museDialogAttrs"];
}) {
  const segments = useMemo(() => splitDialogs(html), [html]);
  const resolved: DialogDesign = resolveDialogDesign(design);

  if (segments.length === 0) return null;
  // Nearly every codex entry and chapter overture has no dialog at all.
  if (segments.length === 1 && segments[0].kind === "html") {
    return <RichText html={segments[0].html} />;
  }

  return (
    <View style={styles.root}>
      {segments.map((segment, index) =>
        segment.kind === "html" ? (
          <RichText html={segment.html} key={index} />
        ) : (
          <DialogLine
            design={resolved}
            dialog={segment.dialog}
            key={index}
            speaker={
              segment.dialog.speakerId
                ? speakers?.[segment.dialog.speakerId]
                : undefined
            }
          />
        ),
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  root: { width: "100%" },
});
