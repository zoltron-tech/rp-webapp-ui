import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { Link as RouterLink } from "react-router";

/**
 * The app's link seam — the React Router implementation.
 *
 * `vite.config.ts` aliases `@/components/link` to this file. See `link.tsx` for
 * why both exist.
 *
 * Keeps Next's `href` prop name and maps it to React Router's `to`, so none of
 * the seven call sites changes — including the three that are `styled(Link)`
 * targets, which is also why the ref forwarding is not optional.
 */

export type LinkProps = Omit<
  ComponentPropsWithoutRef<typeof RouterLink>,
  "to"
> & {
  href: string;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  function Link({ href, ...rest }, ref) {
    return <RouterLink ref={ref} to={href} {...rest} />;
  },
);

export default Link;
