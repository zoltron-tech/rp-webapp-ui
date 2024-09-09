"use client";

import { MuseCard } from "@/components/muse-card";
import { useAuthContext } from "@/hooks";
import { Muse } from "@/types";
import { INITIAL_MUSE } from "@/utils/constants";
import { Logger } from "@/utils/services";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as S from "./styles";
import { getAllMusesByUsernameAction } from "@/app/rp/muse/actions";
import { ShouldRender } from "@/components/common";

export default function MusesListPage({}) {
  const params = useParams();
  const [muses, setMuses] = useState<Muse[] | null>(null);
  const { state, user, novelist } = useAuthContext();
  const username = params?.slug as string;
  const isCurrentUser = user?.username === username;
  const [loading, setLoading] = useState(true);
  const { push } = useRouter();
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
    if (state === "LOADING" || muses) return;

    fetchMuses();
  }, [state]);

  return (
    <S.Container>
      <S.Maintext>{isCurrentUser ? "Your" : username + "'s"} Muses</S.Maintext>
      <S.Subtext>
        {isCurrentUser ? muses?.length + "/" + novelist?.tier.museLimit : ""}
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
        {muses &&
          muses.map((muse) => <MuseCard key={muse?.id} muse={muse}></MuseCard>)}
      </S.MuseListContainer>
    </S.Container>
  );
}
