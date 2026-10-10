import { Ionicons } from "@expo/vector-icons";
import { checkUsernameAvailability } from "@nw/api/endpoints/account";
import { checkUsernameInvalidity } from "@nw/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Redirect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/text";
import {
  AuthScreen,
  ErrorBox,
  SubmitButton,
  useAuthBack,
} from "@/components/auth/screen";
import { TextField } from "@/components/text-field";
import { useRegisterDraft } from "@/context/register-draft";
import { api } from "@/lib/api";
import { refreshSessionQueries, signUpWithPassword } from "@/lib/auth";
import { authErrorCode, describeAuthError } from "@/lib/auth-errors";
import { fontSize, radius, space, useAppTheme } from "@/theme";
import { PRIVACY_URL, TERMS_URL } from "@/lib/links";

/**
 * Step three of three: the name, the terms, and the only request this flow
 * makes.
 *
 * ## Why the username waits until here
 *
 * Availability is a check, not a reservation. Nothing holds a name between the
 * moment `GET /account/username` answers and the moment signup claims it, so
 * every second in that window is a second somebody else can take it and turn a
 * green "username is available" into a 409.
 *
 * On the old combined form the check ran on the *first* field and signup
 * happened after three more fields, a consent tick and a scroll — a window as
 * long as the rest of the form took to fill. Asking last closes it to one
 * debounce and one tap, which is as small as a client can make it without the
 * server offering a reservation.
 *
 * ## The one call
 *
 * `signUpWithPassword` is called here and nowhere else in the flow, with the
 * email from step one, the password from step two and the name typed on this
 * screen. Steps one and two send nothing: an abandoned registration leaves no
 * trace on the server, which is the behaviour anyone abandoning one expects.
 */

/**
 * ! The web form allows **50**; this is 30 because that is the counter the app
 * is specified to show. A username of 31–50 characters is therefore accepted on
 * web and rejected here. One constant to change if the intent was to match web
 * instead — and `checkUsernameInvalidity` in `@nw/utils`, which enforces 3–50,
 * would need the same number.
 */
const MAX_USERNAME = 30;


