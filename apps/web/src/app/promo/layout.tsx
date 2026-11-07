import type { ReactNode } from "react";
import { useLocation } from "react-router";
import { PromoShell } from "./_demo/shell";

/**
 * The promo capture surface.
 *
 * Not a product route: these pages exist so `promo-gif/render.mjs` can drive the
 * real storyboard components with fixture data and screenshot them.
 *
 * Keeping them out of search results used to be this file's `robots` metadata
 * export. A SPA has no per-route metadata, so `public/robots.txt` disallows
 * /promo/ instead.
 */
export default function PromoLayout({ children }: { children: ReactNode }) {
  // /promo/screen/* are captured as phone screens: keep the app's real look.
  const screen = useLocation().pathname.startsWith("/promo/screen/");
  return (
    // `dark jade` is what scopes the theme's CSS custom properties (see
    // globals.css); `app/rp/layout.tsx` puts the same pair on its page
    // container. Without them every var() in the components falls back to
    // nothing.
    <div className="dark jade">
      <PromoShell screen={screen}>{children}</PromoShell>
    </div>
  );
}
