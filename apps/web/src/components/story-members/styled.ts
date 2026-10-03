import styled from "styled-components";

/**
 * The co-authors card.
 *
 * Its chrome is shared with the cast strip that sits beside it on the
 * storyboard page — see `@/components/common/people-card/styles`. Only what is
 * genuinely specific to co-authors lives here.
 */
export * from "@/components/common/people-card/styles";

/** A member's name is their handle; the cast's is a muse's name. */
export { RowName as RowUsername } from "@/components/common/people-card/styles";

/** Creator and admin, called out on the row. Nothing like it in the cast. */
export const RoleBadge = styled.span<{ $variant: "creator" | "admin" }>`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  border: 1px solid
    ${({ $variant }) =>
      $variant === "creator" ? "var(--amber-9)" : "var(--accent)"};
  color: ${({ $variant }) =>
    $variant === "creator" ? "var(--amber-11)" : "var(--accent-11)"};
  background: ${({ $variant }) =>
    $variant === "creator"
      ? "color-mix(in srgb, var(--amber-9) 12%, transparent)"
      : "color-mix(in srgb, var(--accent) 12%, transparent)"};
`;
