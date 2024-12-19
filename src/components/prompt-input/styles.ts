import * as Common from "@/components/common";
import { Z_INDEX } from "@/theme/geometry";
import { Container, RichText as NWRichText } from "@novelist-world/ui";
import styled from "styled-components";

export const PromptInputContainer = styled(Container)`
  width: 100%;
  margin-bottom: 10px;
  height: max-content;
  overflow: visible;
  contain: none;
  border: none;
  border-radius: unset;
  z-index: ${Z_INDEX.CARD};

  @container (max-width: 1300px) {
    border: none;
    border-radius: unset;
    margin-top: 0px;
  }
`;

export const RichText = styled(NWRichText)`
  & > .pm-container {
    min-width: unset;
    & > .ProseMirror {
      min-width: 20px;
      background-color: ${({ theme }) => theme.colors.inputBackground};
    }
  }
`;
