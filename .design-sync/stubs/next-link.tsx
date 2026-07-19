// Browser-preview stub for next/link — plain anchor, navigation suppressed.
import React from "react";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string | { pathname?: string };
  prefetch?: boolean;
  scroll?: boolean;
  replace?: boolean;
  shallow?: boolean;
  passHref?: boolean;
  legacyBehavior?: boolean;
};

const Link = React.forwardRef<HTMLAnchorElement, Props>(function Link(
  { href, prefetch, scroll, replace, shallow, passHref, legacyBehavior, children, onClick, ...rest },
  ref,
) {
  const url = typeof href === "string" ? href : (href?.pathname ?? "#");
  return (
    <a
      ref={ref}
      href={url}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
});

export default Link;
