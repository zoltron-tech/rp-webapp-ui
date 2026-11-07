import { Stack } from "expo-router";
import { useAppTheme } from "@/theme";
import { glassHeaderOptions } from "@/theme/header";
import { ambientScreenLayout } from "@/components/ambient-background";
import { nestedStackBack } from "@/components/stack-back-button";

/**
 * A storyboard, read: web's `/rp/story/:id` and the workspace views hanging
 * off it, and `/rp/story/event/:id`, the chapter reader.
 *
 * The workspace's Codex, Timeline and Map are client-side tabs on web. Here
 * each is its own screen: the map pans and pinches and the timeline scrolls
 * sideways, and neither gesture should have to share a page with the other
 * or with the story's own scroll.
 *
 * Outside the tabs, like the library that opens it. Reading — and, for a
 * co-author, the chapter screen's passage composer.
 */
export default function StoryLayout() {
  const theme = useAppTheme();

  return (
    <Stack
      screenLayout={ambientScreenLayout}
      screenOptions={(screen) => ({
        contentStyle: { backgroundColor: theme.background },
        ...glassHeaderOptions(theme),
        ...nestedStackBack(screen),
      })}
    >
      <Stack.Screen name="[storyId]/index" options={{ title: "Story" }} />
      <Stack.Screen name="[storyId]/codex" options={{ title: "Codex" }} />
      <Stack.Screen
        name="[storyId]/relationships"
        options={{ title: "Relationships" }}
      />
      <Stack.Screen name="[storyId]/timeline" options={{ title: "Timelines" }} />
      <Stack.Screen name="[storyId]/map" options={{ title: "Map" }} />
      <Stack.Screen name="[storyId]/notes" options={{ title: "Notes" }} />
      <Stack.Screen name="chapter/[eventId]" options={{ title: "Chapter" }} />
    </Stack>
  );
}
