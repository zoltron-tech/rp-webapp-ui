"use client";

import { useId } from "react";
import * as S from "./styled";

export type FilterOption = {
  id: string;
  label: string;
};

type FilterSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  filters?: FilterOption[];
  activeFilters?: string[];
  onFilterChange?: (values: string[]) => void;
  className?: string;
};

export function FilterSearch({
  value,
  onChange,
  placeholder = "Search...",
  filters,
  activeFilters = [],
  onFilterChange,
  className,
}: FilterSearchProps) {
  const inputId = useId();
  const hasFilters = filters && filters.length > 0;

  return (
    <S.Wrapper className={className}>
      <S.InputRow>
        <S.SearchIcon aria-hidden>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </S.SearchIcon>
        <S.Input
          id={inputId}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          autoComplete="off"
          spellCheck={false}
        />
        {value && (
          <S.ClearButton
            type="button"
            aria-label="Clear search"
            onClick={() => onChange("")}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </S.ClearButton>
        )}
      </S.InputRow>

      {hasFilters && onFilterChange && (
        <S.FiltersRow>
          <S.FiltersLabel>Show:</S.FiltersLabel>
          <S.FilterChips
            type="multiple"
            value={activeFilters}
            onValueChange={onFilterChange}
            aria-label="Filter options"
          >
            {filters.map((filter) => (
              <S.FilterChip
                key={filter.id}
                value={filter.id}
                aria-label={filter.label}
              >
                {activeFilters.includes(filter.id) && (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {filter.label}
              </S.FilterChip>
            ))}
          </S.FilterChips>
        </S.FiltersRow>
      )}
    </S.Wrapper>
  );
}
