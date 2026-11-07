import { css, styled } from "styled-components";
import { FilterSearch } from "@/components/filter-search";
import { shimmerMove } from "@/theme/animations";

const shimmer = css`
  background: linear-gradient(
    90deg,
    var(--bg-3) 25%,
    var(--bg-4) 50%,
    var(--bg-3) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmerMove} 1.4s infinite;
`;

/** The Library page's frame: the two directories read as one family. */
export const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 600px) {
    padding: 14px 8px;
  }
`;

/** Header, search and the grid share the feed's 800px column. */
const COLUMN = css`
  width: 100%;
  max-width: 800px;
  margin-inline: auto;
`;

export const Header = styled.div`
  ${COLUMN}
  display: flex;
  flex-direction: column;
  gap: 4px;

  @media (max-width: 600px) {
    padding-inline: 6px;
  }
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

export const Search = styled(FilterSearch)`
  ${COLUMN}
`;

/** Fixed-width cards (MusePreviewCard: 240 desktop, 140 on phones) wrapped
 *  and centred, as the profile's Characters grid lays them out. */
export const Grid = styled.div`
  ${COLUMN}
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;

  @media (max-width: 600px) {
    gap: 6px;
  }
`;

export const Empty = styled.div`
  ${COLUMN}
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 2rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--font-size);
`;

export const RetryButton = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  padding: 8px 18px;
  min-height: 36px;
  border-radius: 999px;
  border: 1px solid var(--material-edge);
  background: var(--material-fill);
  color: var(--text);
  font-family: var(--font);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semi-bold);

  &:hover {
    background: var(--fill-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--accent-11, var(--accent));
    outline-offset: 2px;
  }
`;

/** MusePreviewCard's footprint while the first page loads. */
export const CardShimmer = styled.div`
  flex-shrink: 0;
  width: 240px;
  height: 420px;
  border-radius: 16px;
  ${shimmer}

  @media (max-width: 600px) {
    width: 140px;
    height: 245px;
  }
`;
