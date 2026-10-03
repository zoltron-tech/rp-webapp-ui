"use client";

import { type FC, useMemo, useRef } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import { GrEdit } from "react-icons/gr";
import { IoMdAdd } from "react-icons/io";
import { IoCheckmark, IoClose } from "react-icons/io5";
import { LuNetwork, LuSettings2, LuUsers } from "react-icons/lu";
import { RxDragHandleDots2 } from "react-icons/rx";
import * as F from "@/components/common/responsive-sheet/styles";
import { CODEX_COLORS, resolveCodexIcon } from "@/components/story-codex/icons";
import { RelationshipMesh } from "@/components/story-codex/relationships/mesh";
import * as R from "@/components/story-codex/relationships/styles";
import {
  buildTonePalette,
  resolveTone,
} from "@/components/story-codex/relationships/tones";
import * as C from "@/components/story-codex/styles";
import {
  VIEW_META,
  WORKSPACE_VIEWS,
  type WorkspaceView,
} from "@/components/storyboard-workspace/views";
import {
  mark,
  ring,
  type StageMarks,
  StagePointer,
  useStageFlow,
  useStageMarks,
} from "@/components/user-guide-dialog/stage-motion";
import { useGlobalState } from "@/context/store/stores";
import {
  MOCK_CAST,
  MOCK_CATEGORIES,
  MOCK_CHAPTERS,
  MOCK_CHARACTERS,
  MOCK_ENTRIES,
  MOCK_ENTRY_COUNTS,
  MOCK_GROUPS,
  MOCK_PEOPLE,
  MOCK_RELATIONSHIPS,
  MOCK_TONES,
} from "./mock-data";
import * as G from "./stage-styles";

/**
 * The storyboard guide's stages.
 *
 * Each one is the real screen wired to sample data — the codex's own tabs,
 * cards and chips, the real relationship mesh, the real sheet chrome — and each
 * plays itself: a pointer travels the mock, rings whatever the copy beside it
 * is talking about, and works the controls, so a step reads as somebody using
 * the screen rather than as a picture of it.
 *
 * The flow stops the moment the reader touches the stage. Nothing fetches and
 * nothing saves.
 */

/** The Characters tab, which is the cast rather than a category. */
const CAST_TAB = "cast";
/** The Relationships tab, which is the mesh. */
const MESH_TAB = "mesh";

// ── The workspace: rail on desktop, tab bar on a phone ─────────────────────

const ViewPreview: FC<{ view: WorkspaceView }> = ({ view }) => {
  const meta = VIEW_META[view];
  const Icon = meta.icon;

  if (view === "chapters") {
    return (
      <>
        <G.CanvasHead>
          <Icon size={13} />
          Chapters
        </G.CanvasHead>
        {MOCK_CHAPTERS.map((chapter, position) => (
          <G.ChapterRow key={chapter.id}>
            <G.ChapterOrdinal>{position + 1}</G.ChapterOrdinal>
            <G.ChapterName>{chapter.name}</G.ChapterName>
          </G.ChapterRow>
        ))}
      </>
    );
  }

  if (view === "codex") {
    return (
      <>
        <G.CanvasHead>
          <Icon size={13} />
          Codex
        </G.CanvasHead>
        <C.TabScroller>
          <C.TabRow>
            <C.Tab type="button" $active>
              <LuUsers size={13} />
              Characters
              <span className="count">
                {MOCK_CAST.length + MOCK_CHARACTERS.length}
              </span>
            </C.Tab>
            <C.Tab type="button">
              <LuNetwork size={13} />
              Relationships
            </C.Tab>
            {MOCK_CATEGORIES.slice(0, 2).map((category) => {
              const CategoryIcon = resolveCodexIcon(category.icon);
              return (
                <C.Tab key={category.id} type="button">
                  <CategoryIcon size={13} />
                  {category.name}
                </C.Tab>
              );
            })}
          </C.TabRow>
        </C.TabScroller>
        <G.CanvasNote>{meta.description}.</G.CanvasNote>
      </>
    );
  }

  return (
    <>
      <G.CanvasHead>
        <Icon size={13} />
        {meta.label}
      </G.CanvasHead>
      <G.CanvasNote>{meta.description}.</G.CanvasNote>
    </>
  );
};

