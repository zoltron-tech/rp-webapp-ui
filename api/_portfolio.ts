import type { Muse, Novelist } from "@nw/types";
import { validateJWTSync } from "@nw/utils";
import { transformMuse, transformNovelist } from "@nw/utils/image";
import { getCookie } from "hono/cookie";
import { Hono } from "hono";

/**
 * Portfolio-backed routes: reactions, and the two public landing feeds.
 *
 * Ported from `src/pages/api/reaction/[id].ts` and
 * `src/app/api/landing/{muses,novelists}/route.ts`.
 *
 * **`jsonwebtoken` did not come with the reaction route.** It was the only
 * consumer left in the app, and `@nw/utils`'s `validateJWTSync` already does
 * exactly what the local `validateJWT` did — decode, read `exp`, compare to
 * now. Using it here means the package can simply be dropped rather than moved,
 * and the token check is the same one the client uses.
 *
 * See REACT_MIGRATION_STEPS.md C4/C5.
 */

const AUTH_HEADER_NAME = "X-NW-AUTH-TOKEN";

const ALLOWED_TARGET_TYPES = [
  "PROMPT",
  "COMMENT",
  "REPLY",
  "MEDIA",
  "MUSE",
  "PROFILE",
  "STORY_BOARD",
  "STORY_BOARD_EVENT",
];

export const portfolio = new Hono();

// ── Reactions ──────────────────────────────────────────────────────────────

portfolio.on(["PATCH", "DELETE"], "/reaction/:id", async (c) => {
  const serviceUrl = process.env.RP_SERVICE_URL;
  const id = c.req.param("id");

  // The cookie name and the auth header name are the same string; the original
  // read the cookie by the header constant, which is why this looks odd.
  const jwt = getCookie(c, AUTH_HEADER_NAME);
  if (!jwt || !validateJWTSync(jwt)) {
    return c.json({ error: "UNAUTHORIZED" }, 401);
  }

  if (!id) return c.json({ error: "BAD_PAYLOAD" }, 400);

  const headers = {
    "Content-Type": "application/json",
    [AUTH_HEADER_NAME]: jwt,
  };

  if (c.req.method === "PATCH") {
    const body = (await c.req.json().catch(() => ({}))) as {
      targetType?: string;
    };
    const targetType = body.targetType ?? "";

    if (!ALLOWED_TARGET_TYPES.includes(targetType)) {
      return c.json(
        {
          error: `Invalid targetType: ${targetType}, allowed values: ${ALLOWED_TARGET_TYPES.join(", ")}`,
        },
        400,
      );
    }

    try {
      const response = await fetch(
        `${serviceUrl}/rp/portfolio/react/${id}?targetType=${targetType}`,
        { cache: "no-store", headers, method: "PATCH" },
      );
      const result = await response.json();

      if (!response.ok) {
        return c.json(
          { message: result.message || "ERROR" },
          response.status as 400,
        );
      }
      return c.json({ reacted: true, reactions: result.reactions || 0 });
    } catch {
      return c.json({ error: "Failed to update reaction" }, 500);
    }
  }

  try {
    const response = await fetch(`${serviceUrl}/rp/portfolio/react/${id}`, {
      cache: "no-store",
      headers,
      method: "DELETE",
    });

    if (!response.ok) {
      return c.json(
        { message: response.statusText || "ERROR" },
        response.status as 400,
      );
    }
    const result = await response.json();
    return c.json({ reacted: false, reactions: result.reactions || 0 });
  } catch {
    return c.json({ error: "Failed to delete reaction" }, 500);
  }
});

// ── Landing feeds ──────────────────────────────────────────────────────────
//
// Deliberately not server actions, and the reason survives the migration in a
// different form: Next serialised server actions per client, so this fetch used
// to queue behind `authenticateAction` and the top-bar login button stayed
// hidden until the slow landing data resolved. There is no action queue any
// more, but keeping these server-side still means the browser gets one
// already-transformed payload instead of doing the wsrv.nl rewriting itself.

portfolio.get("/landing/muses", async (c) => {
  const response = await fetch(
    `${process.env.RP_SERVICE_URL}/rp/portfolio/muse/random`,
    { cache: "no-store" },
  );

  if (response.status === 404) return c.json([]);
  if (!response.ok) return c.json({ error: "upstream" }, 502);

  const muses: Muse[] = await response.json();
  for (const m of muses) transformMuse(m, "hero");

  return c.json(muses);
});

portfolio.get("/landing/novelists", async (c) => {
  const response = await fetch(
    `${process.env.RP_SERVICE_URL}/rp/portfolio/novelist/all`,
    { cache: "no-store" },
  );

  if (response.status === 404) return c.json([]);
  if (!response.ok) return c.json({ error: "upstream" }, 502);

  const novelists: Novelist[] = await response.json();
  // "carousel", not "hero" — the two landing feeds size their images
  // differently and always have.
  for (const n of novelists) transformNovelist(n, "carousel");

  return c.json(novelists);
});
