"use client";
import { searchAction } from "@/app/rp/novelists/actions";
import { useForm } from "@/hooks";
import { SearchResult } from "@/types/common";
import { toggleState } from "@/utils/helpers";
import { Logger } from "@/utils/services";
import classNames from "classnames";
import { FC, useEffect, useRef, useState } from "react";
import { BsSearch } from "react-icons/bs";
import { CgSpinner } from "react-icons/cg";
import { IoCloseOutline } from "react-icons/io5";
import { PiSmileyThin } from "react-icons/pi";
import { ShouldRender } from "../common";
import * as S from "./styles";

export interface SearchProps {
  placeholder?: string;
  className?: string;
  types?: string[];
  renderDropdownItem: (result: SearchResult, close: () => void) => JSX.Element;
}

interface SearchInput {
  search: string;
}

export const Search: FC<SearchProps> = ({
  placeholder,
  types = [],
  renderDropdownItem,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [expandTag, setTagExpanded] = useState(false);
  const [selectedType, setSelectedType] = useState<string>(types?.[0] || "");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [noResults, setNoResults] = useState(false);
  const searchDebounce = 1000;
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = async ({ search }: SearchInput) => {
    if (!search?.trim()) return;
    console.log("handleSearch", search, selectedType);
    const results = await searchAction(search, selectedType);
    Logger.log("Search results: ", results);
    if (results && !("message" in results)) {
      setSearchResults(results);
      if (!results.length) setNoResults(true);
      else setNoResults(false);
    }
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
    if (!e.target.value?.trim()) {
      setNoResults(false);
    }

    if (loading || !e.target.value?.trim()) return;
    searchTimeoutRef.current = setTimeout(() => {
      if (e.target.value?.trim()) submit({ search: e.target.value?.trim() });
    }, searchDebounce);
  };

  const handleButtonClick = () => {
    Logger.log("Search handleButtonClick", expanded);

    updateValues({ search: "" });
    setNoResults(false);
    if (expanded && searchResults.length) {
      setSearchResults([]);
    } else {
      toggleState(setExpanded)();
    }
  };

  const handleTypeSelect = (type: string) => () => {
    setSelectedType(type);
  };

  useEffect(() => {
    if (values.search?.trim()) {
      submit();
    }
  }, [selectedType]);

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
              {[selectedType]
                .concat(types.filter((type) => type !== selectedType))
                .filter(Boolean)
                .map((type) => (
                  <S.TypeSelectOption
                    key={type}
                    onClick={handleTypeSelect(type)}
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
        <S.Dropdown
          className={classNames({
            empty: noResults,
            ["has-result"]: searchResults?.length,
          })}
        >
          <ShouldRender if={!noResults}>
            {searchResults.map((result) => (
              <S.DropdownItem key={result.id || result.username}>
                {renderDropdownItem(result, handleButtonClick)}
              </S.DropdownItem>
            ))}
          </ShouldRender>
          <ShouldRender if={noResults}>
            <S.EmptyDropdown>
              No results found
              <PiSmileyThin />
            </S.EmptyDropdown>
          </ShouldRender>
        </S.Dropdown>
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
