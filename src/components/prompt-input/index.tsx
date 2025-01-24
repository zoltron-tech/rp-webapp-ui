"use client";

import { FC, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as S from "./styles";
import { Button, Flex } from "@novelist-world/ui";
import {
  Comment,
  Muse,
  Prompt,
  PromptSource,
  Reply,
  SubmitPromptInput,
  SubmitPromptType,
} from "@/types";
import { StoreProvider } from "@/context";
import { ShouldRender } from "../common";
import classNames from "classnames";
import { useAuthContext, useStore } from "@/hooks";
import { submitPrompt, uploadMedia } from "@/app/rp/profile/actions";
import { StoreState } from "@/types/state";

type Props = React.HTMLProps<HTMLDivElement> & {
  muses: Muse[];
  type?: SubmitPromptType;
  parentId?: string;
};

type PromptInputState = {
  media: File | null;
  text: string;
  muse: Muse | null;
  parentId?: string;
  type: SubmitPromptType;
};

const INITIAL_STATE: PromptInputState = {
  media: null,
  text: "",
  muse: null,
  parentId: "",
  type: "prompt",
};

const museToSource = (muse: Muse): PromptSource => ({
  _tag: "PromptSource",
  sourceId: muse.id || "",
  name: (muse.firstName + " " + muse.lastName).trim(),
  image: muse.image || "",
});

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

const AddMediaButton = () => {
  const [media, set] = useStore<PromptInputState, "media">(
    (state) => state.media,
  );

  const handleClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*, video/*, audio/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      set({ media: file });
    };
    input.click();
  };

  return (
    <Button
      secondary
      onClick={handleClick}
      style={{ borderRadius: "5px", width: 100, marginTop: "45px" }}
    >
      Add Media
    </Button>
  );
};

const SubmitButton = () => {
  const [media] = useStore<PromptInputState, "media">((state) => state.media);
  const [text] = useStore<PromptInputState, "text">((state) => state.text);
  const [muse] = useStore<PromptInputState, "muse">((state) => state.muse);
  const [parentId] = useStore<PromptInputState, "parentId">(
    (state) => state.parentId,
  );
  const [type] = useStore<PromptInputState, "type">((state) => state.type);

  const handleClick = async () => {
    if (!media || !muse || !text) return;
    const source = museToSource(muse);

    const formData = new FormData();
    formData.append("file", media);

    const uploaded = await uploadMedia(formData);

    if (uploaded === "error") {
      console.error("Error uploading media");
      return;
    }

    const data: SubmitPromptInput = {
      source,
      text,
      media: uploaded,
    };

    if (type === "comment") {
      data["promptId"] = parentId || "";
    } else if (type === "reply") {
      data["commentId"] = parentId || "";
    }

    // Perform the submit action
    //
    const response = await submitPrompt(data, type);

    if (response === "error") {
      console.error("Error submitting prompt");
      return;
    }

    console.log("response:", response);
  };

  return (
    <Button
      primary
      style={{ borderRadius: "5px", width: 100 }}
      onClick={handleClick}
    >
      Share
    </Button>
  );
};

export const MuseSelectionDropdown: FC<Props> = ({
  muses,
  className,
  ...rest
}) => {
  const [muse, set] = useStore<PromptInputState, "muse">((state) => state.muse);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (muses?.length > 0) {
      set({ muse: muses[0] }); // Set the first muse as selected if available
    }
  }, [muses, set]);

  const handleDropdownOptionClick = (muse: Muse) => {
    set({ muse }); // Update selectedMuse on option click
    setIsDropdownOpen(false); // Close the dropdown
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev); // Toggle dropdown visibility
  };

  const loadDropdownOptions = () => {
    return (
      muses &&
      muses.map((muse) => (
        <S.DropdownOption
          key={muse.id}
          onClick={() => handleDropdownOptionClick(muse)} // Set muse and close dropdown
        >
          <S.Avatar
            src={muse.image || ""}
            alt={muse.firstName}
            size={50}
            hoverable
          />
          <S.SourceName>{muse.firstName}</S.SourceName>
        </S.DropdownOption>
      ))
    );
  };

  return (
    <ShouldRender if={muse !== null}>
      <Flex style={{ position: "relative" }}>
        {/* Display the selected muse */}
        <S.Avatar
          src={muse?.image || ""}
          alt={muse?.firstName || ""}
          size={50}
          hoverable
          onClick={toggleDropdown} // Toggle dropdown on avatar click
        />
        <S.DropdownContainer
          className={classNames([
            className,
            isDropdownOpen ? "open" : "closed",
          ])}
        >
          <S.ScrollableContent>{loadDropdownOptions()}</S.ScrollableContent>
        </S.DropdownContainer>
      </Flex>
    </ShouldRender>
  );
};

const PromptRichText = () => {
  const [text, set] = useStore<PromptInputState, "text">((state) => state.text);

  const handleChange = (content: any) => {
    set({ text: JSON.stringify(content) });
  };

  useEffect(() => {}, [text]);

  return <S.RichText height={130} onChange={handleChange} editable />;
};

export const PromptInput: FC<Props> = ({
  className,
  type = "prompt",
  parentId,
  ...rest
}) => {
  const { push } = useRouter();
  const { novelist } = useAuthContext();

  return (
    <StoreProvider<PromptInputState>
      initial={{ ...INITIAL_STATE, parentId, type }}
    >
      <S.PromptInputContainer>
        <Flex style={{ alignItems: "center" }}>
          <MuseSelectionDropdown
            className={className}
            muses={novelist?.muses || []}
          ></MuseSelectionDropdown>
          <PromptRichText />
          <Flex direction="column">
            {/* <IoMdPhotos size={50} style={{ marginTop: "30px" }} /> */}
            <AddMediaButton />
            <SubmitButton />
          </Flex>
        </Flex>
      </S.PromptInputContainer>
    </StoreProvider>
  );
};

export default PromptInput;
