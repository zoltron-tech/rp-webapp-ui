import styled from "styled-components";
import { Z_INDEX } from "@/theme";

export const Container = styled.div`
  position: sticky;
  left: 0;
  right: 0;
  z-index: ${Z_INDEX.TOPBAR - 1};
  
  display: flex;
  align-items: center;
  gap: 12px;
  
  background-color: var(--accent-1);
  border-bottom: 1px solid var(--bg-6);
  padding: 8px 16px;
  
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  animation: slideDown 0.3s ease-out;
  
  @keyframes slideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

export const PlayButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  width: 36px;
  min-width: 36px;
  
  background: var(--accent);
  border: 1px solid var(--bg-5);
  border-radius: 50%;
  cursor: pointer;
  
  font-size: var(--font-size);
  color: var(--text);
  
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--accent-hover);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

export const SongInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

export const TimeAndProgress = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

export const TimeDisplay = styled.span`
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  white-space: nowrap;
  min-width: 40px;
  text-align: center;
`;

export const SongName = styled.div`
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const SongNameClickable = styled.button`
  font-size: var(--font-size);
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: color 0.2s ease;
  text-align: left;
  width: 100%;
  
  &:hover {
    color: var(--accent);
  }
`;

export const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  width: 28px;
  min-width: 28px;
  
  background: transparent;
  border: 1px solid var(--bg-6);
  border-radius: 4px;
  cursor: pointer;
  
  font-size: var(--font-size-small);
  color: var(--text-secondary);
  
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--bg-3);
    color: var(--text);
    border-color: var(--bg-5);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

export const ProgressBarWrapper = styled.div`
  position: relative;
  flex: 1;
  height: 4px;
  background: var(--bg-6);
  border-radius: 2px;
  cursor: pointer;
  overflow: hidden;

  transition: height 0.2s ease;

  &:hover {
    height: 6px;
  }
`;

export const ProgressBar = styled.div`
  height: 100%;
  width: 0%;
  background: var(--accent);
  transition: width 0.1s linear;
  border-radius: 2px;
  
  /* subtle glow */
  box-shadow: 0 0 6px var(--accent);
  filter: brightness(1.2);
`;
