"use client";

import type { MuseFacts } from "@nw/types/headcanon";
import type { FC, ReactNode } from "react";
import type { CatalogLookups } from "./catalog";
import * as S from "./styles";

type Props = {
  facts: MuseFacts;
  lookups: CatalogLookups;
};

/**
 * The quick facts as read: each list as a row of short chips, strengths and
 * flaws side by side, and the this-or-that answers as one row of the sides
 * picked. Empty lists are left out (the server already drops them for
 * visitors; the owner sees their empty blocks in the editor instead).
 */
export const QuickFacts: FC<Props> = ({ facts, lookups }) => {
  const lists = facts.blocks.filter(
    (b) => b.block !== "THIS_OR_THAT" && b.items.length > 0,
  );
  const strengths = lists.find((b) => b.block === "STRENGTHS");
  const flaws = lists.find((b) => b.block === "FLAWS");
  const picks = facts.thisOrThat
    .map((p) => {
      const pair = lookups.pair(p.pairKey);
      return pair ? (p.pick === "A" ? pair.a : pair.b) : null;
    })
    .filter((label): label is string => Boolean(label));
  const picksOn = facts.blocks.some((b) => b.block === "THIS_OR_THAT");

  const items = (block: { block: string; items: string[] }) => (
    <S.FactGroup key={block.block}>
      <S.FactName>{lookups.blockLabel(block.block)}</S.FactName>
      <S.Row>
        {block.items.map((item) => (
          <S.FactItem key={item}>{item}</S.FactItem>
        ))}
      </S.Row>
    </S.FactGroup>
  );

  // Strengths and flaws render together, where the first of them sits.
  const rendered: ReactNode[] = [];
  let pairedDone = false;
  for (const block of facts.blocks) {
    if (block.block === "THIS_OR_THAT") {
      if (picksOn && picks.length > 0) {
        rendered.push(
          <S.FactGroup key="THIS_OR_THAT">
            <S.FactName>{lookups.blockLabel("THIS_OR_THAT")}</S.FactName>
            <S.Row>
              {picks.map((label) => (
                <S.Chip as="span" key={label} $soft>
                  {label}
                </S.Chip>
              ))}
            </S.Row>
          </S.FactGroup>,
        );
      }
      continue;
    }
    if (block.items.length === 0) continue;
    if (block.block === "STRENGTHS" || block.block === "FLAWS") {
      if (pairedDone) continue;
      pairedDone = true;
      if (strengths && flaws) {
        rendered.push(
          <S.FactColumns key="STRENGTHS_FLAWS">
            {items(strengths)}
            {items(flaws)}
          </S.FactColumns>,
        );
        continue;
      }
    }
    rendered.push(items(block));
  }

  if (rendered.length === 0) return null;
  return <>{rendered}</>;
};
