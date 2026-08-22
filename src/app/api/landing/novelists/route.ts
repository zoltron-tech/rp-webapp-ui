import type { Novelist } from "@nw/types";
import { transformNovelist } from "@nw/utils/image";
import { NextResponse } from "next/server";

/**
 * Public landing-page novelists. A GET route handler — deliberately NOT a
 * server action: Next serializes server actions per client, so on first load
 * this fetch was queueing in front of authenticateAction and the top-bar
 * login button stayed hidden until the (slow) landing data resolved. Route
 * handlers run in parallel with the action queue, so auth, novelists, and
 * muses no longer block one another.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const response = await fetch(
    `${process.env.RP_SERVICE_URL}/rp/portfolio/novelist/all`,
    { cache: "no-store" },
  );

  if (response.status === 404) return NextResponse.json([]);
  if (!response.ok) {
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }

  const novelists: Novelist[] = await response.json();

  // Route S3 image URLs through wsrv.nl at carousel sizes — same treatment
  // as the old getNovelists server action.
  for (const n of novelists) transformNovelist(n, "carousel");

  return NextResponse.json(novelists);
}
