import { Stack } from "expo-router";
import { useAppTheme } from "@/theme";
import { glassHeaderOptions } from "@/theme/header";
import { ambientScreenLayout } from "@/components/ambient-background";

/**
 * A storyboard, read: web's `/rp/story/:id` and the workspace views hanging
 * off it, and `/rp/story/event/:id`, the chapter reader.
 *
 * The workspace's Codex, Timeline and Map are client-side tabs on web. Here
 * each is its own screen: the map pans and pinches and the timeline scrolls
 * sideways, and neither gesture should have to share a page with the other
 * or with the story's own scroll.
 *
 * Outside the tabs, like the library that opens it. Reading only — nothing in
 * this stack writes.
 */
export default function StoryLayout() {
  const theme = useAppTheme();

  return (
    <Stack
      screenLayout={ambientScreenLayout}
      screenOptions={{
        contentStyle: { backgroundColor: theme.background },
        ...glassHeaderOptions(theme),
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen name="[storyId]/index" options={{ title: "Story" }} />
      <Stack.Screen name="[storyId]/codex" options={{ title: "Codex" }} />
      <Stack.Screen name="[storyId]/timeline" options={{ title: "Timelines" }} />
      <Stack.Screen name="[storyId]/map" options={{ title: "Map" }} />
      <Stack.Screen name="chapter/[eventId]" options={{ title: "Chapter" }} />
    </Stack>
  );
}
