import { Ionicons } from "@expo/vector-icons";
import { checkUsernameAvailability } from "@nw/api/endpoints/account";
import type { NWImage } from "@nw/types";
import { checkUsernameInvalidity, toCropFilter } from "@nw/utils";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AuthScreen, ErrorBox, SubmitButton } from "@/components/auth/screen";
import { Avatar } from "@/components/avatar";
import { ImageCropEditor } from "@/components/muse/edit/image-crop-editor";
import { Text } from "@/components/text";
import { TextField } from "@/components/text-field";
import { useImageCropFlow } from "@/hooks/use-image-crop-flow";
import type { CropState } from "@/hooks/use-muse-edit";
import { useOnboarding } from "@/hooks/use-onboarding";
import { api } from "@/lib/api";
import { describeAuthError } from "@/lib/auth-errors";
import { fontSize, radius, space, useAppTheme } from "@/theme";

/**
 * Onboarding, step one of three: who you are.
 *
 * Web spreads this over two tabs — username, then name and photo. One screen
 * here: a photo, a handle and two names fit the 375×667 baseline with room
 * to spare, and the handle is already filled in from signup, so for most
 * people it is a field to glance at rather than one to fill.
 *
 * ## The handle
 *
 * Prefilled with the account's username. Signup chose it, or a provider
 * sign-in generated one — which is the case the field is for. It is checked
 * for availability only once it differs from the current one; asking the
 * server whether your own name is free answers "taken".
 *
 * ## The photo
 *
 * Picked, uploaded and cropped before the profile exists, exactly as a new
 * character's is (`edit-muse/new`), and sent with the first save. Optional:
 * a profile with no picture gets the lettered avatar everywhere, which is
 * fine, and a photo demanded on the first screen is a reason to stop.
 *
 * ## The save
 *
 * The first `POST /novelist` happens here, with the names and the photo; the
 * about and the colour are `PUT`s on the following screens. Nothing is lost
 * by leaving after this: the profile exists, unfinished, and the flow resumes
 * from the start next time with the fields filled in.
 */

const MAX_NAME = 50;
const MAX_USERNAME = 50;
const NEUTRAL_FILTERS = { blur: 0, brightness: 100, greyscale: 0 };

