import styled, { keyframes } from "styled-components";
import { Z_INDEX } from "@/theme";

const spin_4991 = keyframes`
  10% { transform: translateY(-102%); }
  25% { transform: translateY(-100%); }
  35% { transform: translateY(-202%); }
  50% { transform: translateY(-200%); }
  60% { transform: translateY(-302%); }
  75% { transform: translateY(-300%); }
  85% { transform: translateY(-402%); }
  100% { transform: translateY(-400%); }
`;

export const Container = styled.div`
  /* Main wrapper, lets you place it anywhere */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${Z_INDEX.MODAL};

  .loader {
    color: var(--text);
    font-family: var(--font);
    font-weight: var(--font-weight-regular);
    font-size: var(--font-size-h5);
    box-sizing: content-box;
    padding: 18px 10px;
    height: calc(var(--font-size-h5) + 10px);
    display: flex;
  }

  .words {
    overflow: hidden;
    position: relative;
        font-weight: var(--font-weight-bold);

  }

  .words::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      var(--bg-color) 10%,
      transparent 30%,
      transparent 70%,
      var(--bg-color) 90%
    );
    z-index: 20;
  }

  .word {
    display: block;
    height: 100%;
    padding-left: 6px;
    color: var(--accent-7);
    animation: ${spin_4991} 4s infinite;
  }
`;
