import styled from "styled-components";
import { DEV_MODE_BORDER } from "@/theme";

export const Container = styled.div`
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
`;

export const TopActionsRow = styled.div`
  width: 95%;
  max-width: 700px;
  margin-inline: auto;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const BackButton = styled.button`
  width: 36px;
  min-width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--bg-6);
  border-radius: 9999px;
  background-color: var(--bg-2);
  color: var(--text-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    cursor: pointer;
    border-color: var(--accent);
    color: var(--accent);
  }
`;

export const ListContainer = styled.div`
  ${DEV_MODE_BORDER("blue")}
  display: flex;  
  flex-direction: column;
  margin-inline: auto;
  margin-top: 10px;
  gap: 0.5rem;
  width: 100%;
  max-width: 700px;

  @container (max-width: 600px) {
    & {
      padding-inline: 10px;
    }
  }
`;

export const SeeMoreLink = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-block: 8px;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background-color: var(--bg-6);
    opacity: 0.8;
  }

  span {
    display: inline-flex;
    align-items: center;
    gap: 6px;

    padding: 6px 16px;
    border: 1px solid var(--accent);
    border-radius: 50px;
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    font-size: var(--font-size-h6);
    font-weight: 700;
    font-style: italic;
    color: var(--accent);
    white-space: nowrap;
    transition: all 0.2s ease;

    svg {
      display: block;
    }
  }

  span:hover {
    cursor: pointer;
    color: var(--accent-hover);
    border-color: var(--accent-hover);
    background: color-mix(in srgb, var(--accent) 20%, transparent);
    box-shadow: 0 0 8px color-mix(in srgb, var(--accent-hover) 50%, transparent);
  }

  @container (max-width: 600px) {
    span {
      font-size: var(--font-size-input);
    }
  }
`;

export const SectionItem = styled.div`
  padding: 10px;
  width: 100%;
  border: 1px solid var(--bg-6);
  border-radius: 5px;
  background-color: var(--bg-2);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: -5px;
`;

export const SectionContent = styled.div`
  flex: 1;
`;