export default function OnboardingProfileScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const onboarding = useOnboarding();
  const { novelist, user } = onboarding;

  const [username, setUsername] = useState(user?.username ?? "");
  const [firstName, setFirstName] = useState(novelist?.firstName ?? "");
  const [lastName, setLastName] = useState(novelist?.lastName ?? "");
  const [avatar, setAvatar] = useState<{ crop: CropState; src: string } | null>(
    null,
  );
  const [touched, setTouched] = useState({ firstName: false, username: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The account arrives a beat after the profile query on a cold start.
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current || !user?.username) return;
    seeded.current = true;
    if (!username) setUsername(user.username);
  }, [user?.username, username]);

  const avatarFlow = useImageCropFlow({
    onSave: async (src, crop) => {
      setAvatar({ crop, src });
      return true;
    },
    prefix: null,
  });

  /** Availability of a changed handle, debounced; the register step's rule. */
  const [state, setState] = useState<
    "idle" | "checking" | "available" | "taken" | "unknown"
  >("idle");
  const seq = useRef(0);
  const handle = username.trim();
  const handleChanged = Boolean(user?.username) && handle !== user?.username;
  const handleWellFormed =
    handle.length >= 3 &&
    handle.length <= MAX_USERNAME &&
    !checkUsernameInvalidity(handle);

  useEffect(() => {
    if (!handleChanged || !handleWellFormed) {
      setState("idle");
      return;
    }
    const mine = ++seq.current;
    setState("checking");
    const timer = setTimeout(async () => {
      try {
        const result = await checkUsernameAvailability(api, handle);
        if (mine !== seq.current) return;
        setState(
          result === true ? "available" : result === false ? "taken" : "unknown",
        );
      } catch {
        if (mine === seq.current) setState("unknown");
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [handle, handleChanged, handleWellFormed]);

  const usernameHint = !touched.username
    ? undefined
    : handle.length === 0
      ? "choose a username"
      : handle.length < 3
        ? "must be at least 3 characters"
        : handle.length > MAX_USERNAME
          ? `must be at most ${MAX_USERNAME} characters`
          : checkUsernameInvalidity(handle)
            ? "only letters, numbers, . _ - allowed"
            : state === "checking"
              ? "Checking availability..."
              : state === "taken"
                ? "username is taken"
                : state === "available"
                  ? "username is available"
                  : undefined;
  const usernameInvalid =
    touched.username && (!handleWellFormed || state === "taken");

  const firstNameProblem =
    touched.firstName && firstName.trim().length === 0
      ? "your first name is what others see"
      : undefined;

  const wellFormed =
    firstName.trim().length > 0 && handleWellFormed && state !== "taken";
  const canSubmit = wellFormed && !busy && !avatarFlow.uploading;

  const avatarImage: NWImage | null = avatar
    ? {
        crop: toCropFilter(
          avatar.src,
          avatar.crop.x,
          avatar.crop.y,
          avatar.crop.scale,
        ),
        filterValues: NEUTRAL_FILTERS,
        src: avatar.src,
      }
    : (novelist?.avatar ?? null);
  const avatarUri = avatar?.src ?? novelist?.avatar?.src ?? novelist?.image;

  const next = async () => {
    if (!wellFormed) {
      setTouched({ firstName: true, username: true });
      return;
    }
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await onboarding.changeUsername(handle);
      await onboarding.saveProfile({
        avatar: avatarImage ?? undefined,
        firstName: firstName.trim(),
        image: avatarImage?.src ?? novelist?.image ?? undefined,
        lastName: lastName.trim(),
      });
      router.push("/onboarding/about");
    } catch (cause) {
      setError(
        describeAuthError(cause, "Your profile could not be saved. Try again."),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScreen
      step={[1, 3]}
      subtitle="This is you, the author — not a character. You'll create characters to write as once your profile is set up."
      title="Set up your profile"
    >
      <View style={styles.form}>
        <ErrorBox message={error} />

        <View style={styles.photoRow}>
          <Pressable
            accessibilityLabel={avatarUri ? "Change photo" : "Add a photo"}
            accessibilityRole="button"
            onPress={() =>
              avatarFlow.open(
                avatar
                  ? ({ ...avatarImage, src: avatar.src } as NWImage)
                  : (novelist?.avatar ?? null),
              )
            }
            style={styles.photo}
          >
            {avatarUri ? (
              <Avatar
                image={avatarImage}
                name={firstName || handle}
                size={88}
                uri={avatarUri}
              />
            ) : (
              <View
                style={[
                  styles.photoEmpty,
                  {
                    backgroundColor: theme.accent.tint,
                    borderColor: theme.accent.solid,
                  },
                ]}
              >
                <Ionicons
                  color={theme.accent.text}
                  name="camera-outline"
                  size={28}
                />
              </View>
            )}
            <View
              style={[
                styles.photoBadge,
                {
                  backgroundColor: theme.accent.solid,
                  borderColor: theme.background,
                },
              ]}
            >
              <Ionicons color="#fff" name="camera" size={12} />
            </View>
          </Pressable>
          <View style={styles.photoText}>
            <Text style={[styles.photoTitle, { color: theme.text }]}>
              Your photo
            </Text>
            <Text style={[styles.photoHint, { color: theme.textGray }]}>
              {avatarFlow.uploading
                ? "Uploading…"
                : "Optional. Shown beside everything you say out of character."}
            </Text>
          </View>
        </View>

        <TextField
          autoCapitalize="none"
          autoCorrect={false}
          counterMax={MAX_USERNAME}
          hint={usernameHint}
          invalid={usernameInvalid}
          label="Username"
          maxLength={MAX_USERNAME}
          onBlur={() => setTouched((t) => ({ ...t, username: true }))}
          onChangeText={(value) => {
            setUsername(value);
            if (error) setError(null);
          }}
          returnKeyType="next"
          value={username}
        />

        <TextField
          autoComplete="given-name"
          autoFocus={!novelist?.firstName}
          hint={firstNameProblem}
          invalid={Boolean(firstNameProblem)}
          label="First name"
          maxLength={MAX_NAME}
          onBlur={() => setTouched((t) => ({ ...t, firstName: true }))}
          onChangeText={(value) => {
            setFirstName(value);
            if (error) setError(null);
          }}
          placeholder="What should we call you?"
          returnKeyType="next"
          value={firstName}
        />

        <TextField
          autoComplete="family-name"
          label="Last name (optional)"
          maxLength={MAX_NAME}
          onChangeText={setLastName}
          onSubmitEditing={() => void next()}
          returnKeyType="done"
          value={lastName}
        />

        <SubmitButton
          busy={busy}
          disabled={!canSubmit}
          label="Continue"
          loadingLabel="Saving..."
          onPress={() => void next()}
        />
      </View>

      <ImageCropEditor
        aspect={1}
        autoFit={avatarFlow.autoFit}
        busy={avatarFlow.saving}
        initial={avatarFlow.initial}
        onClose={avatarFlow.close}
        onConfirm={(state) => void avatarFlow.confirm(state)}
        onReplace={() => void avatarFlow.replace()}
        title="Adjust your photo"
        uploading={avatarFlow.uploading}
        uri={avatarFlow.uri}
        visible={avatarFlow.visible}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  form: { gap: space.m },
  photo: { alignSelf: "flex-start" },
  photoBadge: {
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 2,
    bottom: 0,
    height: 26,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    width: 26,
  },
  photoEmpty: {
    alignItems: "center",
    borderRadius: radius.full,
    borderStyle: "dashed",
    borderWidth: 1.5,
    height: 88,
    justifyContent: "center",
    width: 88,
  },
  photoHint: { fontSize: fontSize.caption, lineHeight: 17 },
  photoRow: { alignItems: "center", flexDirection: "row", gap: space.md },
  photoText: { flex: 1, gap: space.xxs },
  photoTitle: { fontSize: fontSize.body, fontWeight: "700" },
});
