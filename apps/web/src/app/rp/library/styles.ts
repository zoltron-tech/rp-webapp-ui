import { css, styled } from "styled-components";
import { LoadMoreButton } from "@/components/load-more/styles";
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

export const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
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

export const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: center;
`;

export const Empty = styled.div`
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--font-size);
  margin-top: 2rem;
`;

export const Shimmer = styled.div`
  width: 200px;
  min-width: 200px;
  height: 340px;
  border-radius: 14px;
  ${shimmer}

  @media (max-width: 600px) {
    width: 150px;
    min-width: 150px;
    height: 268px;
  }
`;

export const OpenLibraryLink = styled(LoadMoreButton)`
  align-self: flex-start;
  margin-top: 6px;
`;
