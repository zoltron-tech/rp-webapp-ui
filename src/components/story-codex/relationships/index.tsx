"use client";

import type { CodexRelationship, CodexTone, StoryPerson } from "@nw/types";
import { type FC, useMemo, useState } from "react";
import { GrEdit } from "react-icons/gr";
import { IoMdAdd } from "react-icons/io";
import { LuNetwork, LuTable2 } from "react-icons/lu";
import { museAvatarUrl } from "@/components/rich-text-editor-input/dialog-embed";
import { useGlobalState } from "@/context/store/stores";
import { RelationshipMesh } from "./mesh";
import { RelationshipSheet } from "./relationship-sheet";
import * as S from "./styles";
import { buildTonePalette, resolveTone, strengthWidth } from "./tones";

type Props = {
  /** The story's derived cast — the only characters a relationship can join. */
  /** Every character in the story, from both pools. */
  cast: StoryPerson[];
  relationships: CodexRelationship[];
  /** Tones this story added on top of the built-in three. */
  tones: CodexTone[];
  canEdit: boolean;
  onSave: (relationship: CodexRelationship) => void;
  onDelete: (relationship: CodexRelationship) => void;
  /** Creating a tone happens inside the relationship sheet — an author reaches
   *  for a new colour while recording the relationship that needs it. */
  onSaveTone: (tone: CodexTone) => Promise<CodexTone | null>;
  onDeleteTone: (tone: CodexTone) => void;
};

type Mode = "mesh" | "table";

/**
 * The codex's Relationships section: who these characters are to each other.
 *
 * Two views of the same data, both always available — the mesh for the shape
 * of it, the table because a graph is not readable by everyone and every
 * chart owes a text alternative.
 */
