"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getAllMusesByUsernameAction } from "@/app/rp/muse/actions";
import { BreadCrumb } from "@/components/breadcrumb";
import { ShouldRender } from "@/components/common";
import { MuseCard } from "@/components/muse-card";
import { useGlobalState } from "@/context/store/stores";
import { useCustomEvents, useUIContext } from "@/hooks";
import { usePageRouter } from "@/hooks/use-page-router";
import type { Muse } from "@/types";
import { INITIAL_MUSE } from "@/utils/constants";
import {
  type CustomEventType,
  EVENTS,
  type MuseDeletedPayload,
} from "@/utils/constants/custom-events";
import * as S from "./styles";

export default function MusesListPage({}) {
  const params = useParams();
  const [muses, setMuses] = useState<Muse[] | null>(null);
  const authState = useGlobalState("authState");
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const username = params?.slug as string;
  const isCurrentUser = user?.username === username;
  const { baseDataLoader } = usePageRouter();
  const { on, off } = useCustomEvents(EVENTS.MUSE.base);
  const { successToast } = useUIContext();
  const { routeToPage } = usePageRouter();

  const fetchMuses = async () => {
    const _muses = await baseDataLoader(() =>
      getAllMusesByUsernameAction(username),
    );
    setMuses(_muses);
  };

  useEffect(() => {
    if (authState === "LOADING" || muses) return;

    fetchMuses();
  }, [authState]);

  useEffect(() => {
    const handleMuseDeleted = (e: CustomEventType<MuseDeletedPayload>) => {
      const museId = e.detail.id;
      const name = e.detail.name;

      setMuses((prev) => prev?.filter((muse) => muse.id !== museId) || []);
      successToast(`${name} removed successfully.`);
    };

    on(EVENTS.MUSE.DELETED, handleMuseDeleted);

    return () => {
      off(EVENTS.MUSE.DELETED, handleMuseDeleted);
    };
  }, [on]);

  return (
    <S.Container>
      {/* ✨ Background mesh */}
      <S.BackgroundContainer>
        {muses?.map((muse, i) => {
          // Randomize position and transform for a natural look
          const top = 5 + Math.random() * 80; // 5% → 85%
          const left = 5 + Math.random() * 80; // 5% → 85%
          const rotation = -45 + Math.random() * 90; // -45° → 45°
          const scale = 1.5 + Math.random() * 2.5; // 1.5 + 2.5 = 4.0 max

          return (
            <S.BackgroundTile
              key={i}
              image={muse.image || ""}
              top={top}
              left={left}
              rotation={rotation}
              scale={scale}
            />
          );
        })}
      </S.BackgroundContainer>
      <BreadCrumb label="Characters" username={username} />
      <S.MuseListContainer>
        <ShouldRender
          if={
            isCurrentUser &&
            muses != null &&
            novelist != null &&
            muses.length < novelist?.tier.museLimit
          }
        >
          <MuseCard disabled key={null} muse={INITIAL_MUSE}></MuseCard>
        </ShouldRender>
        {muses?.map((muse) => (
          <MuseCard key={muse?.id} muse={muse}></MuseCard>
        ))}
      </S.MuseListContainer>
    </S.Container>
  );
}
