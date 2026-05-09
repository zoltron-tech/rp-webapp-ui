import styled from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.79);
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Modal = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

export const CloseButton = styled.button`
  all: unset;
  box-sizing: border-box;
  position: absolute;
  top: 12px;
  right: 12px;
  cursor: pointer;
  color: var(--text);
  opacity: 0.6;
  padding: 4px;

  &:hover {
    opacity: 1;
  }
`;

/* ── The card that gets exported as an image ── */
export const Card = styled.div`
  position: relative;
  width: 380px;
  background: linear-gradient(145deg, var(--bg-2) 0%, var(--bg-3) 100%);
  border: 1px solid var(--bg-6);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  overflow: hidden;
  box-shadow:
    0 24px 48px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.04);
`;

export const AccentBanner = styled.div`
  width: 100%;
  height: 90px;
  background: linear-gradient(
    135deg,
    var(--accent) 0%,
    color-mix(in srgb, var(--accent) 50%, transparent) 100%
  );
  opacity: 0.85;
  flex-shrink: 0;
`;

export const AvatarWrapper = styled.div`
  margin-top: -54px;
  z-index: 1;

  .avatar {
    width: 108px;
    height: 108px;
    border: 4px solid var(--bg-2);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  }
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 24px 0;
  gap: 4px;
  width: 100%;
`;

export const FullName = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  text-align: center;
`;

export const UsernameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: var(--font-weight-bold);
  color: var(--accent);
`;

export const MusesRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;

  .avatar {
    width: 46px;
    height: 46px;
    border: 2px solid var(--bg-4);
  }
`;

export const MusesLabel = styled.div`
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 4px;
`;

export const Divider = styled.div`
  width: 80%;
  height: 1px;
  background: var(--bg-6);
  margin: 16px 0 12px;
`;

export const Footer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  width: 100%;
  padding: 0 24px 20px;
  gap: 12px;
`;

export const ProfileUrlBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

export const ProfileUrlLabel = styled.div`
  font-size: var(--font-size-xsmall);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
`;

export const ProfileUrl = styled.div`
  font-size: var(--font-size-xsmall);
  font-weight: 600;
  color: var(--accent);
  word-break: break-all;
  line-height: 1.4;
`;

export const QrWrapper = styled.div`
  flex-shrink: 0;
  padding: 5px;
  background: white;
  border-radius: 7px;
  display: flex;
`;

export const NoteText = styled.div`
  font-size: var(--font-size-xsmall);
  color: var(--text);
  text-align: center;
  margin-top: 6px;
  padding: 5px 12px;
  line-height: 1.5;
  border-radius: 20px;
  border: 1px solid var(--accent);
  background: linear-gradient(
    135deg,
    var(--accent-4) 0%,
    var(--accent-3) 100%
  );
  word-break: break-word;
  max-width: 90%;
`;

export const MetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
`;

export const Img = styled.img`
  height: 18px;
  width: 18px;
`;
export const MetaLabel = styled.div`
  font-size: var(--font-size-xsmall);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
`;

export const MetaItem = styled.div`
  font-size: var(--font-size-xxsmall);
  font-weight: 600;
  color: var(--text);
  justify-content: center;
  align-items: center;
  display: flex; 
  letter-spacing: 0.02em;
`;

export const BrandBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  padding: 12px 8px 8px;
  border-top: 1px solid var(--bg-6);
  margin-top: 4px;
`;

export const BrandText = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0;
`;

export const BrandName = styled.span`
  font-size: var(--font-size-small);
  font-weight: 400;
  font-style: italic;
  text-transform: uppercase;
  color: var(--text);
  letter-spacing: 0.01em;
`;

export const BrandNameSuffix = styled.span`
  font-size: var(--font-size-small);
  font-weight: 700;
  font-style: italic;
  text-transform: uppercase;
  color: var(--accent-8);
  letter-spacing: 0.01em;
`;

export const DownloadButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 28px;
  background: var(--accent);
  color: white;
  font-size: 14px;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: var(--accent-hover);
  }
`;

export const BrandMark = styled.div`
  position: absolute;
  bottom: 72px;
  right: 28px;
  font-size: 9px;
  color: var(--text-secondary);
  opacity: 0.4;
  letter-spacing: 0.06em;
`;
