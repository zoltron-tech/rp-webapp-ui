"use client";

import { Separator } from "radix-ui";
import { BsArrowLeft, BsLightbulb } from "react-icons/bs";
import styled from "styled-components";
import { toVerseOptions } from "@/components/headcanons/headcanon-editor-sheet";
import { HeadcanonsPanel } from "@/components/headcanons/headcanons-panel";
import { useGlobalState } from "@/context/store/stores";
import { useMuseState } from "./muse.store";
import * as S from "./styled";

type Props = {
  onBack: () => void;
};

/**
 * The Headcanons hub in Edit muse: traits, quick facts and headcanon cards,
 * each saved on its own as it is changed — there is no page-level Save here.
 */
export function HeadcanonsSection({ onBack }: Props) {
  const id = useMuseState("id");
  const firstName = useMuseState("firstName");
  const lastName = useMuseState("lastName");
  const accent = useMuseState("accent");
  const useAccent = useMuseState("useAccent");
  const verses = useMuseState("verses");
  const novelist = useGlobalState("novelist");
  const user = useGlobalState("user");

  const museName =
    [firstName, lastName].filter(Boolean).join(" ") || "your character";
  const verseOptions = toVerseOptions(verses);

  return (
    <>
      <S.TopBar>
        <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
          <S.BackButton type="button" onClick={onBack} aria-label="Back">
            <BsArrowLeft />
          </S.BackButton>
          <S.FormHeading>
            <BsLightbulb />
            <h1>Headcanons</h1>
          </S.FormHeading>
        </div>
      </S.TopBar>

      <Separator.Root className="separator" orientation="horizontal" />

      <Intro>
        Traits, quick facts and the little truths canon never told. Every change
        saves on its own.
      </Intro>

      {id ? (
        <HeadcanonsPanel
          museId={id}
          museName={museName}
          tone="page"
          accent={useAccent ? accent : null}
          verses={verseOptions}
          ownerNovelistId={novelist?.id ?? null}
          ownerUsername={user?.username ?? null}
        />
      ) : (
        <Intro>Save this character first to add headcanons.</Intro>
      )}
    </>
  );
}

const Intro = styled.p`
  margin: 16px 0 14px;
  font-size: var(--font-size-small);
  color: var(--text-secondary);
`;
