import { ShouldRender } from "@novelist-world/ui";
import { Form } from "radix-ui";
import {
  type FC,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { IoCheckmark } from "react-icons/io5";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { AvatarNew } from "@/components/common/avatar-new";
import { AppAlertDialog } from "@/components/dialog";
import { FilterSearch } from "@/components/filter-search";
import type { PromptSource, SubmitPromptType } from "@/types";
import { usePromptInputState } from "./prompt-input.store";
import * as S from "./styles";

type Props = {
  initialSelection: PromptSource | undefined;
  sources: PromptSource[];
  dropdownSelection: "NOVELIST" | "MUSE" | "ALL";
};

export interface MuseSelectHandle {
  openDialog: () => void;
}

const promptTypeToLabel = (type: SubmitPromptType): string => {
  switch (type) {
    case "prompt":
      return "Post as";
    case "reply":
      return "Reply as";
    case "comment":
      return "Comment as";
    default:
      return "Post as";
  }
};

export const PromptMuseSelect = forwardRef<MuseSelectHandle, Props>(
  (
    { sources, dropdownSelection, initialSelection, ...props },
    forwardedRef,
  ) => {
    const promptType = usePromptInputState("type");
    const [source, setSource] = useState<PromptSource | undefined>(
      initialSelection ?? sources?.[0],
    );
    const [dialogOpen, setDialogOpen] = useState(false);
    const [search, setSearch] = useState("");

    const novelistSource = sources.find((s) => s.sourceType === "NOVELIST");
    const museSources = sources.filter((s) => s.sourceType === "MUSE");

    useEffect(() => {
      setSource((current) => {
        if (current && sources.some((s) => s.sourceId === current.sourceId)) {
          return current;
        }
        return initialSelection ?? sources?.[0];
      });
    }, [initialSelection, sources]);

    const filteredMuses = useMemo(() => {
      const q = search.toLowerCase();
      const list = q
        ? museSources.filter((s) => s.name?.toLowerCase().includes(q))
        : museSources;
      if (!source || source.sourceType !== "MUSE") return list;
      const selected = list.find((s) => s.sourceId === source.sourceId);
      const rest = list.filter((s) => s.sourceId !== source.sourceId);
      return selected ? [selected, ...rest] : list;
    }, [museSources, search, source]);

    const novelistMatchesSearch = useMemo(() => {
      if (!novelistSource) return false;
      if (!search) return true;
      return (
        novelistSource.name?.toLowerCase().includes(search.toLowerCase()) ??
        false
      );
    }, [novelistSource, search]);

    const showNovelist = dropdownSelection !== "MUSE";
    const showMuses = dropdownSelection !== "NOVELIST";

    const handleSelect = useCallback((selected: PromptSource) => {
      setSource(selected);
      setSearch("");
      setDialogOpen(false);
    }, []);

    const handleDialogOpenChange = useCallback((open: boolean) => {
      if (!open) setSearch("");
      setDialogOpen(open);
    }, []);

    const noResults =
      (!showNovelist || !novelistMatchesSearch) &&
      (!showMuses || filteredMuses.length === 0);

    useImperativeHandle(forwardedRef, () => ({
      openDialog: () => setDialogOpen(true),
    }));

    return (
      <S.MuseSelect
        name="muse"
        {...props}
      >
        <Form.Label className="form-label">
          {promptTypeToLabel(promptType)}
        </Form.Label>
        <Form.Control asChild>
          <input
            type="hidden"
            name="muse"
            value={source?.sourceId ?? ""}
            readOnly
          />
        </Form.Control>

        <S.MuseSelectTrigger
          type="button"
          title={source?.name.split(" ")[0] ?? "Select"}
          onClick={() => setDialogOpen(true)}
        >
          <AvatarNew
            src={source?.image ?? null}
            alt={source?.name ?? ""}
            nwImage={source?.avatar}
          />
          <span className="trigger-name">{source?.name.split(" ")[0]}</span>
          <span className="trigger-caret">
            <MdOutlineKeyboardArrowDown size={14} />
          </span>
        </S.MuseSelectTrigger>

        <AppAlertDialog
          heading={promptTypeToLabel(promptType)}
          text=""
          open={dialogOpen}
          onOpenChange={handleDialogOpenChange}
          showConfirm={false}
          closeButtonText="Done"
          body={
            <S.MuseDialogBody>
              <S.MuseDialogSearchWrap>
                <FilterSearch
                  value={search}
                  onChange={setSearch}
                  placeholder="Search…"
                />
              </S.MuseDialogSearchWrap>

              <S.MuseDialogList>
                {/* Novelist row */}
                <ShouldRender
                  if={
                    showNovelist &&
                    novelistMatchesSearch &&
                    Boolean(novelistSource)
                  }
                >
                  <SourceRow
                    source={novelistSource!}
                    isActive={source?.sourceId === novelistSource?.sourceId}
                    onSelect={handleSelect}
                  />
                </ShouldRender>

                {/* Section divider shown only when both sections are visible */}
                <ShouldRender
                  if={
                    showNovelist &&
                    showMuses &&
                    novelistMatchesSearch &&
                    filteredMuses.length > 0
                  }
                >
                  <S.MuseDialogSectionLabel>
                    Characters
                  </S.MuseDialogSectionLabel>
                </ShouldRender>

                {/* Muse rows */}
                <ShouldRender if={showMuses && filteredMuses.length > 0}>
                  {filteredMuses.map((s) => (
                    <SourceRow
                      key={s.sourceId}
                      source={s}
                      isActive={source?.sourceId === s.sourceId}
                      onSelect={handleSelect}
                    />
                  ))}
                </ShouldRender>

                <ShouldRender if={noResults}>
                  <S.MuseDialogEmptyText>
                    {search
                      ? `No results for "${search}".`
                      : "No sources available."}
                  </S.MuseDialogEmptyText>
                </ShouldRender>
              </S.MuseDialogList>
            </S.MuseDialogBody>
          }
        />

        <Form.Message className="form-message" match="valueMissing">
          Please select a muse or yourself as the author
        </Form.Message>
      </S.MuseSelect>
    );
  },
);

const SourceRow: FC<{
  source: PromptSource;
  isActive: boolean;
  onSelect: (source: PromptSource) => void;
}> = ({ source, isActive, onSelect }) => (
  <S.MuseDialogListItem
    type="button"
    $active={isActive}
    onClick={() => onSelect(source)}
  >
    <AvatarNew
      src={source.image ?? null}
      alt={source.name ?? ""}
      nwImage={source.avatar}
    />
    <S.MuseDialogSourceInfo>
      <S.MuseDialogSourceName>{source.name}</S.MuseDialogSourceName>
      <S.MuseDialogTypeBadge $novelist={source.sourceType === "NOVELIST"}>
        {source.sourceType === "NOVELIST" ? "You" : "Character"}
      </S.MuseDialogTypeBadge>
    </S.MuseDialogSourceInfo>
    {isActive && (
      <S.MuseDialogSelectedMark>
        <IoCheckmark size={12} />
      </S.MuseDialogSelectedMark>
    )}
  </S.MuseDialogListItem>
);
