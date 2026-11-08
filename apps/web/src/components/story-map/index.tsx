"use client";

import type {
  CodexCategory,
  CodexEntry,
  StoryBoardEvent,
  StoryMap,
  StoryMapPin,
} from "@nw/types";
import {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GrEdit } from "react-icons/gr";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import {
  LuLocateFixed,
  LuMap,
  LuMapPin,
  LuZoomIn,
  LuZoomOut,
} from "react-icons/lu";
import {
  deleteStoryMapAction,
  deleteStoryMapPinAction,
  getStoryCodexAction,
  getStoryMapsAction,
  saveStoryMapAction,
  saveStoryMapPinAction,
} from "@/app/rp/story/actions";
import { resolveCodexIcon } from "@/components/story-codex/icons";
import { useUIContext } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import { API_MESSAGE } from "@/utils/constants";
import { ROUTES } from "@/utils/constants/routes";
import { MapSheet } from "./map-sheet";
import { PinSheet } from "./pin-sheet";
import * as S from "./styles";
import { usePanZoom } from "./use-pan-zoom";

/** A pointer that travelled further than this was a pan, not a click. */
const CLICK_SLOP_PX = 4;

type Props = {
  storyboardId: string;
  /** The story's chapters, for a pinned entry's "used in" chips. */
  chapters: StoryBoardEvent[];
  /** Members edit the maps; everyone else gets a read-only board. */
  canEdit: boolean;
};

/** Strips a codex entry's rich-text description down to plain prose. */
const previewOf = (html: string | null | undefined) => {
  if (!html || typeof document === "undefined") return "";
  const scratch = document.createElement("div");
  scratch.innerHTML = html;
  return (scratch.textContent ?? "").trim();
};

/**
 * The map view: an uploaded map image with codex entries pinned onto it.
 *
 * Pin coordinates are percentages of the image, so a pin lands in the same
 * place on a phone, on a desktop, and at every zoom level — and the pins stay
 * real DOM nodes rather than canvas paint, so they remain crisp and clickable.
 */
