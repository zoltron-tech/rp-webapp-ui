"use client";

import type { StoryNotePollOption } from "@nw/types";
import type { FC } from "react";
import { LuCheck } from "react-icons/lu";
import * as S from "./styles";

/** The ballot in the order its author arranged it. */
export const inBallotOrder = (options: StoryNotePollOption[] | undefined) =>
  [...(options ?? [])].sort((a, b) => a.ordinal - b.ordinal);

/** How many co-authors have answered, worded for a person. */
export const votesLabel = (total: number) =>
  total === 1 ? "1 vote" : `${total} votes`;

type Props = {
  options: StoryNotePollOption[];
  /** Co-authors who have answered — one apiece, so this is also a headcount. */
  totalVotes: number;
  /** The reading co-author's own choice, marked and outlined. */
  myVoteOptionId?: string | null;
  /**
   * Omitted where the ballot is only being shown: on the card, which is itself
   * one big button and cannot nest one, and on a settled poll.
   */
  onVote?: (optionId: string) => void;
  /** Held while a vote is in flight, so a double tap can't race itself. */
  pending?: boolean;
  /** The card has room for a few rows, not a long ballot. */
  limit?: number;
  /** Voter chips are the sheet's business; the card has no room for them. */
  showVoters?: boolean;
  /**
   * Renders every wrapper as a span. The card's ballot sits inside the button
   * that opens the note, and a button may only contain phrasing content — a
   * div in there is invalid markup the browser will reparent.
   */
  inline?: boolean;
};

/**
 * A poll's choices, each filled to the share of the vote it holds.
 *
 * The bar is never the only carrier of the number — the count sits beside it in
 * text, because a length alone does not read for everyone.
 */
export const Ballot: FC<Props> = ({
  options,
  totalVotes,
  myVoteOptionId,
  onVote,
  pending,
  limit,
  showVoters,
  inline,
}) => {
  const ordered = inBallotOrder(options);
  const shown = limit ? ordered.slice(0, limit) : ordered;
  const hidden = ordered.length - shown.length;

  return (
    <S.Ballot as={inline ? "span" : undefined}>
      {shown.map((option) => {
        const mine = Boolean(option.id) && option.id === myVoteOptionId;
        const share =
          totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0;
        const votable = Boolean(onVote && option.id);

        return (
          <S.Choice
            key={option.id ?? option.label}
            // The card's row sits inside the button that opens the note, and a
            // button cannot nest inside a button.
            as={votable ? "button" : "span"}
            type={votable ? "button" : undefined}
            $mine={mine}
            $locked={!votable}
            disabled={votable ? pending : undefined}
            aria-pressed={votable ? mine : undefined}
            aria-label={
              votable
                ? `${option.label} — ${votesLabel(option.voteCount)}${
                    mine ? ", your vote" : ""
                  }`
                : undefined
            }
            onClick={
              votable && option.id
                ? () => onVote?.(option.id as string)
                : undefined
            }
          >
            <S.ChoiceBar $share={share} $mine={mine} aria-hidden />
            {mine && (
              <S.ChoiceMark aria-hidden>
                <LuCheck size={14} />
              </S.ChoiceMark>
            )}
            <S.ChoiceLabel>{option.label}</S.ChoiceLabel>

            {showVoters && option.voters.length > 0 && (
              <S.Voters aria-hidden>
                {option.voters.slice(0, 4).map((voter) =>
                  voter.image ? (
                    <S.VoterAvatar
                      key={voter.id}
                      src={voter.image}
                      alt=""
                      title={voter.name ?? ""}
                    />
                  ) : (
                    <S.VoterInitial key={voter.id} title={voter.name ?? ""}>
                      {(voter.name ?? "?").charAt(0).toUpperCase()}
                    </S.VoterInitial>
                  ),
                )}
              </S.Voters>
            )}

            <S.ChoiceCount>{option.voteCount}</S.ChoiceCount>
          </S.Choice>
        );
      })}

      {hidden > 0 && (
        <S.BallotFoot as={inline ? "span" : undefined}>{`+${hidden} more ${
          hidden === 1 ? "choice" : "choices"
        }`}</S.BallotFoot>
      )}
    </S.Ballot>
  );
};