/**
 * The workspace frame: every view of a storyboard, one tap apart.
 *
 * It navigates itself through `flow`, view by view, so the point being made —
 * that these are tabs over one page, not pages — is made by moving rather than
 * by being asserted. Tapping a view takes it over.
 */
export const WorkspaceStage: FC<{ flow?: WorkspaceView[] }> = ({
  flow = WORKSPACE_VIEWS,
}) => {
  const marks = useStageMarks();
  const root = useRef<HTMLDivElement>(null);
  const { aim, beat } = useStageFlow(flow.length, 2400);

  /* The view changes when the pointer lands on its button, not when it sets
     off for it — `beat` trails `aim` by exactly the travel. */
  const view = flow[beat] ?? flow[0];
  const at = `view:${flow[aim] ?? flow[0]}`;
  const ringed = `view:${view}`;

  return (
    <G.Flow ref={root}>
      <G.Workspace>
        <G.Rail aria-label="Storyboard views (sample)">
          {WORKSPACE_VIEWS.map((candidate) => {
            const meta = VIEW_META[candidate];
            const Icon = meta.icon;
            return (
              <G.RailButton
                key={candidate}
                ref={mark(marks, `view:${candidate}`)}
                className={ring(ringed === `view:${candidate}`)}
                type="button"
                $active={view === candidate}
                title={meta.description}
              >
                <Icon size={16} />
                {meta.label}
              </G.RailButton>
            );
          })}
        </G.Rail>

        <G.Canvas>
          <ViewPreview view={view} />
        </G.Canvas>

        <G.TabBar aria-label="Storyboard views (sample)">
          {WORKSPACE_VIEWS.map((candidate) => {
            const meta = VIEW_META[candidate];
            const Icon = meta.icon;
            return (
              <G.TabButton
                key={candidate}
                ref={mark(marks, `view:${candidate}`)}
                className={ring(ringed === `view:${candidate}`)}
                type="button"
                $active={view === candidate}
                aria-label={meta.description}
              >
                <Icon size={17} />
                <span>{meta.label}</span>
              </G.TabButton>
            );
          })}
        </G.TabBar>
      </G.Workspace>

      <StagePointer rootRef={root} marks={marks} at={at} tapKey={beat} />
    </G.Flow>
  );
};

// ── The codex ──────────────────────────────────────────────────────────────

type TabProps = {
  marks: StageMarks;
  /** What the landed beat is about — the tab's own rings follow this. */
  ringed: string | null;
};

const CastTab: FC<TabProps> = ({ marks, ringed }) => (
  <>
    <C.PoolLabel>The cast</C.PoolLabel>
    <C.CastRow
      ref={mark(marks, "pool:cast")}
      className={ring(ringed === "pool:cast")}
    >
      {MOCK_CAST.map((member) => (
        <C.CastChip key={member.id} type="button" title={member.name}>
          <C.CastAvatar src={member.image ?? ""} alt="" />
          {member.name}
        </C.CastChip>
      ))}
    </C.CastRow>
    <C.Note>
      These are muses — they join the cast on their own, the moment one of their
      dialogs appears in a passage, and each is edited from its own muse page.
    </C.Note>

    <C.PoolLabel>This story&rsquo;s characters</C.PoolLabel>
    <C.CastRow
      ref={mark(marks, "pool:characters")}
      className={ring(ringed === "pool:characters")}
    >
      {MOCK_CHARACTERS.map((character) => {
        const name =
          `${character.firstName} ${character.lastName ?? ""}`.trim();
        return (
          <C.CharacterChip key={character.id} type="button" title={name}>
            <C.CastAvatar src={character.image ?? ""} alt="" />
            {name}
          </C.CharacterChip>
        );
      })}
      <C.CharacterChip
        ref={mark(marks, "chip:new-character")}
        className={ring(ringed === "chip:new-character")}
        type="button"
        title="Add a character"
      >
        <C.CastAvatarFallback>
          <IoMdAdd size={14} />
        </C.CastAvatarFallback>
        New character
      </C.CharacterChip>
    </C.CastRow>
    <C.Note>
      These belong to the story rather than to any one of you — every co-author
      can edit them, and anyone can speak as them in a passage.
    </C.Note>
  </>
);

