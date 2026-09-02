"use client";

import NextLink from "next/link";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

/**
 * The app's link seam.
 *
 * Wraps the router's link component so the swap to React Router touches this
 * file and nothing else. Deliberately keeps Next's `href` prop name: React
 * Router's `<Link>` takes `to`, and mapping one to the other here is what
 * keeps the seven call sites — three of which are `styled(Link)` targets —
 * from changing at all.
 *
 * `forwardRef` is not optional: styled-components needs a ref-forwarding
 * target to style, and three call sites do exactly that.
 *
 * See REACT_MIGRATION_STEPS.md A5/B4.
 */

export type LinkProps = ComponentPropsWithoutRef<typeof NextLink>;

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  function Link(props, ref) {
    return <NextLink ref={ref} {...props} />;
  },
);

export default Link;
