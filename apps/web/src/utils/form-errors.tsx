import type { ReactNode } from "react";
import { SUPPORT_EMAIL_URL } from "@/utils/constants/common";

/**
 * The generic "something broke and we don't know what" message.
 *
 * Seven forms had this exact markup pasted into their own `ERROR_MAP`. It stays
 * web-only JSX rather than moving to `@nw/utils` — the shared packages have no
 * React DOM, and a native app would render the same words very differently.
 * What is portable is the wording, not the markup.
 */
export const UNCATEGORIZED_ERROR_MESSAGE: ReactNode = (
  <>
    <p>
      Something went wrong while logging you in, please try reloading the page.
    </p>
    <p>
      <strong>Tip:&nbsp;</strong>
      If this keeps happening, try&nbsp;
      <a href={SUPPORT_EMAIL_URL}>contacting support</a>.
    </p>
  </>
);
