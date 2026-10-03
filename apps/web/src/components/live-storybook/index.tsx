"use client";

import type { FC } from "react";
import { BsCalendar2Date } from "react-icons/bs";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { TfiLocationPin } from "react-icons/tfi";
import * as S from "./styles";

/* ─────────────────────────────────────────────────────────────────────────────
   A compact, static preview of reading a storyboard in book-view. It reuses the
   real reader's paper tokens (see rp/story/event/[slug]): a two-page spread with
   a chapter title page on the left and narration + embedded dialogue bubbles on
   the right, framed by a soft spine, fore-edge page blocks, and page-turn
   chrome. Purely presentational — the controls are decorative.
   ──────────────────────────────────────────────────────────────────────────── */

const HERO = { name: "Seraphine", img: "/images/Saraphine.png" };
const FOIL = { name: "Dorian", img: "/images/Dorian.png" };

export const LiveStorybook: FC = () => (
  <S.BookStage aria-label="Reading a storyboard in book view">
    <S.Spread>
      {/* ── Left page — title ─────────────────────────────────────────── */}
      <S.Page>
        <S.TitlePage>
          <S.CoverFrame />
          <S.EyebrowRule>Chapter Three</S.EyebrowRule>
          <S.EventTitle>The Ember Court</S.EventTitle>
          <S.MetaRow>
            <span className="meta">
              <BsCalendar2Date size={12} />
              The night of the long storm
            </span>
            <span className="meta">
              <TfiLocationPin size={12} />
              The Glass Cathedral
            </span>
          </S.MetaRow>
        </S.TitlePage>
      </S.Page>

      {/* ── Right page — narration + dialogue ─────────────────────────── */}
      <S.Page>
        <S.EyebrowContinued>The Bargain</S.EyebrowContinued>
        <S.Asterism>
          <span className="glyph">✦</span>
        </S.Asterism>
        <S.Overture>
          Rain hammered the cathedral of glass until the whole nave seemed to
          breathe. Seraphine stepped from the dark, blade low, and for the first
          time in a year Dorian did not run.
        </S.Overture>

        <S.Dialog>
          <S.DialogAvatar src={HERO.img} alt={HERO.name} />
          <S.DialogContent>
            <S.DialogSender>{HERO.name}</S.DialogSender>
            <S.DialogBody>Give me one reason. I dare you.</S.DialogBody>
          </S.DialogContent>
        </S.Dialog>

        <S.Dialog $right>
          <S.DialogAvatar src={FOIL.img} alt={FOIL.name} />
          <S.DialogContent $right>
            <S.DialogSender $right>{FOIL.name}</S.DialogSender>
            <S.DialogBody $right>Well — what&rsquo;s stopping you?</S.DialogBody>
          </S.DialogContent>
        </S.Dialog>

        <S.ByLine>
          <span className="author">Vesper</span>
          <span className="dot">·</span>
          <span>just now</span>
        </S.ByLine>
      </S.Page>

      {/* ── Book chrome ───────────────────────────────────────────────── */}
      <S.Spine />
      <S.PageStack $side="left" />
      <S.PageStack $side="right" />
      <S.PageEdgeButton $side="left" aria-label="Previous page">
        <IoChevronBack />
      </S.PageEdgeButton>
      <S.PageEdgeButton $side="right" aria-label="Next page">
        <IoChevronForward />
      </S.PageEdgeButton>
    </S.Spread>

    <S.BookFooter>
      <S.PagerButton aria-label="Previous page">
        <IoChevronBack />
      </S.PagerButton>
      <S.PageIndicator>Pages 1–2 of 8</S.PageIndicator>
      <S.PagerButton aria-label="Next page">
        <IoChevronForward />
      </S.PagerButton>
    </S.BookFooter>
  </S.BookStage>
);

export default LiveStorybook;
