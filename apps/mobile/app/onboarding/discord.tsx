import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { Linking, StyleSheet, View } from "react-native";
import { AuthScreen } from "@/components/auth/screen";
import { Button } from "@/components/button";
import { Text } from "@/components/text";
import { env } from "@/lib/env";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * After the welcome (and the first character, if one was made): the Discord.
 *
 * Web's `JoinDiscordPrompt`, which it shows as a dialog over the home page
 * right after onboarding. A screen in the flow is the same offer without a
 * modal over the first thing the person sees. Two buttons and no third:
 * Join opens the invite in the Discord app or the browser and moves the flow
 * on at the same time, so coming back lands on "Find your people" rather
 * than on this offer again; Skip moves on without opening anything.
 *
 * Without an invite URL configured there is nothing to offer, and the flow
 * skips straight past rather than showing a button that does nothing.
 */

/** Discord's blurple, as the brand asks for behind its mark. */
const BLURPLE = "#5865F2";

export default function OnboardingDiscordScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const invite = env.DISCORD_INVITE_URL;

  if (!invite) return <Redirect href="/onboarding/novelists" />;

  const next = () => router.replace("/onboarding/novelists");

  return (
    <AuthScreen
      subtitle="Connect and hang out with fellow novelists, get the latest app updates, share feedback and receive support."
      title="Be a part of NW Community"
    >
      <View style={styles.form}>
        <View style={[styles.mark, { backgroundColor: BLURPLE }]}>
          <Ionicons color="#ffffff" name="logo-discord" size={44} />
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.material.fill,
              borderColor: theme.material.edge,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            The Novelist World Discord server
          </Text>
          <Text style={[styles.cardBody, { color: theme.textGray }]}>
            Where the community talks between stories: writing partners,
            announcements, help from the team, and the first look at what is
            coming.
          </Text>
        </View>

        <Button
          icon="logo-discord"
          label="Join the server"
          onPress={() => {
            void Linking.openURL(invite);
            next();
          }}
          size="lg"
          variant="primary"
        />
        <Button label="Skip for now" onPress={next} size="lg" variant="quiet" />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    gap: space.xs,
    padding: space.md,
  },
  cardBody: { fontSize: fontSize.label, lineHeight: 19 },
  cardTitle: { fontSize: fontSize.body, fontWeight: "700" },
  form: { gap: space.m },
  mark: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: radius.full,
    height: 84,
    justifyContent: "center",
    width: 84,
  },
});
