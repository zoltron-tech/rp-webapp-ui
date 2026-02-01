import { Popover, Tabs, Toolbar } from "radix-ui";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import styled, { css, keyframes } from "styled-components";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const LoadingWrapper = styled.div`
  height: 6rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Spinner = styled(AiOutlineLoading3Quarters)`
  animation: ${spin} 0.8s linear infinite;
  font-size: 1.5rem;
  opacity: 0.7;
`;

export const Container = styled.div`
  width: 100%;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 0;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  border: 2px dashed #d1d5db;
`;

export const EmptyText = styled.p`
  color: #6b7280;
  font-size: 1.125rem;
`;

export const ToolbarRoot = styled(Toolbar.Root)`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: var(--bg-4);
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
  border: 1px solid var(--bg-6);
`;

export const FontSelectRoot = styled.div`
  position: relative;

  .font-select-dropdown-icon {
    position: absolute;
    height: 20px;
    width: 20px;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-55%);
    color: var(--text);
    pointer-events: none;
  }
`;

export const FontSelect = styled.select`
box-sizing: content-box;
  padding: 0.5rem;
  padding-right: 2rem;
  border: 1px solid var(--bg-6);
  border-radius: 0.25rem;
  background-color: var(--bg-3);
  cursor: pointer;
  transition: background-color 0.2s;
  color: var(--text);
  text-overflow: ellipsis;
  -moz-appearance:none; /* Firefox */
  -webkit-appearance:none; /* Safari and Chrome */
  appearance:none;
  overflow:hidden; 
  white-space:nowrap; 
  text-overflow:ellipsis;

  &:hover {
    background-color: var(--bg-5);
  }
`;

export const Divider = styled.div`
  width: 1px;
  height: 2rem;
  background-color: #d1d5db;
  margin: 0 0.25rem;
`;

export const ToggleGroup = styled(Toolbar.ToggleGroup)`
  display: flex;
  gap: 0.25rem;
`;

const toggleItemBase = css`
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface ToggleItemProps {
  $active?: boolean;
}

export const ToggleItem = styled(Toolbar.ToggleItem)<ToggleItemProps>`
  ${toggleItemBase}
  background-color: ${(props) => (props.$active ? "var(--accent)" : "var(--text-background)")};
  color: ${(props) => (props.$active ? "var(--text)" : "var(--text-secondary)")};

  &:hover {
    background-color: ${(props) => (props.$active ? "var(--accent)" : "var(--hover-background)")};
  }
`;

export const EditorWrapper = styled.div`
  position: relative;
`;

export const EditorContent = styled.div`
  width: 100%;
  min-height: 16rem;
  padding: 1rem;
  border-left: 1px solid var(--bg-6);
  border-right: 1px solid var(--bg-6);
  border-bottom: 1px solid var(--bg-6);
  outline: none;
  overflow: auto;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
  font-size: var(--font-size-input);

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--accent);
  }

  &:empty::before {
    content: attr(data-placeholder);
    color: #9ca3af;
    pointer-events: none;
  }

.mention-tag {
  display: inline-flex;
  align-items: flex-end;
    min-width: 100px;
  gap: 6px; /* 👈 space between avatar and text */

  background: linear-gradient(
    135deg,
    var(--accent) 0%,
    var(--accent-hover) 70%
  );
  color: var(--text, var(--text));
  padding: 4px 8px 4px 4px;
  border-radius: 999px;
  font-weight: var(--font-weight-bold);
  margin: 2px;
  user-select: none;
  font-size: var(--font-size);

  &:hover {
    background: linear-gradient(
      135deg,
      var(--accent-hover) 0%,
      var(--accent-active, var(--accent-hover)) 100%
    );
  }
}

.mention-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.mention-text {
  white-space: nowrap;
}

`;

export const FadeOverlay = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;

  height: 3rem;
  pointer-events: none;

  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0) 0%,
    var(--bg-3) 90%
  );
`;

export const ContentWrapper = styled.div<{ $animating: boolean }>`
  position: relative;
  overflow: hidden;
  transition: max-height 0.4s ease-in-out;

  ${({ $animating }) => $animating && "will-change: max-height;"}
`;

export const Toggle = styled.button`
  background: none;
  border: none;
  color: var(--accent);
  font-size: var(--font-size-h6);
  margin-inline-start: 10px;
  font-style: italic;
  font-weight: 700;
    cursor: pointer;

  &:hover {
    cursor: pointer;
    color: var(--accent-hover);
    text-decoration: underline;
  }

  @container (max-width: 600px) {
    & {
      font-size: var(--font-size-input);
    }
  }
`;

export const SavedContent = styled.div`
  width: 100%;
  outline: none;
  overflow: auto;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
  font-size: var(--font-size-input);

.mention-tag {
  display: inline-flex;
  align-items: center;
  min-width: 110px;
  gap: 6px; /* 👈 space between avatar and text */
  cursor: pointer;

  background: linear-gradient(
    135deg,
    var(--accent) 0%,
    var(--accent-hover) 70%
  );
  color: var(--text, var(--text));
  padding: 2px 4px 2px 2px;
  border-radius: 999px;
  font-weight: var(--font-weight-bold);
  margin: 2px;
  user-select: none;
  font-size: var(--font-size);

  &:hover {
    background: linear-gradient(
      135deg,
      var(--accent-hover) 0%,
      var(--accent-active, var(--accent-hover)) 100%
    );
  }
}

.mention-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.mention-text {
  white-space: nowrap;
}
`;

export const PopoverAnchor = styled(Popover.Anchor)`
  position: absolute;
`;

export const PopoverContent = styled(Popover.Content)`
  width: 20rem;
  background-color: var(--bg-3);
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--bg-6);
  z-index: 50;
  animation: ${fadeIn} 0.15s ease-out;
`;

export const TabsList = styled(Tabs.List)`
  display: flex;
  border-bottom: 1px solid var(--bg-6);
`;

export const TabsTrigger = styled(Tabs.Trigger)`
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;

  &:hover {
    color: var(--text);
    background-color: var(--accent);
  }

  &[data-state='active'] {
    color: var(--text);
    background-color: var(--accent);
  }
`;

export const TabsContent = styled(Tabs.Content)`
  max-height: 16rem;
  overflow-y: auto;
`;

interface MenuItemProps {
  $focused?: boolean;
}

export const MentionItem = styled.button<MenuItemProps>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.5rem;
  transition: all 0.2s;
  text-align: left;
  border: none;
  cursor: pointer;
  background-color: ${(props) => (props.$focused ? "var(--accent)" : "var(--text-background)")};
  color: ${(props) => (props.$focused ? "var(--text)" : "var(--text-secondary)")};

  &:hover {
    background-color: var(--accent);
  }

  .avatar {
    height: 30px;
    width: 30px;
  }
`;

export const MentionIcon = styled.span`
  font-size: 1.5rem;
`;

export const MentionName = styled.span`
  color: var(--text);
`;

export const EmptyMessage = styled.div`
  padding: 1.5rem 1rem;
  text-align: center;
  color: #6b7280;
`;

export const SaveButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;

export const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--accent);
  color: var(--text);
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
  background-color: var(--accent-hover);
  }
`;
