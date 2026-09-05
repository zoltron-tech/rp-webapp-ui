import type { ReactNode } from "react";
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
  return (
    // `dark jade` is what scopes the theme's CSS custom properties (see
    // globals.css); `app/rp/layout.tsx` puts the same pair on its page
    // container. Without them every var() in the components falls back to
    // nothing.
    <div className="dark jade">
      <PromoShell>{children}</PromoShell>
    </div>
  );
}
