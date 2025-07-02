import { DEV_MODE_BORDER } from "@/theme";
import styled from "styled-components";
import { Button } from "../common";

export const ContentContainer = styled.div`
  --border-radius: 20px;
  box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, 0.1);
  border-radius: var(--border-radius);
  position: fixed;
  display: flex;
  flex-direction: row;
  ${DEV_MODE_BORDER("blue")}
  display: flex;
  flex-direction: row;
  position: relative;
  width: max-content;
  height: max-content;
  margin-inline: auto;
  margin-block: 20px;

  @container (max-width: 1300px) {
    margin-block: 10px;
  }

  & > div:first-child {
    border-top-left-radius: var(--border-radius);
    border-bottom-left-radius: var(--border-radius);
  }

  & > div:last-child {
    border-top-right-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
  }

  &.hide {
    opacity: 0;
    pointer-events: none;
  }
`;
