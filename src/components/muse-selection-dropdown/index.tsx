"use client";

import { FC, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as S from "./styles";
import { ShouldRender } from "../common";
import { Flex } from "@novelist-world/ui";
import { Muse } from "@/types";
import classNames from "classnames";

type Props = React.HTMLProps<HTMLDivElement> & {
  muses: Muse[];
};

export const MuseSelectionDropdown: FC<Props> = ({
  muses,
  className,
  ...rest
}) => {
  const { push } = useRouter();
  const [selectedMuse, setSelectedMuse] = useState<Muse | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (muses?.length > 0) {
      setSelectedMuse(muses[0]); // Set the first muse as selected if available
    }
  }, [muses]);

  const handleDropdownOptionClick = (muse: Muse) => {
    setSelectedMuse(muse); // Update selectedMuse on option click
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
    <ShouldRender if={selectedMuse !== null}>
      <Flex style={{ position: "relative" }}>
        {/* Display the selected muse */}
        <S.Avatar
          src={selectedMuse?.image || ""}
          alt={selectedMuse?.firstName || ""}
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

export default MuseSelectionDropdown;
