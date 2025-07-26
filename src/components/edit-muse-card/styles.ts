import { styled } from "styled-components";

import * as Common from "@/components/common";
import { Z_INDEX } from "@/theme";
import {
  Container,
  Flex as NWFlex,
  RichText as NWRichText,
  TextArea,
} from "@novelist-world/ui";

export const RichText = styled(NWRichText)`
  & > .pm-container {
    & > .ProseMirror {
      background-color: ${({ theme }: any) => theme.colors.inputBackground};
    }
  }
`;

export const DropDownButton = styled.button`
  background-color: ${({ theme }: any) => theme.colors.primary};
  color: #212121;
  padding: 10px 15px;
  font-size: 15px;
  font-weight: bold;
  border: 2px solid transparent;
  border-radius: 15px;
  cursor: pointer;
  transition: border-radius 0.2s ease;

  &.open {
    border-radius: 15px 15px 0 0;
  }
`;

export const DropdownContent = styled.div`
  display: none;
  font-size: 13px;
  position: absolute;
  z-index: 100;
  min-width: 200px;
  background-color: #212121;
  border: 2px solid ${({ theme }: any) => theme.colors.primary};
  border-radius: 0px 15px 15px 15px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);

  & > button {
    width: 100%;
    background: none;
    border: none;
    color: ${({ theme }: any) => theme.colors.primary};
    padding: 8px 10px;
    text-align: left;
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
    transition: 0.1s;

    &:hover {
      background-color: ${({ theme }: any) => theme.colors.primary};
      color: #212121;
    }

    &:focus {
      outline: none;
      background-color: #212121;
      color: ${({ theme }: any) => theme.colors.primary};
    }

    &:first-child:hover {
      border-radius: 0px 13px 0px 0px;
    }

    &:last-child:hover {
      border-radius: 0px 0px 13px 13px;
    }
  }
`;

export const PasteButton = styled.div`
  position: relative;
  display: block;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;

  &:hover ${DropdownContent} {
    display: block;
  }
`;

export const LocalContainer = styled(Container)`
  border: 1px solid slategray;
  background-color: ${({ theme }: any) => theme.colors.background};
  color: ${({ theme }: any) => theme.text};
  border-radius: 16px;

  @container (min-width: 700px) {
    width: 60%;
    min-width: 700px;
    height: 1300px;
    padding: 20px;
    margin: clamp(50px, 20cqw, 50px) auto 100px auto;
  }

  @container (max-width: 700px) {
    width: 100%;
    height: 1400px;
    padding: 20px;
    margin: 0px;
    border-radius: 0px;
    border: none;
  }

  container-name: card;
  container-type: inline-size;
`;

export const Profile = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100cqw;
  height: 100cqh;
  padding: 20px;
`;

export const Title = styled.div`
  font-size: clamp(20px, 4cqw, 36px);
  font-weight: 200;
  margin-left: clamp(0px, calc(120px - 20cqw), 120px);
  text-transform: uppercase;
  white-space: nowrap;

  @container (max-width: 300px) {
    font-size: 14px;
  }
`;

export const UsernameContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;

  padding-left: clamp(0px, 20cqw, 400px);
  padding-top: 50px;

  & > span {
    padding-left: 20px;
    padding-right: 10px;
    font-weight: 200;
    font-size: clamp(16px, 4cqw, 20px);
  }

  & > div {
    font-weight: 400;
    font-size: clamp(24px, 4cqw, 32px);
  }

  @container (max-width: 400px) {
    & > span,
    div {
      font-size: 11px;
    }
    padding-top: 30px;
  }
`;

export const FandomWrapper = styled.div`
  position: relative;
  display: flex;
  gap: 10px;
  width: 100%;
`;

export const FandomDropdown = styled.ul`
  position: absolute;
  width: 100%;
  margin-top: 0.25rem;
  background-color: #212121;
  border: 2px solid ${({ theme }: any) => theme.colors.primary};
  border-radius: 15px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
`;

export const FandomOption = styled.li`
  padding: 0.5rem 1rem;
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }: any) => theme.colors.primary};
  }
`;

export const SelectedFandom = styled.div`
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #444;
`;

export const NicknamesWrapper = styled.div`
  max-height: 80px;
  min-height: 80px;
  overflow-y: auto;
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  box-sizing: border-box;
  background-color: ${({ theme }: any) => theme.colors.inputBackground};
  color: ${({ theme }: any) => theme.textSecondary || "#666"};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const ExtraAttributesWrapper = styled.div`
  max-height: 100px;
  min-height: 100px;
  overflow-y: auto;
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  box-sizing: border-box;
  background-color: ${({ theme }: any) => theme.colors.inputBackground};
  color: ${({ theme }: any) => theme.textSecondary || "#666"};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const ExtraAttributesList = styled.ul`
  margin: 0;
  padding-left: 0;
  width: 100%;
  list-style: none;
  color: ${({ theme }: any) => theme.text};
`;

export const ExtraAttributeItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5em;
  border-radius: 6px;
  padding: 6px 12px;
  color: ${({ theme }: any) => theme.text};
`;

export const RemoveButton = styled.button`
  background: transparent;
  border: none;
  color: red;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.1em;
  padding: 0;
  line-height: 1;

  &:hover {
    color: darkred;
  }
`;

export const FormGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 20px;
  padding-left: clamp(0px, 20cqw, 400px);
  gap: 10px;

  @container (max-width: 600px) {
    & {
      padding-left: 0px;
    }
  }
`;

export const Name = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;

  @container (max-width: 600px) {
    & {
      flex-direction: column;
      justify-content: flex-start;
    }
  }
`;

export const ButtonGroup = styled.div`
  width: 100%;
  padding-top: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;

  & .sm-hide {
    display: inline-block;
  }

  @container (max-width: 440px) {
    & .sm-hide {
      display: none;
    }
  }
`;

export const StoryTextArea = styled(TextArea)`
  height: 100px;
  max-height: 200px;
  max-width: 100%;
  min-width: 100%;
`;

export const SaveButton = styled(Common.Button)`
  /* max-width: 300px;
  margin-top: 20px;
  margin-left: clamp(0px, calc(120px - 20cqw), 120px);
  margin-bottom: 20px;

  @container (max-width: 440px) {
    & .sm-hide {
      display: none;
    }
  } */
`;

type ProfileBackgroundFilterProps = {
  banner: string;
};

export const ProfileBackgroundBlurFilter = styled.div<ProfileBackgroundFilterProps>`
  position: absolute;
  top: 0;
  left: 0px;
  width: 100cqw;
  height: 100%;
  max-height: 100vh;
  background-image: linear-gradient(
      ${({ theme }: any) => theme.cardBackgroundTint},
      ${({ theme }: any) => theme.cardBackgroundTint}
    ),
    url(${(props): string => props.banner});
  background-position: center;
  background-size: cover;
  z-index: ${Z_INDEX.BACKGROUND};

  top: clamp(-300px, calc(-600px + 80cqw), 0px);

  filter: blur(80px);
  -webkit-filter: blur(80px);
  -moz-filter: blur(80px);
  -o-filter: blur(80px);
  -ms-filter: blur(80px);
`;

export const Label = styled.label`
  font-size: 0.75em;
  margin-top: 0.5em;
`;

export const Flex = styled(NWFlex)`
  width: 100%;
`;