/**
 * The mesh, with its legend.
 *
 * Its own flow is the focus: it walks the cast one character at a time, and the
 * real mesh dims everything that is not theirs — which says what a relationship
 * mesh is for far better than the ring does.
 */
const MeshTab: FC<TabProps> = ({ marks, ringed }) => {
  const theme = useGlobalState("theme");
  /* Every tone stays drawn: the legend's filters are the reader's to work on
     the real page, and there is nothing worth hiding in four sample threads. */
  const hiddenTones = useMemo(() => new Set<string>(), []);
  /* Both sample houses stay painted, for the same reason — the overlap between
     them is the thing this stage is here to show. */
  const hiddenGroups = useMemo(() => new Set<string>(), []);
  // One beat per character, then one with nobody followed.
  const { beat } = useStageFlow(MOCK_PEOPLE.length + 1, 2400);

  const palette = useMemo(() => buildTonePalette(MOCK_TONES, theme), [theme]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const relationship of MOCK_RELATIONSHIPS) {
      const key = resolveTone(relationship, palette, theme).key;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [palette, theme]);

  const followed = MOCK_PEOPLE[beat]?.id ?? null;

  return (
    <>
      <R.HeaderRow>
        <R.ModeToggle>
          <R.ModeButton type="button" $active>
            <LuNetwork size={13} />
            Mesh
          </R.ModeButton>
          <R.ModeButton type="button" title="The same data, as a table">
            Table
          </R.ModeButton>
        </R.ModeToggle>
        <R.Spacer />
        <R.ModeButton
          ref={mark(marks, "mesh:new")}
          className={ring(ringed === "mesh:new")}
          type="button"
          $active
          title="Sample — nothing is saved"
        >
          <IoMdAdd size={14} />
          New relationship
        </R.ModeButton>
      </R.HeaderRow>

      <R.Legend
        ref={mark(marks, "mesh:legend")}
        className={ring(ringed === "mesh:legend")}
      >
        {palette.map((tone) => {
          return (
            <R.LegendItem
              key={tone.key}
              type="button"
              title={tone.description ?? "A tone this story defined"}
            >
              <R.LegendSwatch viewBox="0 0 26 10" aria-hidden>
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
              </R.LegendSwatch>
              {tone.label}
              <span>({counts.get(tone.key) ?? 0})</span>
            </R.LegendItem>
          );
        })}
      </R.Legend>

      <RelationshipMesh
        cast={MOCK_PEOPLE}
        relationships={MOCK_RELATIONSHIPS}
        palette={palette}
        hiddenTones={hiddenTones}
        groups={MOCK_GROUPS}
        hiddenGroups={hiddenGroups}
        focusedId={followed}
        onFocus={() => {
          /* The flow follows the cast; the model takes no input of its own. */
        }}
        onOpenRelationship={() => {
          /* The real mesh opens the relationship's sheet here. */
        }}
      />
      <R.Hint>
        Hover a thread to read it; tap a character to follow only theirs, tap
        again to clear.
      </R.Hint>
    </>
  );
};

