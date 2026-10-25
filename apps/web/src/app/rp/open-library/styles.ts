import { styled } from "styled-components";
import { shimmer } from "@/components/bookshelf/styles";
import {
  LoadMoreButton,
  LoadMoreContainer,
} from "@/components/load-more/styles";
import { FOCUS_RING, MATERIAL, MATERIAL_CARD } from "@/theme";

export const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media screen and (max-width: 800px) {
    padding: 16px 12px;
    gap: 0.75rem;
  }
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`;

export const BackLink = styled.button`
  all: unset;
  cursor: pointer;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  color: var(--text-secondary);
  border-radius: 6px;

  @media (hover: hover) {
    &:hover {
      color: var(--accent-11, var(--accent));
    }
  }

  ${FOCUS_RING}
`;

export const Title = styled.h1`
  font-size: var(--font-size-h5);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

export const Subtitle = styled.p`
  font-size: var(--font-size);
  color: var(--text-secondary);
  margin: 0;
`;

export const Meta = styled.div`
  min-height: 1.2em;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
`;

export const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: center;

  @media screen and (max-width: 800px) {
    gap: 10px;
  }
`;

export const Empty = styled.div`
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--font-size);
  margin-top: 2rem;
`;

export const EmptyAction = styled.button`
  all: unset;
  cursor: pointer;
  display: block;
  margin: 10px auto 0;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-bold);
  color: var(--accent-11, var(--accent));
  border-radius: 4px;

  ${FOCUS_RING}
`;

export const Pager = styled(LoadMoreContainer)``;

export const PagerButton = styled(LoadMoreButton)``;

// ── Signed-out panel ───────────────────────────────────────────────────────

export const LoginPanel = styled.div`
  ${MATERIAL_CARD}
  align-self: center;
  width: 100%;
  max-width: 440px;
  margin-top: 1rem;
  padding: 24px 20px;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
`;

export const LoginTitle = styled.h2`
  margin: 0;
  font-size: var(--font-size);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
`;

export const LoginText = styled.p`
  margin: 0;
  max-width: 320px;
  font-size: var(--font-size-small);
  line-height: 1.55;
  color: var(--text-secondary);
`;

export const LoginButton = styled(LoadMoreButton)`
  margin-top: 8px;
  color: var(--accent-11, var(--accent));
  border-color: color-mix(in srgb, var(--accent-11, var(--accent)) 40%, transparent);
`;

// ── Landing rows (fandom-seeded + trending) ────────────────────────────────

export const Suggested = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const SuggestedRow = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

export const RowLabel = styled.h2`
  margin: 0;
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
`;

export const RowLabelShimmer = styled.span`
  display: inline-block;
  width: 180px;
  height: 12px;
  border-radius: 6px;
  ${shimmer}
`;

export const Rail = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 6px;
  -webkit-overflow-scrolling: touch;

  /* The app's scrollbar (globals.css): a 6px accent thumb. 'scrollbar-width'
     on this element would switch Chromium to its default bar instead. */
  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background: var(--accent-6);
  }

  @supports not selector(::-webkit-scrollbar) {
    scrollbar-width: thin;
    scrollbar-color: var(--accent-6) transparent;
  }

  > * {
    flex-shrink: 0;
  }
`;

export const PagerCount = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  white-space: nowrap;
`;

// ── Recent searches ────────────────────────────────────────────────────────

export const Recent = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
`;

export const RecentLabel = styled.span`
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-right: 2px;
`;

export const RecentChip = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 50px;
  ${MATERIAL}
  font-size: var(--font-size-small);
  color: var(--text);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (hover: hover) {
    &:hover {
      color: var(--accent-11, var(--accent));
    }
  }

  ${FOCUS_RING}
`;

export const RecentClear = styled.button`
  all: unset;
  cursor: pointer;
  min-height: 32px;
  padding: 0 6px;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  border-radius: 6px;

  @media (hover: hover) {
    &:hover {
      color: var(--text);
    }
  }

  ${FOCUS_RING}
`;
