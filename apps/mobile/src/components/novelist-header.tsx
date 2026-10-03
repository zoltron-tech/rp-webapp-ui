import { Stack } from "expo-router";
import { useAppTheme } from "@/theme";
import { glassHeaderOptions } from "@/theme/header";

/**
 * The stack header, painted in whatever accent surrounds it.
 *
 * ## Why this is a component rather than an options object
 *
 * `Stack.Screen options` is evaluated where it is written, so a header declared
 * beside an `AccentProvider` reads the theme *outside* it — the viewer's. That
 * is how a novelist's screen ended up with their colour under a bar in
 * somebody else's: the content was inside the override and the header was not.
 *
 * Rendering the declaration from inside the provider is the whole fix. It is a
 * component so it has somewhere to call `useAppTheme` from, and it must be
 * mounted *within* the `AccentProvider` it is meant to follow.
 *
 * It carries no children and draws nothing itself — `Stack.Screen` is a
 * configuration element — so it can sit anywhere inside that subtree.
 *
 * In dark mode this matters more than it sounds. The accent decides which
 * neutral scale the whole theme is built from (jade is olive, crimson is mauve,
 * iris is slate), so a mismatched header is not a slightly different tint: it is
 * a different family of greys from the page under it.
 */
export const NovelistHeader = ({ title }: { title: string }) => {
  const theme = useAppTheme();

  return (
    <Stack.Screen
      options={{
        headerShown: true,
        ...glassHeaderOptions(theme),
        title,
      }}
    />
  );
};
