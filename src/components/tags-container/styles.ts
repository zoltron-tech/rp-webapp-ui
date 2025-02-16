import { Z_INDEX } from "@/theme/geometry";
import { css, styled } from "styled-components";

const NameFontStyles = css`
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.498);
`;

export const SectionName = styled.div`
  ${NameFontStyles}
  width: 100%;
  text-transform: uppercase;
  text-align: center;
  text-align: center;
  margin-top: 20px;
  font-size: clamp(18px, 5vw, 24px);
  color: ${({ theme }) => theme.textPrimary};
  z-index: ${Z_INDEX.DEFAULT};
`;

export const TagContainer = styled.div`
  margin-top: 10px;
  max-width: 400px;
  max-height: 100px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  overflow-y: auto;
  padding: 12px;
  background-color: ${({ theme }) => theme.inputBackground};
  border-radius: 8px;
`;

export const TagValue = styled.span<{ color: string }>`
  display: inline-flex;
  align-items: center;
  font-weight: 900;
  text-align: center;
  vertical-align: middle;
  background-color: ${({ theme }) => theme.cardBackgroundTint};
  border: 2px solid ${(props) => props.color};
  color: ${(props) => props.color};
  border-radius: 8px;
  padding: 4px 12px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  white-space: nowrap; /* Prevents breaking in smaller areas */

  &::before {
    content: "#";
    margin-right: 2px;
    font-weight: 900;
  }

  &:hover {
    background-color: ${(props) => props.color};
    color: #fff;
  }
`;
