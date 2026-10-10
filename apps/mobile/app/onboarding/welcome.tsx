import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@nw/features";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/button";
import { Confetti } from "@/components/confetti";
import { Logo } from "@/components/logo";
import { Text } from "@/components/text";
import { useA11ySettings } from "@/lib/a11y-settings";
import { withAlpha } from "@/lib/color";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * The welcome — web's `/rp/welcome`, as the party it is meant to be.
 *
 * The profile was just finished; this is the one screen in the app whose
 * whole job is to say so. Web's page carries the first-character offer on it
 * and so does this one: **Create my first character** opens the new-character
 * screen (which comes back to the Discord step once the character exists) and
 * **Skip for now** goes to the Discord step directly. Either way the flow
 * ends on "Find your people".
 *
 * ## The motion, and what it costs
 *
 * Three things move, once each, and then the screen is still:
 *
 * - **Confetti** — one burst from behind the logo as the screen lands (see
 *   `components/confetti.tsx`: one native-driven value, unmounted when done).
 *   Tapping the logo throws another, because somebody will.
 * - **The logo** — pops in on a spring, with a ring of the accent that swells
 *   and fades behind it three times. Three, not forever: a pulse that never
 *   stops is a screen that never rests.
 * - **The content** — greeting, card and buttons rise into place one after
 *   another, 90ms apart.
 *
 * Every one of them is `transform` and `opacity` on the native driver, so the
 * JS thread is idle after the first frame. Under Reduce Motion nothing
 * animates: the values start at rest and the confetti does not play.
 *
 * Not the `AuthScreen` shell: that shell is a form's — a heading top-left
 * over fields. This is a centred hero with its actions pinned to the foot.
 */

/** How many blocks rise in, in order: badge, title, subtitle, card, hint. */
const RISERS = 5;
const RISE = 18;
const LOGO = 76;

export default function OnboardingWelcomeScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { reduceMotion } = useA11ySettings();
  const { novelist } = useSession();
  const name = novelist?.firstName || novelist?.username || "Novelist";

  const rest = reduceMotion ? 1 : 0;
  const logo = useRef(new Animated.Value(rest)).current;
  const halo = useRef(new Animated.Value(0)).current;
  const risers = useRef(
    Array.from({ length: RISERS }, () => new Animated.Value(rest)),
  ).current;
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;

    const entrance = Animated.parallel([
      Animated.spring(logo, {
        bounciness: 14,
        speed: 10,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.stagger(
        90,
        risers.map((value) =>
          Animated.timing(value, {
            duration: 420,
            easing: Easing.out(Easing.cubic),
            toValue: 1,
            useNativeDriver: true,
          }),
        ),
      ),
    ]);
    const pulse = Animated.loop(
      Animated.timing(halo, {
        duration: 1400,
        easing: Easing.out(Easing.quad),
        toValue: 1,
        useNativeDriver: true,
      }),
      { iterations: 3 },
    );

    // After the push transition has landed, so the burst is seen whole.
    const start = setTimeout(() => {
      entrance.start();
      pulse.start();
      setBurst(1);
    }, 320);

    return () => {
      clearTimeout(start);
      entrance.stop();
      pulse.stop();
    };
  }, [halo, logo, reduceMotion, risers]);

  const rise = (index: number) => ({
    opacity: risers[index],
    transform: [
      {
        translateY: risers[index].interpolate({
          inputRange: [0, 1],
          outputRange: [RISE, 0],
        }),
      },
    ],
  });

  const logoTop = insets.top + space.xl;
  const toDiscord = () => router.replace("/onboarding/discord");

  return (
    <View style={styles.root}>
      {/* The accent, washed down from the top: louder than a form's wash,
          because this screen has nothing to read through it but a logo. */}
      <LinearGradient
        colors={[
          withAlpha(theme.accent.solid, 0.3),
          theme.accent.tint,
          theme.background,
        ]}
        locations={[0, 0.34, 0.72]}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[styles.page, { paddingTop: logoTop }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityHint="Throws confetti"
          accessibilityLabel="Novelist World"
          accessibilityRole="button"
          onPress={() => setBurst((count) => count + 1)}
          style={styles.logoWrap}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.halo,
              {
                backgroundColor: theme.accent.solid,
                opacity: halo.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.32, 0],
                }),
                transform: [
                  {
                    scale: halo.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 2.1],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={{
              opacity: logo.interpolate({
                inputRange: [0, 0.4, 1],
                outputRange: [0, 1, 1],
              }),
              transform: [
                {
                  scale: logo.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 1],
                  }),
                },
                {
                  rotate: logo.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["-14deg", "0deg"],
                  }),
                },
              ],
            }}
          >
            <Logo cornerRadius={radius.card} showWordmark={false} size={LOGO} />
          </Animated.View>
        </Pressable>

        <Animated.View
          style={[
            styles.badge,
            { backgroundColor: theme.accent.tintStrong },
            rise(0),
          ]}
        >
          <Ionicons color={theme.accent.textStrong} name="sparkles" size={13} />
          <Text style={[styles.badgeLabel, { color: theme.accent.textStrong }]}>
            YOUR PROFILE IS LIVE
          </Text>
        </Animated.View>

        <Animated.View style={rise(1)}>
          <Text style={[styles.title, { color: theme.text }]}>
            Welcome,{"\n"}
            <Text style={{ color: theme.accent.text }}>{name}</Text>!
          </Text>
        </Animated.View>

        <Animated.View style={rise(2)}>
          <Text style={[styles.subtitle, { color: theme.textGray }]}>
            You're officially a novelist. The world is yours to write.
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.material.fill,
              borderColor: theme.material.edge,
            },
            rise(3),
          ]}
        >
          <Perk
            icon="chatbubbles-outline"
            text="Chat, comment and connect with fellow novelists, out of character."
            title="Explore right away"
          />
          <View
            style={[styles.rule, { backgroundColor: theme.material.edge }]}
          />
          <Perk
            icon="color-wand-outline"
            text="Bring a character to life and start writing stories together."
            title="Ready for the fun part?"
          />
        </Animated.View>

        <Animated.View style={rise(4)}>
          <Text style={[styles.hint, { color: theme.textGray }]}>
            Just looking around? You can add characters any time from your
            profile.
          </Text>
        </Animated.View>
      </ScrollView>

      <View
        style={[
          styles.foot,
          {
            backgroundColor: theme.background,
            paddingBottom: insets.bottom + space.md,
          },
        ]}
      >
        <Button
          icon="sparkles"
          label="Create my first character"
          onPress={() =>
            router.push({
              params: { onboarding: "1" },
              pathname: "/edit-muse/new",
            })
          }
          size="lg"
          variant="primary"
        />
        <Button
          label="Skip for now"
          onPress={toDiscord}
          size="lg"
          variant="quiet"
        />
      </View>

      <Confetti
        accent={theme.accent.solid}
        burst={burst}
        origin={{ x: width / 2, y: logoTop + LOGO / 2 }}
      />
    </View>
  );
}

