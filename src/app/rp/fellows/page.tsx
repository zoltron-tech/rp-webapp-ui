"use client";

import {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getStrangerNovelistsAction } from "@/app/rp/home/actions";
import { NovelistPreviewCard } from "@/components/novelist-preview-card";
import { useGlobalState } from "@/context/store/stores";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Novelist, NovelistWorldNotification } from "@/types";
import { ROUTES } from "@/utils/constants/routes";
import * as S from "./styled";

// How many suggestions to request per page
const PAGE_SIZE = 10;
// Must match the gap on `Track` in styled.ts (16px desktop, 10px mobile)
const GAP_DESKTOP = 16;
const GAP_MOBILE = 10;
const MOBILE_BREAKPOINT = 800;
const SWIPE_THRESHOLD = 50;

// ChevronLeft / ChevronRight inline SVGs — avoids a dependency on an icon lib
const ChevronLeft = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden={true}
    role="presentation"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden={true}
    role="presentation"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const FellowsPage: FC = () => {
  const authState = useGlobalState("authState");
  const notifications = useGlobalState("notifications");
  const { routeToPage, stopPageLoading } = usePageRouter();
  // Same race-condition fix as welcome/page.tsx:
  // The store is seeded with LOGGED_OUT on hard URL nav; wait for
  // AuthProvider's verify cycle before deciding to redirect.
  const authResolved = useRef(false);

  const [novelists, setNovelists] = useState<Novelist[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Derive NovelistPreview-shaped entries from FRIEND_REQUEST notifications.
  // These are prepended to the carousel so they appear first.
  const friendRequestCards = useMemo(() => {
    if (!notifications) return [];
    return notifications
      .filter((n: NovelistWorldNotification) => n.type === "FRIEND_REQUEST")
      .map((n: NovelistWorldNotification) => {
        const nameParts = (n.source.title ?? "").trim().split(" ");
        return {
          connection: "FRIEND_REQUEST_RECEIVED" as const,
          firstName: nameParts[0] ?? "",
          id: n.source.id,
          image: n.source.image,
          isVerified: false,
          lastName: nameParts.slice(1).join(" ") || null,
          username: n.source.urlProp,
        };
      });
  }, [notifications]);

  // Combined list shown in the carousel: friend requests first, then suggestions
  const cards = useMemo(
    () => [...friendRequestCards, ...novelists],
    [friendRequestCards, novelists],
  );

  // Two-slot cross-fade backdrop — we alternate which slot is "active" so
  // the outgoing image fades out while the incoming one fades in.
  const [slotA, setSlotA] = useState({ img: "", visible: false });
  const [slotB, setSlotB] = useState({ img: "", visible: false });
  const activeSlot = useRef<"a" | "b">("a");

  // Measure the viewport width to drive scroll-into-view math
  const viewportRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  // StrangerCard is 300px on desktop, 200px on mobile (container query) —
  // measure the rendered card so the centering math stays correct on resize.
  const [cardWidth, setCardWidth] = useState(300);
  const touchStartX = useRef(0);

  useEffect(() => {
    stopPageLoading();
  }, [stopPageLoading]);

  // Track viewport width via ResizeObserver.
  // Re-runs once `initialLoading` flips to false, because that's when
  // TrackViewport actually renders and the ref attaches.
  useEffect(() => {
    if (initialLoading) return;
    const vp = viewportRef.current;
    if (!vp) return;

    const measureViewport = () => setViewportWidth(vp.clientWidth);
    measureViewport();
    const ro = new ResizeObserver(measureViewport);
    ro.observe(vp);
    return () => ro.disconnect();
  }, [initialLoading]);

  // Measure the actual card width (300 desktop / 200 mobile via container query)
  useEffect(() => {
    if (initialLoading) return;
    const card = firstCardRef.current;
    if (!card) return;

    // Use offsetWidth (layout width) — getBoundingClientRect would return the
    // post-transform width and pick up the scale(1.04) on the active card,
    // causing the carousel to drift left/right each step.
    const measureCard = () => setCardWidth(card.offsetWidth);
    measureCard();
    const ro = new ResizeObserver(measureCard);
    ro.observe(card);
    return () => ro.disconnect();
  }, [initialLoading]);

  // Swap backdrop slots on active card change
  useEffect(() => {
    const img = cards[currentIndex]?.image;
    if (!img) return;
    if (activeSlot.current === "a") {
      setSlotB({ img, visible: true });
      setSlotA((p) => ({ ...p, visible: false }));
      activeSlot.current = "b";
    } else {
      setSlotA({ img, visible: true });
      setSlotB((p) => ({ ...p, visible: false }));
      activeSlot.current = "a";
    }
  }, [currentIndex, cards]);

  const fetchPage = useCallback(async (page: number) => {
    const result = await getStrangerNovelistsAction(page, PAGE_SIZE);
    if (!result || "message" in result) {
      setFetchError(true);
      return [];
    }
    return result;
  }, []);

  // Track auth resolution + redirect on LOGGED_OUT
  useEffect(() => {
    if (authState === "LOADING" || authState === "LOGGED_IN") {
      authResolved.current = true;
      return;
    }
    if (authState === "LOGGED_OUT" && authResolved.current) {
      routeToPage(ROUTES.Login);
    }
  }, [authState, routeToPage]);

  // Initial load — one fixed page, no infinite loading
  useEffect(() => {
    if (authState !== "LOGGED_IN") return;

    fetchPage(1).then((data) => {
      setNovelists(data);
      setInitialLoading(false);
    });
  }, [authState, fetchPage]);

  const total = cards.length;

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, total - 1));
  }, [total]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const goToIndex = useCallback((idx: number) => {
    setCurrentIndex(idx);
  }, []);

  // Touch / swipe
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const delta = touchStartX.current - e.changedTouches[0].clientX;
      if (delta > SWIPE_THRESHOLD) goNext();
      else if (delta < -SWIPE_THRESHOLD) goPrev();
    },
    [goNext, goPrev],
  );

  const handleSkip = () => routeToPage(ROUTES.Home);

  // Match the responsive gap defined on `Track` in styled.ts
  const gap = viewportWidth <= MOBILE_BREAKPOINT ? GAP_MOBILE : GAP_DESKTOP;

  // Always center the focused card in the viewport (novelists-carousel style)
  const offset =
    viewportWidth / 2 - cardWidth / 2 - currentIndex * (cardWidth + gap);

  // Auth guard
  if (authState === "LOADING") return null;
  if (authState === "LOGGED_OUT" && !authResolved.current) return null;
  if (authState === "LOGGED_OUT") return null;

  return (
    <S.Root>
      {/* Cross-fading backdrop images */}
      {slotA.img && (
        <S.BackdropLayer $img={slotA.img} $visible={slotA.visible} />
      )}
      {slotB.img && (
        <S.BackdropLayer $img={slotB.img} $visible={slotB.visible} />
      )}
      <S.Header>
        <S.Eyebrow>Discover Writers</S.Eyebrow>
        <S.Title>Meet Fellow Novelists</S.Title>
        <S.Subtitle>
          Connect with writers from across Novelist World — follow their work,
          send a message, or just say hi.
        </S.Subtitle>
      </S.Header>

      {initialLoading && <S.LoadingSpinner aria-label="Loading suggestions…" />}

      {!initialLoading && fetchError && (
        <S.ErrorText>
          Couldn&apos;t load suggestions right now. Try refreshing the page.
        </S.ErrorText>
      )}

      {!initialLoading && !fetchError && cards.length === 0 && (
        <S.EmptyState>
          <span>🔍</span>
          No suggestions available right now — check back soon!
        </S.EmptyState>
      )}

      {!initialLoading && !fetchError && cards.length > 0 && (
        <>
          <S.CarouselWrapper>
            <S.ArrowButton
              aria-label="Previous"
              onClick={goPrev}
              $hidden={currentIndex === 0}
            >
              <ChevronLeft />
            </S.ArrowButton>

            <S.TrackViewport
              ref={viewportRef}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <S.Track
                $offset={offset}
                style={{ opacity: viewportWidth ? 1 : 0 }}
              >
                {cards.map((card, i) => (
                  <S.CardSlot
                    key={card.id}
                    ref={i === 0 ? firstCardRef : undefined}
                    $active={i === currentIndex}
                  >
                    <NovelistPreviewCard key={card.username} novelist={card} />
                  </S.CardSlot>
                ))}
              </S.Track>
            </S.TrackViewport>

            <S.ArrowButton
              aria-label="Next"
              onClick={goNext}
              $hidden={currentIndex === total - 1}
            >
              <ChevronRight />
            </S.ArrowButton>
          </S.CarouselWrapper>

          {/* Dot indicators — fixed to the initial card count */}
          <S.Dots role="tablist" aria-label="Carousel position">
            {cards.map((_, i) => (
              <S.Dot
                key={i}
                $active={i === currentIndex}
                onClick={() => goToIndex(i)}
                role="tab"
                aria-selected={i === currentIndex}
                aria-label={`Go to card ${i + 1}`}
              />
            ))}
          </S.Dots>
        </>
      )}

      <S.Footer>
        <S.SkipButton type="button" onClick={handleSkip}>
          Skip for now
        </S.SkipButton>
        <S.FooterHint>
          You can always discover more novelists from the Explore page.
        </S.FooterHint>
      </S.Footer>
    </S.Root>
  );
};

export default FellowsPage;
