import styled from "styled-components";
import { AvatarNew } from "@/components/common/avatar-new";

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding-top: 6px;
`;

export const AvatarUpload = styled.label`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
`;

export const Avatar = styled(AvatarNew)`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid var(--accent);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--accent) 35%, transparent);
  overflow: hidden;
`;

export const CameraBadge = styled.div`
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent);
  border: 3px solid var(--bg-1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  z-index: 2;
  pointer-events: none;

  svg {
    width: 17px;
    height: 17px;
  }
`;

export const HiddenInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
`;