const Perk = ({
  icon,
  text,
  title,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  title: string;
}) => {
  const theme = useAppTheme();
  return (
    <View style={styles.perk}>
      <View style={[styles.perkIcon, { backgroundColor: theme.accent.tint }]}>
        <Ionicons color={theme.accent.textStrong} name={icon} size={20} />
      </View>
      <View style={styles.perkText}>
        <Text style={[styles.perkTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.perkBody, { color: theme.textGray }]}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: radius.full,
    flexDirection: "row",
    gap: space.s,
    marginTop: space.lg,
    paddingHorizontal: space.m,
    paddingVertical: space.s,
  },
  badgeLabel: {
    fontSize: fontSize.eyebrow,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    gap: space.m,
    marginTop: space.lg,
    padding: space.md,
  },
  foot: {
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  halo: {
    borderRadius: radius.full,
    height: LOGO,
    position: "absolute",
    width: LOGO,
  },
  hint: {
    fontSize: fontSize.caption,
    lineHeight: 17,
    marginTop: space.md,
    textAlign: "center",
  },
  logoWrap: {
    alignItems: "center",
    alignSelf: "center",
    height: LOGO,
    justifyContent: "center",
    width: LOGO,
  },
  page: {
    flexGrow: 1,
    paddingBottom: space.md,
    paddingHorizontal: space.lg,
  },
  perk: { alignItems: "center", flexDirection: "row", gap: space.m },
  perkBody: { fontSize: fontSize.label, lineHeight: 18 },
  perkIcon: {
    alignItems: "center",
    borderRadius: radius.md,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  perkText: { flex: 1, gap: 1 },
  perkTitle: { fontSize: fontSize.body, fontWeight: "700" },
  root: { flex: 1 },
  rule: { height: StyleSheet.hairlineWidth },
  subtitle: {
    fontSize: fontSize.body,
    lineHeight: 21,
    marginTop: space.sm,
    textAlign: "center",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 40,
    marginTop: space.m,
    textAlign: "center",
  },
});
