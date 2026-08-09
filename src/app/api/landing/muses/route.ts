import { NextResponse } from "next/server";
import type { Muse } from "@/types";
import { transformMuse } from "@/utils/image";

/**
 * Public landing-page muses. A GET route handler — deliberately NOT a server
 * action: Next serializes server actions per client, so on first load this
 * fetch was queueing in front of authenticateAction and the top-bar login
 * button stayed hidden until the (slow) landing data resolved. Route handlers
 * run in parallel with the action queue, so auth, novelists, and muses no
 * longer block one another.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const response = await fetch(
    `${process.env.RP_SERVICE_URL}/rp/portfolio/muse/random`,
    { cache: "no-store" },
  );

  if (response.status === 404) return NextResponse.json([]);
  if (!response.ok) {
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }

  const muses: Muse[] = await response.json();

  // wsrv.nl-resized hero card art — same treatment as the old
  // getHeroPageMusesAction server action.
  for (const m of muses) transformMuse(m, "hero");

  return NextResponse.json(muses);
}