const EntriesTab: FC<TabProps & { categoryId: string }> = ({
  categoryId,
  marks,
  ringed,
}) => {
  const entries = MOCK_ENTRIES.filter(
    (entry) => entry.categoryId === categoryId,
  );

  return (
    <C.Grid>
      {entries.map((entry, position) => {
        const Icon = resolveCodexIcon(entry.icon);
        /* Only the first card carries the flow's marks — a ring on every
           pencil at once would point at nothing in particular. */
        const leads = position === 0;
        return (
          <C.Card key={entry.id} $color={entry.color}>
            <C.CardAction
              ref={leads ? mark(marks, "card:edit") : undefined}
              className={leads ? ring(ringed === "card:edit") : undefined}
              type="button"
              aria-label={`Edit ${entry.name}`}
              title="Edit entry"
            >
              <GrEdit size={13} />
            </C.CardAction>

            <C.CardOpen
              ref={leads ? mark(marks, "card:open") : undefined}
              className={leads ? ring(ringed === "card:open") : undefined}
              type="button"
              aria-label={`Read ${entry.name}`}
            >
              <C.CardHead>
                <C.CardIcon $color={entry.color}>
                  <Icon size={16} />
                </C.CardIcon>
                <C.CardName>{entry.name}</C.CardName>
                <span style={{ width: 28 }} />
              </C.CardHead>
              <C.CardBody>{entry.description}</C.CardBody>
            </C.CardOpen>

            {entry.chapterIds.length > 0 && (
              <C.ChapterRow
                ref={leads ? mark(marks, "card:chapters") : undefined}
                className={leads ? ring(ringed === "card:chapters") : undefined}
              >
                Used in
                {entry.chapterIds.map((chapterId) => {
                  const chapter = MOCK_CHAPTERS.find(
                    (candidate) => candidate.id === chapterId,
                  );
                  if (!chapter) return null;
                  return (
                    <C.ChapterChip key={chapterId} type="button">
                      {chapter.name}
                    </C.ChapterChip>
                  );
                })}
              </C.ChapterRow>
            )}
          </C.Card>
        );
      })}
    </C.Grid>
  );
};

/** One beat of a codex flow: the tab it is on, and what it points at there. */
export type CodexBeat = { tab: string; at?: string };

/**
 * The codex, tab for tab.
 *
 * Plays the beats it is given — switching tabs, ringing a tool, pointing at a
 * card's pencil — and hands over to the reader on the first tap.
 */
export const CodexStage: FC<{ flow?: CodexBeat[] }> = ({
  flow = [{ tab: CAST_TAB }],
}) => {
  const marks = useStageMarks();
  const root = useRef<HTMLDivElement>(null);
  const { aim, beat } = useStageFlow(flow.length, 2800);

  /* `aim` is where the pointer is going; `beat` is what has been reached. The
     tab switches and the ring lights on arrival — the tab pills are marked on
     every tab, so the pointer always has something to travel to. */
  const current = flow[beat] ?? flow[0];
  const tab = current.tab;
  const at = (flow[aim] ?? flow[0]).at ?? null;
  const ringed = current.at ?? null;

  return (
    <G.Flow ref={root}>
      <G.CodexFrame>
        <C.HeaderRow>
          <C.Title>Codex</C.Title>
          <C.Spacer />
          <C.ToolButton
            ref={mark(marks, "tool:categories")}
            className={ring(ringed === "tool:categories")}
            type="button"
            title="Reorder and rename categories"
          >
            <LuSettings2 size={14} />
            Categories
          </C.ToolButton>
          <C.ToolButton
            ref={mark(marks, "tool:new-entry")}
            className={ring(ringed === "tool:new-entry")}
            type="button"
            $primary
            title="Add a codex entry"
          >
            <IoMdAdd size={16} />
            New entry
          </C.ToolButton>
        </C.HeaderRow>

        <C.TabScroller $fade>
          <C.TabRow role="tablist" aria-label="Codex categories (sample)">
            <C.Tab
              ref={mark(marks, `tab:${CAST_TAB}`)}
              className={ring(ringed === `tab:${CAST_TAB}`)}
              type="button"
              role="tab"
              aria-selected={tab === CAST_TAB}
              $active={tab === CAST_TAB}
            >
              <LuUsers size={14} />
              Characters
              <span className="count">
                {MOCK_CAST.length + MOCK_CHARACTERS.length}
              </span>
            </C.Tab>
            <C.Tab
              ref={mark(marks, `tab:${MESH_TAB}`)}
              className={ring(ringed === `tab:${MESH_TAB}`)}
              type="button"
              role="tab"
              aria-selected={tab === MESH_TAB}
              $active={tab === MESH_TAB}
            >
              <LuNetwork size={14} />
              Relationships
              <span className="count">{MOCK_RELATIONSHIPS.length}</span>
            </C.Tab>
            {MOCK_CATEGORIES.map((category) => {
              const Icon = resolveCodexIcon(category.icon);
              const id = category.id as string;
              return (
                <C.Tab
                  key={id}
                  ref={mark(marks, `tab:${id}`)}
                  className={ring(ringed === `tab:${id}`)}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  $active={tab === id}
                >
                  <Icon size={14} />
                  {category.name}
                  <span className="count">{MOCK_ENTRY_COUNTS[id] ?? 0}</span>
                </C.Tab>
              );
            })}
            <C.Tab
              ref={mark(marks, "tab:add")}
              className={ring(ringed === "tab:add")}
              type="button"
              title="Add a category"
              aria-label="Add a category"
            >
              <IoMdAdd size={15} />
            </C.Tab>
          </C.TabRow>
        </C.TabScroller>

        {tab === CAST_TAB ? (
          <CastTab marks={marks} ringed={ringed} />
        ) : tab === MESH_TAB ? (
          <MeshTab marks={marks} ringed={ringed} />
        ) : (
          <EntriesTab categoryId={tab} marks={marks} ringed={ringed} />
        )}
      </G.CodexFrame>

      <StagePointer rootRef={root} marks={marks} at={at} tapKey={beat} />
    </G.Flow>
  );
};

