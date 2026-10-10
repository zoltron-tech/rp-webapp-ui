import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { type ReactNode, useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/button";
import { Text } from "@/components/text";
import { useKeyboardOffset } from "@/hooks/use-keyboard-height";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The frame every signed-out screen is built in.
 *
 * There are five of them now — the landing screen, sign-in, and three steps of
 * registration — and the previous single screen had all of it inline. Five
 * copies of a gradient, a back chevron, a heading block and a submit button is
 * five chances for one of them to drift, and the drift is the kind nobody
 * reports: a heading two points smaller here, a button four points shorter
 * there.
 *
 * ## What the shell owns
 *
 * The wash of accent behind the top of the page; the back chevron and the step
 * dots; the heading and its one line of subtitle; the scroll view and its
 * keyboard padding; and the footer, which is pinned rather than scrolled.
 *
 * ## Why there is still a `ScrollView` on screens that fit
 *
 * Every screen using this is sized to land inside the 375×667 baseline in
 * `AGENTS.md` without scrolling — that is the whole point of splitting
 * registration into steps. A scroll view whose content fits does not scroll, so
 * it costs those screens nothing; what it buys is the two cases the layout
 * cannot be sized for. An accessibility text size can make any of these taller
 * than the display, and a focused field near the foot of a short screen still
 * needs somewhere to go when the keyboard takes half of it.
 *
 * ## Keyboard
 *
 * No `KeyboardAvoidingView`. It cannot work in this app — `edgeToEdgeEnabled`
 * means the window is never resized, so the view measures no change and pads
 * nothing (the long version is in `use-keyboard-height.ts`). The scroll view
 * takes the keyboard's height as bottom padding instead.
 */
export const AuthScreen = ({
  children,
  footer,
  onBack,
  step,
  subtitle,
  title,
}: {
  children: ReactNode;
  /** Pinned to the foot of the display, outside the scroll. */
  footer?: ReactNode;
  /** Omitted on a screen with nowhere to go back to. */
  onBack?: () => void;
  /** `[current, total]`, one-based. Draws the step dots beside the chevron. */
  step?: [number, number];
  subtitle?: string;
  title: string;
}) => {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const keyboardOffset = useKeyboardOffset(insets.bottom);

  return (
    <View style={styles.root}>
      {/*
        A wash of the signed-in accent behind the top of the page, fading out by
        just under halfway. It is `accent.tint` — step 3, the faintest usable
        one — because this sits under body text and a bolder step would start
        competing with the heading it is meant to sit behind.

        Signed out the accent is jade, which is what the landing page shows.
      */}
      <LinearGradient
        colors={[theme.accent.tint, theme.background]}
        locations={[0, 0.45]}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.page,
          {
            paddingBottom: space.md + (footer ? 0 : keyboardOffset),
            paddingTop: insets.top + space.sm,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        {onBack || step ? (
          <View style={styles.bar}>
            {onBack ? (
              <Pressable
                accessibilityLabel="Go back"
                accessibilityRole="button"
                hitSlop={space.sm}
                onPress={onBack}
                style={({ pressed }) => [
                  styles.back,
                  { opacity: pressed ? 0.5 : 1 },
                ]}
              >
                <Ionicons color={theme.text} name="chevron-back" size={24} />
              </Pressable>
            ) : (
              <View style={styles.back} />
            )}

            {step ? <StepDots current={step[0]} total={step[1]} /> : null}

            {/* Balances the chevron so the dots sit on the screen's centre. */}
            <View style={styles.back} />
          </View>
        ) : null}

        <View style={styles.intro}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: theme.textGray }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {children}
      </ScrollView>

      {footer ? (
        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.background,
              paddingBottom: insets.bottom + space.md + keyboardOffset,
            },
          ]}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );
};

/**
 * Where you are in the registration flow.
 *
 * Dots rather than "Step 2 of 3": the count is three, which is small enough to
 * be seen rather than read, and a flow that *looks* short is the argument for
 * having split it up in the first place.
 */
const StepDots = ({ current, total }: { current: number; total: number }) => {
  const theme = useAppTheme();

  return (
    <View
      accessibilityLabel={`Step ${current} of ${total}`}
      accessibilityRole="progressbar"
      style={styles.dots}
    >
      {Array.from({ length: total }, (_, index) => {
        const done = index < current;
        return (
          <View
            key={`step-${index + 1}`}
            style={[
              styles.dot,
              {
                backgroundColor: done
                  ? theme.accent.solid
                  : theme.material.edge,
                // The one you are on is a stadium rather than a circle, so the
                // current step is legible without counting the filled ones.
                width: index === current - 1 ? 18 : 6,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

/**
 * Back, or somewhere sensible when there is no back.
 *
 * `router.back()` on a screen opened cold — a deep link, or a reload in
 * development — has no history to pop and leaves the chevron doing nothing.
 * Every one of these screens knows where it would have come from, so it says
 * so and the control always works.
 */
export const useAuthBack = (fallback: string) => {
  const router = useRouter();

  return useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(fallback);
  }, [fallback, router]);
};

/** The filled action at the foot of every one of these screens. */
export const SubmitButton = ({
  busy,
  disabled,
  label,
  loadingLabel,
  onPress,
}: {
  busy?: boolean;
  disabled?: boolean;
  label: string;
  loadingLabel?: string;
  onPress: () => void;
}) => (
  <Button
    busy={busy}
    busyLabel={loadingLabel}
    disabled={disabled}
    label={label}
    onPress={onPress}
    size="lg"
    variant="primary"
  />
);

/**
 * A refusal, said where the thing was refused.
 *
 * An alert, so a screen reader announces it when it appears rather than
 * waiting to be found under the field it belongs to.
 */
export const ErrorBox = ({ message }: { message: string | null }) => {
  const theme = useAppTheme();
  if (!message) return null;

  return (
    <View
      accessibilityLiveRegion="assertive"
      accessibilityRole="alert"
      style={[styles.errorBox, { borderColor: theme.error }]}
    >
      <Ionicons
        color={theme.error}
        name="alert-circle"
        size={16}
        style={styles.errorIcon}
      />
      <Text style={[styles.errorText, { color: theme.error }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  back: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  bar: { alignItems: "center", flexDirection: "row" },
  dot: { borderRadius: radius.full, height: 6 },
  dots: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
  },
  errorBox: {
    alignItems: "flex-start",
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: space.sm,
    padding: space.ms,
  },
  errorIcon: { marginTop: 1 },
  errorText: { flex: 1, fontSize: fontSize.label, lineHeight: 18 },
  footer: { gap: space.sm, paddingHorizontal: space.lg, paddingTop: space.sm },
  intro: { gap: space.xs, paddingBottom: space.xs, paddingTop: space.sm },
  page: { flexGrow: 1, gap: space.md, paddingHorizontal: space.lg },
  root: { flex: 1 },
  scroll: { backgroundColor: "transparent", flex: 1 },
  subtitle: { fontSize: fontSize.label, lineHeight: 19 },
  /* iOS Title 1 — 28/34, the largest step these screens have room for. */
  title: { fontSize: fontSize.display, fontWeight: "700", lineHeight: 34 },
});
