import styled from "styled-components";
import { FOCUS_RING } from "@/theme";

/* The "create" pill used across the list pages. Translucent accent wash on
   material (it sits on the ambient canvas, not a slab), accent-11 label so the
   text clears contrast on dark. */
export const Button = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 36px;
    box-sizing: border-box;
    padding: 0 16px;
    border: 1px solid color-mix(in srgb, var(--accent) 50%, var(--material-edge));
    border-radius: 50px;
    background:
      linear-gradient(
        color-mix(in srgb, var(--accent) 16%, transparent),
        color-mix(in srgb, var(--accent) 16%, transparent)
      ),
      var(--material-fill);
    box-shadow: inset 0 1px 0 var(--material-highlight);
    font-size: var(--font-size);
    font-weight: 700;
    font-style: italic;
    color: var(--accent-11);
    white-space: nowrap;
    transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
    cursor: pointer;

    svg {
      display: block;
    }

    &:hover {
      color: var(--accent-12, var(--text));
      border-color: color-mix(in srgb, var(--accent) 70%, var(--material-edge));
      background:
        linear-gradient(
          color-mix(in srgb, var(--accent) 24%, transparent),
          color-mix(in srgb, var(--accent) 24%, transparent)
        ),
        var(--material-fill);
    }

    ${FOCUS_RING}
`;

export const Wrapper = styled.div`
  width: 95%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-block: 8px;
  max-width: 700px;
  margin-inline: auto;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background-color: var(--material-edge);
  }
`;