// ── The editors, drawn in place ────────────────────────────────────────────

/** The character editor: what opens from a character chip, or New character. */
const CHARACTER_BEATS = [
  "char:portrait",
  "char:names",
  "char:nicknames",
  "char:fields",
  "char:delete",
];

export const CharacterEditorStage: FC = () => {
  const character = MOCK_CHARACTERS[0];
  const marks = useStageMarks();
  const root = useRef<HTMLDivElement>(null);
  const { aim, beat } = useStageFlow(CHARACTER_BEATS.length, 2200);
  const at = CHARACTER_BEATS[aim] ?? null;
  const ringed = CHARACTER_BEATS[beat] ?? null;

  return (
    <G.Flow ref={root}>
      <G.SheetFrame>
        <F.SheetHeader>
          <F.SheetTitle>Edit character</F.SheetTitle>
          <F.SheetActionButton type="button" aria-label="Cancel" title="Cancel">
            <IoClose size={17} />
          </F.SheetActionButton>
          <F.SheetActionButton
            type="button"
            $variant="confirm"
            aria-label="Save"
            title="Save"
          >
            <IoCheckmark size={17} />
          </F.SheetActionButton>
        </F.SheetHeader>

        <F.SheetBody>
          <C.CharacterPortraitRow
            ref={mark(marks, "char:portrait")}
            className={ring(ringed === "char:portrait")}
          >
            <C.CharacterPortraitFramed
              $src={character.image ?? ""}
              $scale={1}
              $x={50}
              $y={50}
              aria-hidden
            />
            <C.CharacterPortraitActions>
              <C.ToolButton type="button">Change portrait</C.ToolButton>
              <C.Note>
                Pan and zoom it; the framing follows them everywhere.
              </C.Note>
            </C.CharacterPortraitActions>
          </C.CharacterPortraitRow>

          <C.CharacterNameRow
            ref={mark(marks, "char:names")}
            className={ring(ringed === "char:names")}
          >
            <F.Field>
              First name
              <F.TextInput readOnly value={character.firstName} />
            </F.Field>
            <F.Field>
              Last name
              <F.TextInput readOnly value={character.lastName ?? ""} />
            </F.Field>
          </C.CharacterNameRow>

          <F.Field
            ref={mark(marks, "char:nicknames")}
            className={ring(ringed === "char:nicknames")}
          >
            Nicknames
            <F.TextInput
              readOnly
              value={(character.nicknames ?? []).join(", ")}
            />
          </F.Field>

          <F.Field
            as="div"
            ref={mark(marks, "char:fields")}
            className={ring(ringed === "char:fields")}
          >
            Their own fields
            {Object.entries(character.extraAttributes ?? {}).map(
              ([label, value]) => (
                <C.AttributeRow key={label}>
                  <F.TextInput readOnly value={label} />
                  <F.TextInput readOnly value={value} />
                  <C.AttributeRemove
                    type="button"
                    aria-label={`Remove ${label}`}
                    title="Remove this field"
                  >
                    <IoClose size={15} />
                  </C.AttributeRemove>
                </C.AttributeRow>
              ),
            )}
          </F.Field>

          <F.DangerButton
            ref={mark(marks, "char:delete")}
            className={ring(ringed === "char:delete")}
            type="button"
          >
            <FaRegTrashCan size={13} />
            Delete character
          </F.DangerButton>
        </F.SheetBody>
      </G.SheetFrame>

      <StagePointer rootRef={root} marks={marks} at={at} tapKey={beat} />
    </G.Flow>
  );
};

