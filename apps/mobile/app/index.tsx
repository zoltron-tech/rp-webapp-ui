import { useSession } from "@nw/features";
import { Redirect } from "expo-router";
import { StartupFallback } from "@/components/startup-fallback";
import { readAccessToken } from "@/lib/session-store";

/**
 * Where the app opens.
 *
 * The web app answers this from a local "we established a session in this
 * browser" hint, because it has no readable cookie to check. Native does not
 * need the guess: the token is right here in the keychain, already loaded by
 * the root layout, so the session query gives a real answer within one request.
 *
 * A stored token that the server has since revoked resolves to `signed-out`
 * like any other, and lands on the same public screen.
 *
 * ## Not waiting for that request
 *
 * It used to: a spinner here, then a blank frame in the tabs, until the session
 * answered — on every cold start, for the reader who was signed in last time
 * and almost certainly still is. A stored token is that reader, so the app goes
 * straight to the tabs, and every screen there draws its skeleton while the
 * session and its own data arrive. The session itself is not saved to disk
 * (see `lib/query-persister.ts`), so this is the one question the app cannot
 * answer instantly — only guess well. The tabs' gate still sends a token the
 * server rejects to the public screen the moment it says so.
 */
export default function Index() {
  const { status } = useSession();

  if (status === "loading" && readAccessToken()) {
    return <Redirect href="/(tabs)/(home)" />;
  }

  // A spinner, and after a few seconds a way out if the answer never comes.
  if (status === "loading") return <StartupFallback />;

  if (status === "signed-in") return <Redirect href="/(tabs)/(home)" />;

  // Signed in without a finished profile: the set-up flow, which is the
  // only thing an account in that state can usefully do.
  if (status === "onboarding") return <Redirect href="/onboarding" />;

  return <Redirect href="/welcome" />;
}
