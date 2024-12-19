"use client";

import { FC } from "react";
import { useRouter } from "next/navigation";
import * as S from "./styles";
import { Button, Flex } from "@novelist-world/ui";
import { Muse } from "@/types";
import MuseSelectionDropdown from "../muse-selection-dropdown";

type Props = React.HTMLProps<HTMLDivElement> & {
  muses: Muse[];
  parentId?: string | null;
  type?: string | null;
};

const videoExtensions = ["mp4"];
const imageExtensions = ["jpg", "jpeg", "png", "gif"];
const audioExtensions = ["mp3", "mpeg", "wav"];

const getMediaTypeFromUrl = (url: string) => {
  const extension = url.split(".").pop() || "";
  if (videoExtensions.includes(extension)) return "video";
  if (imageExtensions.includes(extension)) return "image";
  if (audioExtensions.includes(extension)) return "audio";
  return "image";
};

export const PromptInput: FC<Props> = ({
  muses,
  parentId,
  type,
  className,
  ...rest
}) => {
  const { push } = useRouter();

  return (
    <S.PromptInputContainer>
      <Flex style={{ alignItems: "center" }}>
        <MuseSelectionDropdown
          className={className}
          muses={muses}
        ></MuseSelectionDropdown>
        <S.RichText height={130} editable></S.RichText>
        <Flex direction="column">
          {/* <IoMdPhotos size={50} style={{ marginTop: "30px" }} /> */}
          <Button
            secondary
            style={{ borderRadius: "5px", width: 100, marginTop: "45px" }}
          >
            Add Media
          </Button>
          <Button primary style={{ borderRadius: "5px", width: 100 }}>
            Share
          </Button>
        </Flex>
      </Flex>
    </S.PromptInputContainer>
  );
};

export default PromptInput;