const ENTRY_BEATS = [
  "entry:name",
  "entry:category",
  "entry:colour",
  "entry:chapters",
  "entry:delete",
];

/** The entry editor: New entry, and the same sheet a card's pencil opens. */
export const EntryEditorStage: FC = () => {
  const entry = MOCK_ENTRIES[0];
  const marks = useStageMarks();
  const root = useRef<HTMLDivElement>(null);
  const { aim, beat } = useStageFlow(ENTRY_BEATS.length, 2200);
  const at = ENTRY_BEATS[aim] ?? null;
  const ringed = ENTRY_BEATS[beat] ?? null;

  return (
    <G.Flow ref={root}>
      <G.SheetFrame>
        <F.SheetHeader>
          <F.SheetTitle>Edit entry</F.SheetTitle>
          <F.SheetActionButton type="button" aria-label="Cancel" title="Cancel">
            <IoClose size={17} />
          </F.SheetActionButton>
          <F.SheetActionButton
            type="button"
            $variant="confirm"
            aria-label="Save"
            title="Save"
          >
            <IoCheckmark size={17} />
          </F.SheetActionButton>
        </F.SheetHeader>

        <F.SheetBody>
          <F.Field
            ref={mark(marks, "entry:name")}
            className={ring(ringed === "entry:name")}
          >
            Name
            <F.TextInput readOnly value={entry.name} />
          </F.Field>

          <F.Field
            as="div"
            ref={mark(marks, "entry:category")}
            className={ring(ringed === "entry:category")}
          >
            Category
            <F.ChoiceRow>
              {MOCK_CATEGORIES.map((category) => {
                const Icon = resolveCodexIcon(category.icon);
                return (
                  <F.Choice
                    key={category.id}
                    type="button"
                    $active={category.id === entry.categoryId}
                  >
                    <Icon size={13} />
                    {category.name}
                  </F.Choice>
                );
              })}
            </F.ChoiceRow>
          </F.Field>

          <F.Field
            as="div"
            ref={mark(marks, "entry:colour")}
            className={ring(ringed === "entry:colour")}
          >
            Colour
            <F.SwatchRow>
              {CODEX_COLORS.map((color) => (
                <F.Swatch
                  key={color}
                  type="button"
                  $active={color === entry.color}
                  $color={color}
                  aria-label={`Colour ${color}`}
                />
              ))}
            </F.SwatchRow>
          </F.Field>

          <F.Field
            as="div"
            ref={mark(marks, "entry:chapters")}
            className={ring(ringed === "entry:chapters")}
          >
            Appears in
            <F.ChoiceRow>
              {MOCK_CHAPTERS.map((chapter) => (
                <F.Choice
                  key={chapter.id}
                  type="button"
                  $active={entry.chapterIds.includes(chapter.id)}
                >
                  {chapter.name}
                </F.Choice>
              ))}
            </F.ChoiceRow>
          </F.Field>

          <F.Hint>
            The description is a rich-text field: images, GIFs and links, the
            same editor a passage uses.
          </F.Hint>

          <F.DangerButton
            ref={mark(marks, "entry:delete")}
            className={ring(ringed === "entry:delete")}
            type="button"
          >
            <FaRegTrashCan size={13} />
            Delete entry
          </F.DangerButton>
        </F.SheetBody>
      </G.SheetFrame>

      <StagePointer rootRef={root} marks={marks} at={at} tapKey={beat} />
    </G.Flow>
  );
};

