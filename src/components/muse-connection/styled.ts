import styled, { css } from "styled-components";

export const FormRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
`;

export const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
  display: block;
`;

export const MaxReachedNote = styled.span`
  margin-left: 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #ef4444;
`;

export const TitleInput = styled.input<{ $invalid?: boolean }>`
  padding: 0.5rem;
  border: 1px solid ${({ $invalid }) => ($invalid ? "#ef4444" : "var(--bg-6)")};
  border-radius: 0.25rem;
  background-color: var(--bg-3);
  color: var(--text);
  font-size: var(--font-size-input);
  transition: border-color 0.2s;
  width: 100%;

  &:hover {
    border-color: ${({ $invalid }) => ($invalid ? "#ef4444" : "var(--bg-5)")};
  }

  &:focus {
    outline: none;
    border-color: ${({ $invalid }) => ($invalid ? "#ef4444" : "var(--accent)")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const RequiredMark = styled.span`
  color: #ef4444;
  margin-left: 0.2rem;
`;

export const MusePickerWrap = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const MuseChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
`;

export const MuseChip = styled.span<{ $own?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.2rem 0.5rem 0.2rem 0.25rem;
  border-radius: 999px;
  background-color: var(--bg-4);
  border: 1px solid
    ${({ $own }) =>
      $own ? "rgba(37, 99, 235, 0.45)" : "rgba(147, 51, 234, 0.4)"};
  color: var(--text);
  font-size: var(--font-size-xsmall);
  line-height: 1;
`;

export const MuseOwnerTag = styled.span<{ $own?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.05rem 0.35rem;
  border-radius: 999px;
  font-size: var(--font-size-xxsmall);
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: ${({ $own }) => ($own ? "rgb(37, 99, 235)" : "rgb(147, 51, 234)")};
  background-color: ${({ $own }) =>
    $own ? "rgba(37, 99, 235, 0.12)" : "rgba(147, 51, 234, 0.12)"};
`;

export const MuseTabRow = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  gap: 0;
`;

export const MuseTabButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 0.3rem;
  padding: 0.35rem 0.65rem;
  border-radius: 0;
  border: 1px solid ${({ $active }) => ($active ? "var(--accent)" : "var(--bg-6)")};
  background-color: ${({ $active }) =>
    $active
      ? "color-mix(in srgb, var(--accent) 18%, var(--bg-3))"
      : "var(--bg-3)"};
  color: var(--text);
  font-size: var(--font-size-small);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
  position: relative;
  z-index: ${({ $active }) => ($active ? 1 : 0)};

  &:not(:first-child) {
    margin-left: -1px;
  }

  &:first-child {
    border-radius: 0.5rem 0 0 0;
  }

  &:last-child {
    border-radius: 0 0.5rem 0 0;
  }

  &:hover {
    border-color: var(--accent);
    z-index: 2;
  }

  @media (max-width: 600px) {
    font-size: var(--font-size-xsmall);
  }
`;

export const MuseChipAvatar = styled.span<{ $src?: string | null }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: var(--bg-6);
  background-image: ${({ $src }) => ($src ? `url("${$src}")` : "none")};
  background-size: cover;
  background-position: center;
`;

/* Standalone avatar (edit mode) — no chip, name, or tag around it. */
export const MuseAvatarOnly = styled.span<{ $src?: string | null }>`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: var(--bg-6);
  border: 1px solid var(--bg-6);
  background-image: ${({ $src }) => ($src ? `url("${$src}")` : "none")};
  background-size: cover;
  background-position: center;
`;

export const MuseChipRemove = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text);
  opacity: 0.6;
  cursor: pointer;
  padding: 0;

  &:hover {
    opacity: 1;
  }
`;

export const MuseSearchInput = styled.input`
  margin-top: -0.5rem;
  padding: 0.5rem;
  border: 1px solid var(--bg-6);
  border-bottom-left-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
  background-color: var(--bg-3);
  color: var(--text);
  font-size: var(--font-size-input);
  width: 100%;

  &:focus {
    outline: none;
    border-color: var(--accent);
  }
`;

export const MuseSearchDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 30;
  margin-top: 0.25rem;
  background-color: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 0.375rem;
  max-height: 100px;
  overflow-y: auto;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
`;

export const MuseListToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: -0.75rem;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--bg-6);
  border-bottom-left-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
  background-color: var(--bg-3);
  color: var(--text);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: var(--bg-4);
  }
`;

export const MuseListToggleIcon = styled.span<{ $expanded: boolean }>`
  display: inline-flex;
  transform: rotate(${({ $expanded }) => ($expanded ? "180deg" : "0deg")});
  transition: transform 0.2s ease;
`;

export const MuseListPanel = styled.div`
  position: static;
  background-color: var(--bg-3);
  border: 1px solid var(--bg-6);
  border-radius: 0.375rem;
  max-height: 100px;
  overflow-y: auto;
`;

export const MuseSearchEmpty = styled.div`
  padding: 0.6rem;
  font-size: 0.8rem;
  color: var(--text);
  opacity: 0.6;
  text-align: center;
`;

export const MuseSearchOption = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.45rem 0.6rem;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 0.85rem;
  cursor: pointer;
  text-align: left;

  &:hover {
    background-color: var(--bg-4);
  }
`;

/* Compact info box explaining who can edit these fields — an inline-scale
   version of the InfoBox pattern used elsewhere (e.g. profile/referrals),
   sized down to sit comfortably inside this form instead of a full page. */
export const DescriptionHint = styled.p`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0.5rem 0;
  padding: 8px 10px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--accent) 10%, var(--bg-2));
  border: 1px solid color-mix(in srgb, var(--accent) 26%, var(--bg-5));
  color: var(--text-secondary);
  font-size: 0.7rem;
  line-height: 1.45;

  &::before {
    content: "💡";
    flex-shrink: 0;
    font-size: 0.85rem;
    line-height: 1.45;
  }
