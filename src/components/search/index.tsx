import { FC, useRef, useState } from "react";

import { useForm } from "@/hooks";
import { toggleState } from "@/utils/helpers";
import { Logger } from "@/utils/services";
import classNames from "classnames";
import { BsSearch } from "react-icons/bs";
import { CgSpinner } from "react-icons/cg";
import { IoCloseOutline } from "react-icons/io5";
import { ShouldRender } from "../common";
import * as S from "./styles";

export interface SearchProps {
  placeholder?: string;
  value?: string;
  className?: string;
  types?: string[];
}

interface SearchInput {
  search: string;
}

export const Search: FC<SearchProps> = ({ placeholder, value, types = [] }) => {
  const [expanded, setExpanded] = useState(false);
  const [expandTag, setTagExpanded] = useState(false);
  const [selectedType, setSelectedType] = useState<string>(types?.[0] || "");
  const searchDebounce = 1000;
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleSearch = async ({ search }: SearchInput) => {
    if (!search?.trim()) return;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const { values, update, updateValues, loading, submit } = useForm({
    initialValues: { search: "" },
    onSubmit: handleSearch,
  });

  const handleUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    Logger.log("handle update: ", e.target.name, e.target.value);
    update(e);
    if (searchTimeoutRef.current) {
      Logger.log("clearing search timeout");
      clearTimeout(searchTimeoutRef.current);
    }
    if (loading || !e.target.value?.trim()) return;
    searchTimeoutRef.current = setTimeout(() => {
      if (e.target.value?.trim()) (() => submit())();
    }, searchDebounce);
  };

  const handleButtonClick = () => {
    Logger.log("Search handleButtonClick", expanded);
    if (expanded) {
      updateValues({ search: "" });
    }
    toggleState(setExpanded)();
  };

  return (
    <S.Wrapper>
      <S.Container
        tabIndex={0}
        className={classNames({ expanded, ["type-select"]: types.length })}
      >
        {types.length && (
          <S.TypeSelect
            onClick={toggleState(setTagExpanded)}
            className={classNames({ expanded: expandTag })}
          >
            {selectedType}

            <S.TypeSelectOptions>
              {[...types]
                .sort((a, b) => (a === selectedType ? -1 : 1))
                .map((type) => (
                  <S.TypeSelectOption
                    key={type}
                    onClick={() => setSelectedType(type)}
                  >
                    {type}
                  </S.TypeSelectOption>
                ))}
            </S.TypeSelectOptions>
          </S.TypeSelect>
        )}
        <S.Input
          type="text"
          name="search"
          placeholder={placeholder}
          onChange={handleUpdate}
          value={values.search}
        />
        <S.Dropdown />
        <S.Button
          onClick={handleButtonClick}
          className={classNames({ loading })}
        >
          <ShouldRender if={!loading && expanded}>
            <IoCloseOutline />
          </ShouldRender>
          <ShouldRender if={!loading && !expanded}>
            <BsSearch />
          </ShouldRender>
          <ShouldRender if={loading}>
            <CgSpinner className={classNames(["loading-icon", { loading }])} />
          </ShouldRender>
        </S.Button>
      </S.Container>
    </S.Wrapper>
  );
};