/**
 * The category manager: reorder, rename, re-icon, and remove empty ones.
 *
 * Its flow drags: each beat lifts a row under the pointer, which is what the
 * handle is for and the fastest way to say so.
 */
export const CategoryManagerStage: FC = () => {
  const marks = useStageMarks();
  const root = useRef<HTMLDivElement>(null);
  /** A beat per row, then one on the edit action of the last. */
  const beats = MOCK_CATEGORIES.length + 1;
  const { aim, beat } = useStageFlow(beats, 2000);

  /** The row lifts once the pointer is on its handle, never before. */
  const draggingIndex = beat < MOCK_CATEGORIES.length ? beat : -1;
  const nameOf = (index: number) =>
    index < MOCK_CATEGORIES.length ? `cat:drag-${index}` : "cat:edit";
  const at = nameOf(aim);
  const ringed = nameOf(beat);

  return (
    <G.Flow ref={root}>
      <G.SheetFrame>
        <F.SheetHeader>
          <F.SheetTitle>Categories</F.SheetTitle>
          <F.SheetActionButton type="button" aria-label="Cancel" title="Cancel">
            <IoClose size={17} />
          </F.SheetActionButton>
          <F.SheetActionButton
            type="button"
            $variant="confirm"
            aria-label="Save"
            title="Save"
          >
            <IoCheckmark size={17} />
          </F.SheetActionButton>
        </F.SheetHeader>

        <F.SheetBody>
          <G.ManagerList>
            {MOCK_CATEGORIES.map((category, position) => {
              const Icon = resolveCodexIcon(category.icon);
              const count = MOCK_ENTRY_COUNTS[category.id as string] ?? 0;
              const dragging = position === draggingIndex;
              const editing = ringed === "cat:edit" && position === 0;
              return (
                <C.ManagerRow
                  key={category.id}
                  $dragging={dragging}
                  className={dragging ? "guide-lift" : undefined}
                >
                  <C.DragHandle
                    ref={mark(marks, `cat:drag-${position}`)}
                    className={ring(dragging)}
                    type="button"
                    aria-label={`Drag to reorder ${category.name}`}
                    title="Drag to reorder"
                  >
                    <RxDragHandleDots2 size={17} />
                  </C.DragHandle>
                  <Icon size={15} />
                  <C.ManagerName>{category.name}</C.ManagerName>
                  <C.ManagerCount>
                    {count} <span className="unit">entries</span>
                  </C.ManagerCount>
                  <C.RowAction
                    ref={position === 0 ? mark(marks, "cat:edit") : undefined}
                    className={ring(editing)}
                    type="button"
                    aria-label={`Edit ${category.name}`}
                    title="Rename or re-icon"
                  >
                    <GrEdit size={13} />
                  </C.RowAction>
                </C.ManagerRow>
              );
            })}
          </G.ManagerList>

          <F.Hint>
            A category can only be removed once it is empty — deleting one never
            takes its entries with it.
          </F.Hint>
        </F.SheetBody>
      </G.SheetFrame>

      <StagePointer rootRef={root} marks={marks} at={at} tapKey={beat} />
    </G.Flow>
  );
};