export const StoryMapView: FC<Props> = ({
  storyboardId,
  chapters,
  canEdit,
}) => {
  const { successToast, errorToast } = useUIContext();
  const { routeToPage } = usePageRouter();

  const [maps, setMaps] = useState<StoryMap[]>([]);
  const [codexEntries, setCodexEntries] = useState<CodexEntry[]>([]);
  const [codexCategories, setCodexCategories] = useState<CodexCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMapId, setActiveMapId] = useState<string | null>(null);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

  const [mapSheet, setMapSheet] = useState<{
    open: boolean;
    map: StoryMap | null;
  }>({ map: null, open: false });
  const [pinSheet, setPinSheet] = useState<{
    open: boolean;
    pin: StoryMapPin | null;
    point: { x: number; y: number } | null;
  }>({ open: false, pin: null, point: null });
  /** "Add pin" mode: the next click on the map drops a pin there. */
  const [placing, setPlacing] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);
  /** Where the pointer went down, to tell a click from the end of a pan. */
  const pressRef = useRef<{ x: number; y: number } | null>(null);
  /** The pin being dragged, and whether it actually moved. */
  const pinDragRef = useRef<{ id: string; moved: boolean } | null>(null);

  const {
    stageRef,
    transform,
    limits,
    onPointerDown,
    zoomBy,
    reset,
    isPanning,
    fitToContent,
  } = usePanZoom();

  /** The active map's natural pixel size, so the fit can be recomputed when
   *  the stage changes size without waiting for another image load. */
  const naturalSizeRef = useRef<{ width: number; height: number } | null>(null);

  /** Fits whatever the image element currently holds. */
  const fitActiveImage = useCallback(
    (keepZoom = false) => {
      const image = imageRef.current;
      if (!image?.naturalWidth || !image.naturalHeight) return;
      naturalSizeRef.current = {
        height: image.naturalHeight,
        width: image.naturalWidth,
      };
      fitToContent(image.naturalWidth, image.naturalHeight, keepZoom);
    },
    [fitToContent],
  );

  const load = useCallback(async () => {
    const [mapResult, codexResult] = await Promise.all([
      getStoryMapsAction(storyboardId),
      getStoryCodexAction(storyboardId),
    ]);
    setLoading(false);
    if (mapResult && !("message" in mapResult)) {
      setMaps(mapResult.maps);
      setActiveMapId((current) =>
        current && mapResult.maps.some((map) => map.id === current)
          ? current
          : (mapResult.maps[0]?.id ?? null),
      );
    }
    if (codexResult && !("message" in codexResult)) {
      setCodexEntries(codexResult.entries);
      setCodexCategories(codexResult.categories);
    }
  }, [storyboardId]);

  useEffect(() => {
    load();
  }, [load]);

  const activeMap = maps.find((map) => map.id === activeMapId) ?? null;

  // A cached image is already decoded by the time it mounts, so its load event
  // never fires — fit from here as well as from onLoad.
  useEffect(() => {
    if (!activeMap?.image) {
      naturalSizeRef.current = null;
      return;
    }
    fitActiveImage();
  }, [activeMap?.image, fitActiveImage]);

  // The stage is sized in svh, so it resizes with the window. Refit against
  // the new box, but leave a reader who has zoomed in where they were.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(() => {
      const size = naturalSizeRef.current;
      if (size) fitToContent(size.width, size.height, true);
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [stageRef, fitToContent]);

  const entriesById = useMemo(() => {
    const byId = new Map<string, CodexEntry>();
    for (const entry of codexEntries) {
      if (entry.id) byId.set(entry.id, entry);
    }
    return byId;
  }, [codexEntries]);
  const categoriesById = useMemo(() => {
    const byId = new Map<string, CodexCategory>();
    for (const category of codexCategories) {
      if (category.id) byId.set(category.id, category);
    }
    return byId;
  }, [codexCategories]);

  /** A pin's display name: its codex entry's, or its own label. */
  const nameOf = useCallback(
    (pin: StoryMapPin) =>
      (pin.codexEntryId ? entriesById.get(pin.codexEntryId)?.name : null) ??
      pin.label ??
      "Unnamed",
    [entriesById],
  );

  const selectedPin =
    activeMap?.pins.find((pin) => pin.id === selectedPinId) ?? null;
  const selectedEntry = selectedPin?.codexEntryId
    ? (entriesById.get(selectedPin.codexEntryId) ?? null)
    : null;

  // ── Coordinates ──────────────────────────────────────────────────────────

  /**
   * Client coordinates → a position on the image, in percent. Read straight
   * off the rendered image box, so the pan/zoom transform is already accounted
   * for and never has to be inverted by hand.
   */
  const toImagePercent = useCallback((clientX: number, clientY: number) => {
    const image = imageRef.current;
    if (!image) return null;
    const rect = image.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    return {
      x: Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100)),
    };
  }, []);

  // ── Saving ───────────────────────────────────────────────────────────────

  const patchPin = useCallback((mapId: string, pin: StoryMapPin) => {
    setMaps((current) =>
      current.map((map) =>
        map.id !== mapId
          ? map
          : {
              ...map,
              pins: map.pins.some((candidate) => candidate.id === pin.id)
                ? map.pins.map((candidate) =>
                    candidate.id === pin.id ? pin : candidate,
                  )
                : [...map.pins, pin],
            },
      ),
    );
  }, []);

  /** Resolves true once saved, so the pin sheet closes only on success. */
  const commitPin = useCallback(
    async (pin: StoryMapPin) => {
      const mapId = activeMap?.id;
      if (!mapId) return false;

      const previous = maps;
      // Optimistic for a move (the pin already exists); a new pin waits for
      // its server id rather than flickering in with a fake one.
      if (pin.id) patchPin(mapId, pin);

      const saved = await saveStoryMapPinAction(mapId, pin).catch(() => null);
      if (!saved || "message" in saved) {
        setMaps(previous);
        errorToast("Could not save that pin. Please try again.");
        return false;
      }
      patchPin(mapId, saved);
      return true;
    },
    [activeMap?.id, maps, patchPin, errorToast],
  );

  const handleDeletePin = async (pin: StoryMapPin) => {
    if (!pin.id || !activeMap?.id) return;
    const result = await deleteStoryMapPinAction(pin.id).catch(() => null);
    if (result?.message !== API_MESSAGE.Success) {
      errorToast("Could not remove that pin. Please try again.");
      return;
    }
    setMaps((current) =>
      current.map((map) =>
        map.id !== activeMap.id
          ? map
          : { ...map, pins: map.pins.filter((c) => c.id !== pin.id) },
      ),
    );
    setPinSheet({ open: false, pin: null, point: null });
    setSelectedPinId(null);
  };

  const handleSaveMap = async (map: StoryMap) => {
    const saved = await saveStoryMapAction(storyboardId, map).catch(
      () => null,
    );
    if (!saved || "message" in saved) {
      errorToast("Could not save that map. Please try again.");
      return;
    }
    setMaps((current) => {
      const exists = current.some((candidate) => candidate.id === saved.id);
      return exists
        ? current.map((candidate) =>
            candidate.id === saved.id ? saved : candidate,
          )
        : [...current, saved];
    });
    setMapSheet({ map: null, open: false });
    setActiveMapId(saved.id);
    reset();
  };

  const handleDeleteMap = async (map: StoryMap) => {
    if (!map.id) return;
    const result = await deleteStoryMapAction(map.id).catch(() => null);
    if (result?.message !== API_MESSAGE.Success) {
      errorToast("Could not delete that map. Please try again.");
      return;
    }
    setMaps((current) =>
      current.filter((candidate) => candidate.id !== map.id),
    );
    setMapSheet({ map: null, open: false });
    setActiveMapId((current) =>
      current === map.id
        ? (maps.find((candidate) => candidate.id !== map.id)?.id ?? null)
        : current,
    );
    successToast("Map removed.");
  };

  // ── Stage interaction ────────────────────────────────────────────────────

  const handleStagePointerDown = (e: React.PointerEvent) => {
    pressRef.current = { x: e.clientX, y: e.clientY };
    onPointerDown(e);
  };

  const handleStagePointerUp = (e: React.PointerEvent) => {
    const press = pressRef.current;
    pressRef.current = null;
    if (!press) return;
    // Panning ends on a pointerup too — only a pointer that barely moved is a
    // click on the map.
    const travelled = Math.hypot(e.clientX - press.x, e.clientY - press.y);
    if (travelled > CLICK_SLOP_PX) return;

    if (placing && canEdit) {
      const point = toImagePercent(e.clientX, e.clientY);
      if (point) {
        setPlacing(false);
        setPinSheet({ open: true, pin: null, point });
      }
      return;
    }
    setSelectedPinId(null);
  };

  /** Dragging a pin moves it; a plain tap expands it into its card. */
  const handlePinPointerDown = (e: React.PointerEvent, pin: StoryMapPin) => {
    if (!canEdit || !pin.id) return;
    // Keep the stage from panning underneath the pin. Selection waits for the
    // pointer to come back up — swapping the chip for its card mid-gesture
    // would pull the drag target out from under the pointer.
    e.stopPropagation();
    pinDragRef.current = { id: pin.id, moved: false };
  };

  useEffect(() => {
    if (!canEdit) return;

    const move = (e: PointerEvent) => {
      const drag = pinDragRef.current;
      if (!drag || !activeMap?.id) return;
      const point = toImagePercent(e.clientX, e.clientY);
      if (!point) return;
      drag.moved = true;
      const pin = activeMap.pins.find((candidate) => candidate.id === drag.id);
      if (!pin) return;
      patchPin(activeMap.id, { ...pin, ...point });
    };

    const end = () => {
      const drag = pinDragRef.current;
      pinDragRef.current = null;
      if (!drag || !activeMap?.id) return;
      const pin = activeMap.pins.find((candidate) => candidate.id === drag.id);
      if (!pin) return;
      if (drag.moved) {
        commitPin(pin);
      } else {
        setSelectedPinId(pin.id);
      }
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [canEdit, activeMap, toImagePercent, patchPin, commitPin]);

  // ── Render ───────────────────────────────────────────────────────────────

  if (!loading && maps.length === 0) {
    return (
      <S.Root>
        <S.HeaderRow>
          <S.Title>Map</S.Title>
        </S.HeaderRow>
        <S.EmptyCard>
          <S.EmptyGlyph>
            <LuMap size={26} />
          </S.EmptyGlyph>
          <S.EmptyTitle>Upload your world map</S.EmptyTitle>
          <S.EmptyText>
            Drop in the map you drew (or commissioned), then pin your codex
            places onto it. Pins are stored as a position on the image, so they
            stay put at any size.
          </S.EmptyText>
          {canEdit && (
            <S.ToolButton
              type="button"
              $primary
              onClick={() => setMapSheet({ map: null, open: true })}
            >
              <IoMdAdd size={16} />
              Upload a map
            </S.ToolButton>
          )}
        </S.EmptyCard>

        <MapSheet
          open={mapSheet.open}
          map={mapSheet.map}
          storyboardId={storyboardId}
          onClose={() => setMapSheet({ map: null, open: false })}
          onSave={handleSaveMap}
        />
      </S.Root>
    );
  }

  return (
    <S.Root>
      <S.HeaderRow>
        <S.Title>Map</S.Title>
        <S.Spacer />
        {canEdit && activeMap && (
          <>
            <S.ToolButton
              type="button"
              $active={placing}
              onClick={() => setPlacing((current) => !current)}
              title="Click the map to drop a pin"
            >
              <LuMapPin size={14} />
              {placing ? "Click the map…" : "Add pin"}
            </S.ToolButton>
            <S.ToolButton
              type="button"
              onClick={() => setMapSheet({ map: activeMap, open: true })}
            >
              <GrEdit size={13} />
              Edit map
            </S.ToolButton>
            <S.ToolButton
              type="button"
              $primary
              onClick={() => setMapSheet({ map: null, open: true })}
            >
              <IoMdAdd size={16} />
              New map
            </S.ToolButton>
          </>
        )}
      </S.HeaderRow>

      {maps.length > 1 && (
        <S.TabRow role="tablist" aria-label="Maps">
          {maps.map((map) => (
            <S.Tab
              key={map.id}
              type="button"
              role="tab"
              aria-selected={map.id === activeMapId}
              $active={map.id === activeMapId}
              onClick={() => {
                setActiveMapId(map.id);
                setSelectedPinId(null);
                reset();
              }}
            >
              {map.name}
              <span className="count">{map.pins.length}</span>
            </S.Tab>
          ))}
        </S.TabRow>
      )}

      <S.Stage
        ref={stageRef}
        $placing={placing}
        $grabbing={isPanning()}
        onPointerDown={handleStagePointerDown}
        onPointerUp={handleStagePointerUp}
      >
        {placing && (
          <S.PlacingBanner>
            <LuMapPin size={14} />
            Click where the pin goes
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPlacing(false);
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </S.PlacingBanner>
        )}

        <S.Viewport
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          }}
        >
          {activeMap?.image && (
            <div style={{ position: "relative" }}>
              <S.MapImage
                ref={imageRef}
                src={activeMap.image}
                alt={activeMap.name}
                draggable={false}
                onLoad={() => fitActiveImage()}
              />
              <S.PinLayer>
                {activeMap.pins.map((pin) =>
                  // The selected pin's chip is replaced by its card below.
                  pin.id === selectedPinId ? null : (
                    <S.Pin
                      key={pin.id}
                      type="button"
                      $draggable={canEdit}
                      title={nameOf(pin)}
                      style={{
                        left: `${pin.x}%`,
                        top: `${pin.y}%`,
                        // Counter-scale so the pin keeps its size on screen,
                        // and offset so its dot sits on the exact coordinate.
                        transform: `translate(-6px, -50%) scale(${1 / transform.scale})`,
                      }}
                      onPointerDown={(e) => handlePinPointerDown(e, pin)}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Members select pins through the drag handler's tap
                        // branch; this covers read-only viewers.
                        if (!canEdit) setSelectedPinId(pin.id);
                      }}
                    >
                      <span className="dot" />
                      {nameOf(pin)}
                    </S.Pin>
                  ),
                )}

                {/* The selected pin, expanded in place into its card. */}
                {selectedPin && (
                  <S.PinCard
                    style={{
                      left: `${selectedPin.x}%`,
                      top: `${selectedPin.y}%`,
                      transform: `translate(-6px, -12px) scale(${1 / transform.scale})`,
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <S.DetailHead>
                      <S.DetailIcon $color={selectedEntry?.color}>
                        {(() => {
                          const Icon = resolveCodexIcon(selectedEntry?.icon);
                          return <Icon size={16} />;
                        })()}
                      </S.DetailIcon>
                      <S.DetailName>{nameOf(selectedPin)}</S.DetailName>
                      <button
                        type="button"
                        className="close"
                        aria-label="Close"
                        onClick={() => setSelectedPinId(null)}
                      >
                        <IoMdClose size={15} />
                      </button>
                    </S.DetailHead>

                    {selectedEntry?.categoryId && (
                      <S.DetailCategory>
                        {categoriesById.get(selectedEntry.categoryId)?.name}
                      </S.DetailCategory>
                    )}

                    {selectedEntry ? (
                      <S.DetailBody className="preview">
                        {previewOf(selectedEntry.description)}
                      </S.DetailBody>
                    ) : (
                      <S.DetailBody>
                        A plain marker — link it to a codex entry to give it a
                        page.
                      </S.DetailBody>
                    )}

                    {selectedEntry && selectedEntry.chapterIds.length > 0 && (
                      <S.ChapterRow>
                        Used in
                        {selectedEntry.chapterIds.map((chapterId) => {
                          const chapter = chapters.find(
                            (c) => c.id === chapterId,
                          );
                          if (!chapter) return null;
                          return (
                            <S.ChapterChip
                              key={chapterId}
                              type="button"
                              onClick={() =>
                                routeToPage(ROUTES.Story.Event.View(chapterId))
                              }
                            >
                              {chapter.name}
                            </S.ChapterChip>
                          );
                        })}
                      </S.ChapterRow>
                    )}

                    {canEdit && (
                      <S.ToolButton
                        type="button"
                        onClick={() =>
                          setPinSheet({
                            open: true,
                            pin: selectedPin,
                            point: null,
                          })
                        }
                      >
                        <GrEdit size={13} />
                        Edit pin
                      </S.ToolButton>
                    )}
                  </S.PinCard>
                )}
              </S.PinLayer>
            </div>
          )}
        </S.Viewport>

        <S.StageControls>
          <S.StageButton
            type="button"
            aria-label="Zoom in"
            title="Zoom in"
            disabled={transform.scale >= limits.max - 0.001}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => zoomBy(1.25)}
          >
            <LuZoomIn size={16} />
          </S.StageButton>
          <S.ZoomReadout
            title="Zoom — 100% is the map's full resolution"
            aria-label={`Zoom ${Math.round(transform.scale * 100)}%`}
          >
            {Math.round(transform.scale * 100)}%
          </S.ZoomReadout>
          <S.StageButton
            type="button"
            aria-label="Zoom out"
            title="Zoom out"
            disabled={transform.scale <= limits.min + 0.001}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => zoomBy(1 / 1.25)}
          >
            <LuZoomOut size={16} />
          </S.StageButton>
          <S.StageButton
            type="button"
            aria-label="Fit the whole map"
            title="Fit the whole map"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={reset}
          >
            <LuLocateFixed size={16} />
          </S.StageButton>
        </S.StageControls>
      </S.Stage>

      <MapSheet
        open={mapSheet.open}
        map={mapSheet.map}
        storyboardId={storyboardId}
        onClose={() => setMapSheet({ map: null, open: false })}
        onSave={handleSaveMap}
        onDelete={handleDeleteMap}
      />

      <PinSheet
        open={pinSheet.open}
        pin={pinSheet.pin}
        pendingPoint={pinSheet.point}
        codexEntries={codexEntries}
        codexCategories={codexCategories}
        chapters={chapters}
        canEdit={canEdit}
        onClose={() => setPinSheet({ open: false, pin: null, point: null })}
        onSave={async (pin) => {
          // A failed save keeps the sheet open, label and notes intact.
          if (await commitPin(pin)) {
            setPinSheet({ open: false, pin: null, point: null });
          }
        }}
        onDelete={handleDeletePin}
        onOpenChapter={(chapterId) =>
          routeToPage(ROUTES.Story.Event.View(chapterId))
        }
      />
    </S.Root>
  );
};