export const RelationshipsSection: FC<Props> = ({
  cast,
  relationships,
  tones,
  canEdit,
  onSave,
  onDelete,
  onSaveTone,
  onDeleteTone,
}) => {
  const theme = useGlobalState("theme");

  const [mode, setMode] = useState<Mode>("mesh");
  /** Keyed by tone key — a built-in name, or a custom tone id. */
  const [hiddenTones, setHiddenTones] = useState<Set<string>>(new Set());
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<{
    open: boolean;
    relationship: CodexRelationship | null;
  }>({ open: false, relationship: null });

  const namesById = useMemo(
    () => new Map(cast.map((member) => [member.id, member.name])),
    [cast],
  );

  /** The built-in three first, always, then whatever this story added. */
  const palette = useMemo(() => buildTonePalette(tones, theme), [tones, theme]);

  /** Only relationships whose characters are both still in the cast. */
  const drawable = useMemo(
    () =>
      relationships.filter(
        (relationship) =>
          namesById.has(relationship.fromId) &&
          namesById.has(relationship.toId),
      ),
    [relationships, namesById],
  );

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const relationship of drawable) {
      // Counted against the tone actually drawn, so an edge whose custom tone
      // was retired is tallied under the built-in it fell back to.
      const key = resolveTone(relationship, palette, theme).key;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [drawable, palette, theme]);

  const focused = focusedId ? namesById.get(focusedId) : null;
  const focusedEdges = useMemo(
    () =>
      focusedId
        ? drawable.filter(
            (relationship) =>
              relationship.fromId === focusedId ||
              relationship.toId === focusedId,
          )
        : [],
    [drawable, focusedId],
  );

  const toggleTone = (key: string) =>
    setHiddenTones((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  if (cast.length < 2) {
    return (
      <S.Root>
        <S.Empty>
          Relationships are drawn between this story's cast, and a muse joins
          the cast as soon as one of its dialogs appears in a passage. Write two
          characters into the story and their mesh starts here.
        </S.Empty>
      </S.Root>
    );
  }

  return (
    <S.Root data-nw="relationships">
      <S.HeaderRow>
        <S.ModeToggle role="tablist" aria-label="Relationship view">
          <S.ModeButton
            type="button"
            role="tab"
            aria-selected={mode === "mesh"}
            $active={mode === "mesh"}
            onClick={() => setMode("mesh")}
          >
            <LuNetwork size={14} />
            Mesh
          </S.ModeButton>
          <S.ModeButton
            type="button"
            role="tab"
            aria-selected={mode === "table"}
            $active={mode === "table"}
            onClick={() => setMode("table")}
          >
            <LuTable2 size={14} />
            Table
          </S.ModeButton>
        </S.ModeToggle>

        <S.Spacer />

        {canEdit && (
          <S.ModeButton
            type="button"
            $active
            onClick={() => setSheet({ open: true, relationship: null })}
          >
            <IoMdAdd size={15} />
            New relationship
          </S.ModeButton>
        )}
      </S.HeaderRow>

      {/* Always present — identity is never carried by colour alone, and each
          tone shows its stroke pattern next to its hue. */}
      <S.Legend data-nw="mesh-legend">
        {palette.map((tone) => {
          const hidden = hiddenTones.has(tone.key);
          return (
            <S.LegendItem
              key={tone.key}
              type="button"
              $muted={hidden}
              aria-pressed={!hidden}
              title={`${
                tone.description ?? "A tone this story defined"
              } — click to ${hidden ? "show" : "hide"}`}
              onClick={() => toggleTone(tone.key)}
            >
              <S.LegendSwatch viewBox="0 0 26 10" aria-hidden>
                <line
                  x1="1"
                  y1="5"
                  x2="25"
                  y2="5"
                  stroke={tone.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={tone.dash}
                />
              </S.LegendSwatch>
              {tone.label}
              <span>({counts.get(tone.key) ?? 0})</span>
            </S.LegendItem>
          );
        })}
      </S.Legend>

      {drawable.length === 0 ? (
        <S.Empty>
          {canEdit
            ? "No relationships yet. Add the first one — who owes whom, who can't stand whom."
            : "This story hasn't mapped its characters' relationships yet."}
        </S.Empty>
      ) : mode === "mesh" ? (
        <>
          <RelationshipMesh
            cast={cast}
            relationships={drawable}
            palette={palette}
            hiddenTones={hiddenTones}
            focusedId={focusedId}
            onFocus={setFocusedId}
            onOpenRelationship={(relationship) =>
              setSheet({ open: true, relationship })
            }
          />
          <S.Hint>
            Hover a thread to read it; tap a character to follow only theirs,
            tap again to clear.
            {canEdit && " Click a thread to edit it."}
          </S.Hint>
        </>
      ) : (
        <S.TableWrap>
          <S.Table>
            <thead>
              <tr>
                <th scope="col">Character</th>
                <th scope="col" />
                <th scope="col">Character</th>
                <th scope="col">Relationship</th>
                <th scope="col">Tone</th>
                <th scope="col">Weight</th>
                {canEdit && <th scope="col" aria-label="Edit" />}
              </tr>
            </thead>
            <tbody>
              {drawable.map((relationship) => {
                const tone = resolveTone(relationship, palette, theme);
                return (
                  <tr key={relationship.id}>
                    <td>{namesById.get(relationship.fromId)}</td>
                    <td
                      aria-label={relationship.isDirected ? "toward" : "with"}
                    >
                      {relationship.isDirected ? "→" : "·"}
                    </td>
                    <td>{namesById.get(relationship.toId)}</td>
                    <td>{relationship.label}</td>
                    <td>
                      <S.ToneCell>
                        <span
                          className="swatch"
                          style={{ background: tone.color }}
                        />
                        {tone.label}
                      </S.ToneCell>
                    </td>
                    <td>
                      {
                        ["Passing", "Real", "Defining"][
                          relationship.strength - 1
                        ]
                      }
                    </td>
                    {canEdit && (
                      <td>
                        <S.RowAction
                          type="button"
                          aria-label={`Edit ${relationship.label}`}
                          onClick={() => setSheet({ open: true, relationship })}
                        >
                          <GrEdit size={12} />
                        </S.RowAction>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </S.Table>
        </S.TableWrap>
      )}

      {/* What the focused character is tangled in — the mesh's detail panel. */}
      {mode === "mesh" && focused && focusedEdges.length > 0 && (
        <S.Detail>
          <S.DetailHead>
            <S.DetailAvatar
              src={
                cast.find((member) => member.id === focusedId)?.image ||
                museAvatarUrl(focusedId ?? "") ||
                undefined
              }
              alt=""
            />
            <S.DetailName>{focused}</S.DetailName>
            <S.ModeButton type="button" onClick={() => setFocusedId(null)}>
              Clear
            </S.ModeButton>
          </S.DetailHead>

          {focusedEdges.map((relationship) => {
            const other =
              relationship.fromId === focusedId
                ? relationship.toId
                : relationship.fromId;
            const tone = resolveTone(relationship, palette, theme);
            return (
              <S.DetailRow
                key={relationship.id}
                type="button"
                disabled={!canEdit}
                onClick={() =>
                  canEdit && setSheet({ open: true, relationship })
                }
              >
                <span
                  className="stroke"
                  style={{
                    background: tone.color,
                    height: strengthWidth(relationship.strength),
                  }}
                  aria-hidden
                />
                {relationship.label}
                <span className="who">
                  {relationship.isDirected && relationship.fromId === focusedId
                    ? "→ "
                    : relationship.isDirected
                      ? "← "
                      : "· "}
                  {namesById.get(other)}
                </span>
                <S.Spacer />
                <span className="who">{tone.label}</span>
              </S.DetailRow>
            );
          })}
        </S.Detail>
      )}

      <RelationshipSheet
        open={sheet.open}
        relationship={sheet.relationship}
        cast={cast}
        palette={palette}
        tones={tones}
        canEdit={canEdit}
        onSaveTone={onSaveTone}
        onDeleteTone={onDeleteTone}
        onClose={() => setSheet({ open: false, relationship: null })}
        onSave={(relationship) => {
          onSave(relationship);
          setSheet({ open: false, relationship: null });
        }}
        onDelete={(relationship) => {
          onDelete(relationship);
          setSheet({ open: false, relationship: null });
        }}
      />
    </S.Root>
  );
};
