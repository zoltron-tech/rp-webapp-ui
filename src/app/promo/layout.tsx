import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PromoShell } from "./_demo/shell";

/**
 * The promo capture surface.
 *
 * Not a product route: these pages exist so `promo-gif/render.mjs` can drive the
 * real storyboard components with fixture data and screenshot them. Kept out of
 * search results and out of the sitemap accordingly.
 */
export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Promo capture",
};

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
