import { Stack } from "expo-router";
import { RegisterDraftProvider } from "@/context/register-draft";
import { useAppTheme } from "@/theme";
import { ambientScreenLayout } from "@/components/ambient-background";

/**
 * Registration, as three short screens rather than one long form.
 *
 * ## Why it was split
 *
 * The single form had four fields, the live password rules, a consent row, two
 * provider buttons and the terms. That does not fit an iPhone SE and cannot be
 * made to without deleting something from it — the old screen's own comment
 * said as much and kept a `ScrollView` to cope. Coping is not the same as
 * fixing: a sign-up form you scroll is a sign-up form where the button you are
 * looking for is off screen, and the field you just filled scrolls away as the
 * keyboard opens.
 *
 * Three steps of one idea each fit with room over, at any text size, and each
 * has exactly one thing to get right before the button lights up.
 *
 * ## The order, and why the username is last
 *
 * Email → password → username, and **nothing is sent until the last screen**.
 * The account is created by one call, made from step three, with everything the
 * previous two steps collected.
 *
 * The username is last on purpose. Availability is a *check*, not a
 * reservation: nothing holds the name between the moment the check answers and
 * the moment signup claims it, so every second in that gap is a second someone
 * else can take it. On the old form the check ran on the first field and signup
 * happened after three more fields, a consent tick and a scroll — a gap of
 * however long the rest of the form took. Asking last shrinks it to the time
 * between one debounce and one tap.
 *
 * That is also why signup's own 409 stays the authority rather than the check:
 * see the comment on `usernameState` in `username.tsx`.
 *
 * ## Where the collected fields live
 *
 * `RegisterDraftProvider`, mounted here — see `context/register-draft.tsx` for
 * why it is a context rather than route params, and why unmounting this layout
 * is the right way to discard a half-typed password.
 */

export default function RegisterLayout() {
  const theme = useAppTheme();

  return (
    <RegisterDraftProvider>
      <Stack
        screenLayout={ambientScreenLayout}
        screenOptions={{
          contentStyle: { backgroundColor: theme.background },
          // Each screen draws its own back chevron and step dots inside the
          // content, so a platform header would be a second bar saying less.
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="password" />
        <Stack.Screen name="username" />
      </Stack>
    </RegisterDraftProvider>
  );
}
