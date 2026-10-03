/**
 * A hint about whether this browser is probably signed in.
 *
 * Both session cookies are `httpOnly`, so nothing here can see them any more —
 * which is the point (SECURITY_AUTH_PLAN C5), but it removes the one cheap
 * signal the app used to answer "which way should `/` redirect?" before any
 * network call had returned.
 *
 * So the app remembers, locally, that a session was established. **This is a
 * hint and never an authorization decision.** It is trivially forgeable from the
 * console; every real answer still comes from user-service, which reads a cookie
 * this code cannot write. The worst a tampered value can do is send someone to a
 * screen that then bounces them to the login page.
 *
 * Kept in `localStorage` rather than the store because it has to survive a full
 * reload and be readable during the first render, before any provider has run.
 */

const KEY = "nw.session";

/** Private-mode browsers and blocked site data throw on access; a lost hint is harmless. */
const safely = <T>(read: () => T, fallback: T): T => {
  try {
    return read();
  } catch {
    return fallback;
  }
};

export const rememberSession = () => {
  safely(() => localStorage.setItem(KEY, "1"), undefined);
};

export const forgetSession = () => {
  safely(() => localStorage.removeItem(KEY), undefined);
};

/**
 * True when this browser most recently ended a session-establishing flow
 * successfully. False is the safe default: it routes to the public view, which
 * a signed-in user is immediately redirected out of anyway.
 */
export const probablySignedIn = (): boolean =>
  safely(() => localStorage.getItem(KEY) === "1", false);