`;

export const EditorArea = styled.div`
  min-height: 160px;
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;

  & > * {
    flex: 1;
  }
`;

export const ToolRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
`;

export const ToolButton = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 0.25rem;
  border: 1px solid var(--bg-6);
  background-color: var(--bg-3);
  color: var(--text);
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: var(--bg-4);
  }
`;

export const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  padding: 0.6rem;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.25rem;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;

export const SubmitButton = styled.button`
  padding: 0.625rem 1.25rem;
  background-color: var(--accent);
  color: var(--text);
  border: none;
  border-radius: 0.25rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: var(--accent-hover);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const CancelButton = styled.button`
  padding: 0.625rem 1.25rem;
  background-color: var(--bg-4);
  color: var(--text);
  border: 1px solid var(--bg-6);
  border-radius: 0.25rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: var(--bg-5);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* ── Detail view ─────────────────────────────────────────────────────────── */

export const DetailRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
`;

export const DetailHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const DetailHeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const DetailEditButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  border: 1px solid var(--bg-6);
  background-color: var(--bg-3);
  color: var(--text);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.15s ease, border-color 0.15s ease,
    color 0.15s ease, transform 0.1s ease;

  &:hover {
    background-color: color-mix(in srgb, var(--accent) 16%, var(--bg-3));
    border-color: var(--accent);
    color: var(--accent);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const STATUS_CHIP_COLORS: Record<string, string> = {
  DONE: "21, 128, 61",
  PENDING: "180, 83, 9",
  REJECTED: "185, 28, 28",
};

export const StatusChip = styled.span<{
  $status: "PENDING" | "DONE" | "REJECTED";
}>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: ${({ $status }) => `rgb(${STATUS_CHIP_COLORS[$status]})`};
  background-color: ${({ $status }) =>
    `rgba(${STATUS_CHIP_COLORS[$status]}, 0.12)`};
  border: 1px solid ${({ $status }) => `rgba(${STATUS_CHIP_COLORS[$status]}, 0.35)`};
`;

export const DetailMeta = styled.span`
  font-size: 0.75rem;
  opacity: 0.7;
  color: var(--text);
`;

export const DetailMuseGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

/* `$variant="glass"` matches the accent-tinted translucent look used by the
   muse profile page's ConnectionCard (see rp/muse/[slug]/styles.ts) instead
   of the flat `--bg-3` panel the edit-muse form uses — same footprint
   (padding/gap/radius) either way, just a different fill/border/text color,
   so the card's size never changes between contexts. */
export const DetailMuseCard = styled.button<{
  $variant?: "default" | "glass";
  $accent?: string | null;
}>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 160px;
  flex-shrink: 0;
  padding: 0.35rem 0.6rem 0.35rem 0.35rem;
  border-radius: 0.5rem;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s ease, border-color 0.2s ease;

  ${({ $variant, $accent }) =>
    $variant === "glass"
      ? css`
          border: 1px solid
            ${$accent && $accent.trim() !== ""
              ? `color-mix(in srgb, ${$accent} 26%, transparent)`
              : "rgba(255, 255, 255, 0.14)"};
          background-color: ${$accent && $accent.trim() !== ""
            ? `color-mix(in srgb, ${$accent} 10%, rgba(0, 0, 0, 0.3))`
            : "rgba(255, 255, 255, 0.05)"};
          color: #fff;

          &:hover {
            border-color: ${$accent && $accent.trim() !== ""
              ? `color-mix(in srgb, ${$accent} 45%, transparent)`
              : "rgba(255, 255, 255, 0.28)"};
            background-color: ${$accent && $accent.trim() !== ""
              ? `color-mix(in srgb, ${$accent} 16%, rgba(0, 0, 0, 0.3))`
              : "rgba(255, 255, 255, 0.09)"};
          }
        `
      : css`
          border: 1px solid var(--bg-6);
          background-color: var(--bg-3);
          color: var(--text);

          &:hover {
            background-color: var(--bg-4);
          }
        `}
`;

/* Wraps name + owner so they can truncate independently of the fixed-width
   card — flex items default to min-width:auto, which would otherwise let a
   long name push the card wider instead of ellipsizing. */
export const DetailMuseCardInfo = styled.span`
  display: block;
  min-width: 0;
  flex: 1;
  overflow: hidden;
`;

export const DetailMuseName = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const DetailMuseOwner = styled.span`
  font-size: 0.62rem;
  opacity: 0.65;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ApprovalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const ApprovalRow = styled.div<{ $approved: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--text);
  opacity: ${({ $approved }) => ($approved ? 1 : 0.7)};
`;

export const DescriptionWrap = styled.div`
  border-top: 1px solid var(--bg-5);
  padding-top: 0.5rem;
`;

export const DetailActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

/* Circular accept (tick) / decline (cross) buttons for the pending request. */
export const DetailReactButton = styled.button<{
  $variant: "accept" | "decline";
}>`
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  color: #fff;
  background: ${({ $variant }) =>
    $variant === "accept" ? "var(--grass-9)" : "rgb(185, 28, 28)"};
  box-shadow: 0 2px 8px
    ${({ $variant }) =>
      $variant === "accept"
        ? "color-mix(in srgb, var(--grass-9) 45%, transparent)"
        : "rgba(185, 28, 28, 0.4)"};
  transition: transform 0.1s ease, filter 0.15s ease, opacity 0.15s ease;

  &:hover {
    filter: brightness(1.08);
  }

  &:active {
    transform: scale(0.9);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

/* ── Mobile tray header (title left, circular actions top-right) ───────────── */

export const TrayHeaderBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 4px 14px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--bg-5);
`;

export const TrayTitle = styled.span`
  flex: 1;
  min-width: 0;
  font-size: var(--font-size-input);
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const TrayActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

export const TrayActionButton = styled.button<{
  $variant: "cancel" | "confirm";
}>`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.15s ease, opacity 0.15s ease, transform 0.1s ease;
  background: ${({ $variant }) =>
    $variant === "confirm" ? "var(--grass-9)" : "var(--bg-3)"};
  color: ${({ $variant }) =>
    $variant === "confirm" ? "#fff" : "var(--text-secondary)"};
  border: 1px solid
    ${({ $variant }) => ($variant === "confirm" ? "transparent" : "var(--bg-5)")};

  &:hover {
    background: ${({ $variant }) =>
      $variant === "confirm" ? "var(--grass-9)" : "var(--bg-4)"};
    opacity: ${({ $variant }) => ($variant === "confirm" ? 0.9 : 1)};
  }

  &:active {
    transform: scale(0.92);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export const TrayDialogInlinePadding = styled.div`
  padding: 0 0.1rem;
`;

/* ── Inline expandable connection card (list item in the section) ─────────── */

export const ConnectionCard = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 8px;
  border: 1px solid var(--bg-6);
  border-radius: 0.5rem;
  background-color: var(--bg-3);
  overflow: hidden;

  &:last-child {
    margin-bottom: 0;
  }
`;

/* Rendered only while a card is expanded — guarantees enough scroll room
   below the list so the expanded card (even the last one) can scroll fully
   into view with a comfortable margin beneath it. */
export const ConnectionsBottomSpacer = styled.div`
  flex: 0 0 100%;
  width: 100%;
  height: 48px;
`;

export const ConnectionCardHeader = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.6rem;
  cursor: pointer;

  &:hover {
    background-color: var(--bg-4);
  }
`;

export const ConnectionAvatarStack = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;

  & > * {
    margin-left: -6px;
    border: 2px solid var(--bg-3);
  }

  & > *:first-child {
    margin-left: 0;
  }
`;

export const ConnectionOverflowBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 0.3rem;
  margin-left: -6px;
  border: 2px solid var(--bg-3);
  border-radius: 999px;
  background-color: var(--bg-6);
  color: var(--text);
  font-size: 0.62rem;
  font-weight: 700;
`;

export const ConnectionCardTitle = styled.span`
  flex: 1;
  min-width: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
`;

export const ConnectionCardActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
`;

export const ConnectionEditIconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid var(--bg-6);
  background-color: var(--bg-2);
  color: var(--text);
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background-color: color-mix(in srgb, var(--accent) 16%, var(--bg-2));
    border-color: var(--accent);
    color: var(--accent);
  }
`;

/* Same footprint as the edit button, but tints red on hover — the creator-only
   delete action in the collapsed card header. */
export const ConnectionDeleteIconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid var(--bg-6);
  background-color: var(--bg-2);
  color: var(--text);
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background-color: rgba(185, 28, 28, 0.12);
    border-color: rgb(185, 28, 28);
    color: rgb(185, 28, 28);
  }
`;

/* Compact circular accept (tick) / decline (cross) buttons for the collapsed
   card header — shown when the viewer must respond before they can edit. */
export const ConnectionReactButton = styled.button<{
  $variant: "accept" | "decline";
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  color: #fff;
  cursor: pointer;
  background: ${({ $variant }) =>
    $variant === "accept" ? "var(--grass-9)" : "rgb(185, 28, 28)"};
  transition: filter 0.15s ease, transform 0.1s ease, opacity 0.15s ease;

  &:hover {
    filter: brightness(1.1);
  }

  &:active {
    transform: scale(0.9);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export const ConnectionChevron = styled.span<{ $expanded: boolean }>`
  display: inline-flex;
  color: var(--text);
  opacity: 0.6;
  transform: rotate(${({ $expanded }) => ($expanded ? "180deg" : "0deg")});
  transition: transform 0.2s ease;
`;

export const ConnectionCardBody = styled.div`
  padding: 0.6rem;
  border-top: 1px solid var(--bg-6);
`;
