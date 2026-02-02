import { Container } from "@novelist-world/ui";
import { styled } from "styled-components";
import * as Common from "@/components/common";
import { Z_INDEX } from "@/theme";

export const LocalContainer = styled(Container)`
  border: 1px solid slategray;
  background-color: ${({ theme }: any) => theme.colors.background};
  color: var(--text);
  border-radius: 16px;

  @container (min-width: 700px) {
    width: 60%;
    min-width: 700px;
    height: 550px;
    padding: 20px;
    margin: clamp(50px, 20cqw, 50px) auto 100px auto;
  }

  @container (max-width: 700px) {
    width: 100%;
    height: 500px;
    padding: 20px;
    margin: 0px;
    border-radius: 0px;
    border: none;
  }

  /* Apply different height based on the presence of a specific class */
  &.new {
    @container (min-width: 700px) {
      height: 400px;
    }
    @container (max-width: 700px) {
      height: 450px;
    }
  }

  container-name: card;
  container-type: inline-size;
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

  @container (max-width: 400px) {
    font-size: 12px;
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
      font-size: 14px;
    }
    padding-top: 50px;
  }
`;

export const FormGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 20px;
  padding-left: clamp(0px, 20cqw, 400px);
  gap: 10px;

  @container (max-width: 600px) {
    & {
      padding-left: 0px;
      margin-top: 60px;
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

export const PillContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const Button = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }: any) => theme.hoverGreyAlpha};
  border-radius: 50%;
  box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, 0.4);
  z-index: ${Z_INDEX.MODAL};
  cursor: pointer;

  & svg {
    width: 15px;
    height: 15px;
    fill: var(--text);
    transition: transform 0.2s ease-in-out;

    pointer-events: none;
  }

  &:hover {
    background-color: ${({ theme }: any) => theme.hoverGrey};
  }

  @container (max-width: 500px) {
    width: 30px;
    height: 30px;

    & svg {
      width: 15px;
      height: 15px;
    }
  }
`;

export const ButtonGroup = styled.div`
  width: 100%;
  padding-top: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
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
