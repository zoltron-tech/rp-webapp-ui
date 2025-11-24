"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAllMusesByUsernameAction } from "@/app/rp/muse/actions";
import { ShouldRender } from "@/components/common";
import { MuseCard } from "@/components/muse-card";
import { useGlobalState } from "@/context/store/stores";
import { useCustomEvents, useUIContext } from "@/hooks";
import type { Muse } from "@/types";
import { INITIAL_MUSE } from "@/utils/constants";
import type {
  CustomEventType,
  MuseDeletedPayload,
} from "@/utils/constants/custom-events";
import { Logger } from "@/utils/services";
import * as S from "./styles";

export default function MusesListPage({}) {
  const params = useParams();
  const [muses, setMuses] = useState<Muse[] | null>(null);
  const authState = useGlobalState("authState");
  const user = useGlobalState("user");
  const novelist = useGlobalState("novelist");
  const username = params?.slug as string;
  const isCurrentUser = user?.username === username;
  const [_loading, setLoading] = useState(true);
  const { push } = useRouter();
  const { on, off } = useCustomEvents("muse");
  const { successToast } = useUIContext();
  Logger.debug("params are:", params);

  const fetchMuses = async () => {
    setLoading(true);
    const _muses = await getAllMusesByUsernameAction(username);

    if (!_muses || "message" in _muses) {
      // handle error
      setLoading(false);
      push("/404");
      return;
    }
    setLoading(false);
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

      setMuses(muses?.filter((muse) => muse.id !== museId) || []);
      successToast(`${name} removed successfully.`);
    };

    on("deleted", handleMuseDeleted);

    return () => {
      off("deleted", handleMuseDeleted);
    };
  }, [on]);

  return (
    <S.Container>
      <S.Maintext>
        {isCurrentUser ? "Your" : `${username}'s`} Characters
      </S.Maintext>
      <S.Subtext>
        {isCurrentUser ? `${muses?.length}/${novelist?.tier.museLimit}` : ""}
      </S.Subtext>
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
