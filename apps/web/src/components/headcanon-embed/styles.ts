import type { ImageCropFilter } from "@nw/types";
import { cropBackgroundStyle } from "@nw/utils/image";
import styled from "styled-components";

/** Sits inside muse-embed's Frame/Card, so it shares their width rules. */

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  min-width: 0;
`;

export const Head = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

export const Face = styled.span<{
  $src: string;
  $crop: ImageCropFilter | null;
}>`
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  box-shadow: 0 0 0 1.5px var(--embed-accent);
  background-color: color-mix(in srgb, var(--embed-accent) 30%, var(--bg-4));
  background-image: ${(p) => (p.$src ? `url("${p.$src}")` : "none")};
  background-size: ${(p) => cropBackgroundStyle(p.$crop).backgroundSize};
  background-position: ${(p) => cropBackgroundStyle(p.$crop).backgroundPosition};
  background-repeat: no-repeat;
`;

export const Kind = styled.span`
  min-width: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--embed-accent);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  strong {
    color: var(--text);
    letter-spacing: 0.02em;
  }
`;

export const Title = styled.div`
  font-size: 15px;
  font-weight: var(--font-weight-bold);
  line-height: 1.3;
  color: var(--text);
  overflow-wrap: anywhere;
`;

export const Excerpt = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: var(--text-secondary, var(--text));
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
`;

export const Spoiler = styled.p`
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-style: italic;
  color: var(--text-secondary, var(--text));
`;

export const Foot = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
`;

export const Tag = styled.span`
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text);
  background: color-mix(in srgb, var(--embed-accent) 16%, transparent);
  border: 1px solid color-mix(in srgb, var(--embed-accent) 28%, transparent);
`;

export const Hearts = styled.span`
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary, var(--text));
`;
