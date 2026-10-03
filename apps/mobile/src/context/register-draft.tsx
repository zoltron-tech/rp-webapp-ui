import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

/**
 * What the registration flow has collected so far.
 *
 * ## Why this is a context and not route params
 *
 * A password in `router.push({ params })` is a password in the navigation
 * state — logged by the router in development, restored from disk on some
 * platforms, and visible in a deep link. It never leaves memory here.
 *
 * ## Why it lives on the flow's layout
 *
 * `app/register/_layout.tsx` mounts the provider, so backing out of the flow
 * unmounts it and the draft goes with it. Coming back in starts clean, which is
 * the correct behaviour for a half-typed password — and it is why each step
 * checks the fields it depends on and redirects to the start when they are
 * missing, rather than submitting something empty.
 *
 * The username is deliberately **not** here. It is typed on the last screen and
 * used by the one call that screen makes, so it never needs to survive a step;
 * keeping it local is what makes "the gap between the availability check and
 * signup" a property of one component rather than of the flow.
 */
export interface RegisterDraft {
  email: string;
  password: string;
}

interface RegisterDraftContext {
  draft: RegisterDraft;
  update: (patch: Partial<RegisterDraft>) => void;
}

const EMPTY: RegisterDraft = { email: "", password: "" };

const Context = createContext<RegisterDraftContext>({
  draft: EMPTY,
  update: () => {},
});

export const useRegisterDraft = (): RegisterDraftContext => useContext(Context);

export const RegisterDraftProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [draft, setDraft] = useState<RegisterDraft>(EMPTY);

  const value = useMemo(
    () => ({
      draft,
      update: (patch: Partial<RegisterDraft>) =>
        setDraft((previous) => ({ ...previous, ...patch })),
    }),
    [draft],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};
