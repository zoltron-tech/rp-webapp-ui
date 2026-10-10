import { verifyEmailPattern } from "@nw/utils";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import {
  AuthScreen,
  SubmitButton,
  useAuthBack,
} from "@/components/auth/screen";
import { Socials } from "@/components/auth/socials";
import { TextField } from "@/components/text-field";
import { useRegisterDraft } from "@/context/register-draft";
import { fontSize, space, useAppTheme } from "@/theme";

/**
 * Step one of three: the email address.
 *
 * One field, because the first screen of a sign-up is where people decide
 * whether to bother, and one field is the smallest possible answer to "how much
 * is this going to ask of me".
 *
 * Email is first rather than the username because it is the field nobody has to
 * invent — you already have one, and typing it needs no decision. The name you
 * will be known by is a decision, and it is left until last for a reason the
 * layout's comment sets out.
 *
 * The provider buttons live here and not on the later steps: signing in with
 * Google skips this whole flow, so it belongs at the point where the flow can
 * still be skipped.
 *
 * **Nothing is sent from this screen.** The address is held in memory and
 * travels to step three, which makes the one signup call.
 */
export default function RegisterEmailScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { draft, update } = useRegisterDraft();

  const [email, setEmail] = useState(draft.email);
  /*
   * Nothing is marked wrong until the field has been left once.
   *
   * "Must be a valid email address" under a field holding `a` is technically
   * right and reads as being told off for typing the first character. Web shows
   * it as soon as the value is non-empty; on a phone, where the field is the
   * only thing on screen, that is a lot louder.
   */
  const [touched, setTouched] = useState(false);
  const back = useAuthBack("/welcome");

  const value = email.trim();
  const valid = verifyEmailPattern(value);
  const invalid = touched && value.length > 0 && !valid;

  const next = () => {
    if (!valid) return;
    update({ email: value });
    router.push("/register/password");
  };

  return (
    <AuthScreen
      footer={
        <Pressable
          accessibilityRole="button"
          hitSlop={space.xs}
          onPress={() => router.replace("/login")}
          style={styles.switch}
        >
          <Text style={[styles.switchLabel, { color: theme.textGray }]}>
            Already have an account?{" "}
            <Text style={{ color: theme.accent.text, fontWeight: "700" }}>
              Sign in
            </Text>
          </Text>
        </Pressable>
      }
      onBack={back}
      step={[1, 3]}
      subtitle="A new world takes about a minute to set up."
      title="What's your email?"
    >
      <View style={styles.form}>
        <TextField
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          autoFocus
          hint={invalid ? "must be a valid email address" : undefined}
          invalid={invalid}
          keyboardType="email-address"
          label="Email"
          onBlur={() => setTouched(true)}
          onChangeText={setEmail}
          onSubmitEditing={next}
          placeholder="you@example.com"
          returnKeyType="next"
          value={email}
        />

        <SubmitButton disabled={!valid} label="Continue" onPress={next} />

        <Socials />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  form: { gap: space.md },
  switch: { alignItems: "center", justifyContent: "center", minHeight: 44 },
  switchLabel: { fontSize: fontSize.label },
});