export default function RegisterUsernameScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { draft } = useRegisterDraft();

  const [username, setUsername] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** The email from step one is the problem: offer the way back to it. */
  const [emailTaken, setEmailTaken] = useState(false);
  const back = useAuthBack("/register/password");

  /**
   * `unknown` is a real answer, not a missing one.
   *
   * `GET /account/username` is closed to anonymous callers — SECURITY_AUTH_PLAN
   * C2 shut the account-enumeration routes, and registration is by definition
   * anonymous, so the check answers 401 for exactly the people who need it. The
   * endpoint reports that as a message string rather than a boolean.
   *
   * Reading that string as "taken" is what made every name look unavailable and
   * blocked the form outright. The web form already treats it as no complaint
   * and lets signup's 409 be the authority; this does the same, deliberately,
   * rather than asserting something it was not told.
   */
  const [state, setState] = useState<
    "idle" | "checking" | "available" | "taken" | "unknown"
  >("idle");

  /**
   * Availability, debounced.
   *
   * `seq` drops the answer to a request that a later keystroke has already
   * superseded, which is what stops a slow reply overwriting a newer one.
   */
  const seq = useRef(0);
  useEffect(() => {
    const value = username.trim();
    if (!value || checkUsernameInvalidity(value) || value.length > MAX_USERNAME) {
      setState("idle");
      return;
    }

    const mine = ++seq.current;
    setState("checking");

    const timer = setTimeout(async () => {
      try {
        const result = await checkUsernameAvailability(api, value);
        if (mine !== seq.current) return;
        // 404 (`true`) means nobody holds the name; 200 (`false`) means someone
        // does. Anything else is a string — the server declining to answer, and
        // not evidence either way.
        setState(
          result === true ? "available" : result === false ? "taken" : "unknown",
        );
      } catch {
        if (mine === seq.current) setState("unknown");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  const hint = useCallback(() => {
    const value = username.trim();
    if (!value) return undefined;
    if (value.length > MAX_USERNAME)
      return `must be at most ${MAX_USERNAME} characters`;
    if (value.length < 3) return "must be at least 3 characters";
    if (checkUsernameInvalidity(value)) return "only letters, numbers, . _ - allowed";
    if (state === "checking") return "Checking availability...";
    if (state === "taken") return "username is taken";
    if (state === "available") return "username is available";
    // "unknown" says nothing. A name the server would not rule on is not a
    // problem the person typing it can act on.
    return undefined;
  }, [username, state]);

  const wellFormed =
    username.trim().length >= 3 &&
    username.trim().length <= MAX_USERNAME &&
    !checkUsernameInvalidity(username.trim());

  const invalid =
    username.trim().length > 0 && (state === "taken" || !wellFormed);

  // Reached without the first two steps — a deep link, or a reload that dropped
  // the draft. There is nothing to submit, so this goes back to the start.
  if (!draft.email || !draft.password) return <Redirect href="/register" />;

  // Submission needs a well-formed name that is not *known* to be taken. It
  // deliberately does not require a confirmed "available": when the check
  // cannot run, requiring one leaves the button dead with nothing on screen
  // explaining why. Signup answers 409 on a genuine collision, which is the
  // only authoritative answer either client ever had.
  const valid = !busy && consent && wellFormed && state !== "taken";

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await signUpWithPassword({
        email: draft.email,
        password: draft.password,
        username: username.trim(),
      });
      await refreshSessionQueries(queryClient);
      // A brand-new account has no novelist profile yet: the set-up flow is
      // next, and the tabs open once it is finished.
      router.replace("/onboarding");
    } catch (cause) {
      const code = authErrorCode(cause);
      // The server is the authority on a taken name; the check above was
      // only ever a hint. Mark the field so the hint and the button agree.
      if (code === "conflict-username") setState("taken");
      setEmailTaken(code === "conflict-email");
      setError(
        describeAuthError(
          cause,
          "The account could not be created. Please try again.",
        ),
      );
      setBusy(false);
    }
  };

  return (
    <AuthScreen
      onBack={back}
      step={[3, 3]}
      subtitle="This is how other writers will find you. Letters, numbers, . _ and - only."
      title="Choose your name"
    >
      <View style={styles.form}>
        <ErrorBox message={error} />
        {emailTaken ? (
          <View style={styles.conflictActions}>
            <Pressable
              accessibilityRole="button"
              hitSlop={space.xs}
              onPress={() => router.replace("/register")}
            >
              <Text style={[styles.conflictLink, { color: theme.accent.text }]}>
                Use a different email
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              hitSlop={space.xs}
              onPress={() => router.replace("/login")}
            >
              <Text style={[styles.conflictLink, { color: theme.accent.text }]}>
                Sign in instead
              </Text>
            </Pressable>
          </View>
        ) : null}

        <TextField
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          counterMax={MAX_USERNAME}
          hint={hint()}
          invalid={invalid}
          label="Username"
          onChangeText={(value) => {
            setUsername(value);
            // A new attempt starts clean: the refusal was for the old name.
            if (error) setError(null);
            if (emailTaken) setEmailTaken(false);
          }}
          returnKeyType="done"
          value={username}
        />

        {/*
          The links inside the label are `Text` with their own `onPress`, so
          tapping "Terms of Service" opens it while tapping anywhere else on the
          row toggles the box. The row is the target rather than the 22px
          square, which is below every platform's minimum touch size.
        */}
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: consent }}
          onPress={() => setConsent(!consent)}
          style={styles.consent}
        >
          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: consent ? theme.accent.solid : "transparent",
                borderColor: consent ? theme.accent.solid : theme.textGray,
              },
            ]}
          >
            {consent ? <Ionicons color="#fff" name="checkmark" size={15} /> : null}
          </View>

          <Text style={[styles.consentLabel, { color: theme.text }]}>
            I agree to the{" "}
            <Text
              onPress={() => void Linking.openURL(TERMS_URL)}
              style={{ color: theme.accent.text }}
            >
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text
              onPress={() => void Linking.openURL(PRIVACY_URL)}
              style={{ color: theme.accent.text }}
            >
              Privacy Policy
            </Text>
            , and to occasionally receive emails from us.
          </Text>
        </Pressable>

        <SubmitButton
          busy={busy}
          disabled={!valid}
          label="Create account"
          loadingLabel="Creating your account..."
          onPress={() => void submit()}
        />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    alignItems: "center",
    borderRadius: 6,
    borderWidth: 1.5,
    height: 22,
    justifyContent: "center",
    marginTop: 1,
    width: 22,
  },
  conflictActions: {
    flexDirection: "row",
    gap: space.lg,
    justifyContent: "center",
    marginTop: -space.sm,
  },
  conflictLink: { fontSize: fontSize.label, fontWeight: "700" },
  consent: { flexDirection: "row", gap: space.sm },
  consentLabel: { flex: 1, fontSize: fontSize.label, lineHeight: 19 },
  form: { gap: space.md },
});
