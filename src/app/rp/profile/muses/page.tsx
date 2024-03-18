"use client";
import { useAuthContext } from "@/hooks";
import { Logger } from "@/utils/services";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Muse } from "@/types";
import { getAllMusesAction } from "../../muse/actions";
import { MuseCard } from "@/components/muse-card";
import * as S from "./styles";

export default function MusesListPage({}) {
  const params = useParams();
  const [muses, setMuses] = useState<Muse[] | null>(null);
  const { state } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const { push } = useRouter();
  Logger.debug("params are:", params);

  const onAuthorAvatarClick = (muse: Muse) => {
    const museId = muse.id;
    if (museId) push(`/rp/muse/${museId}`);
  };

  const fetchMuses = async () => {
    setLoading(true);
    const _muses = await getAllMusesAction();

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
    <S.MuseListContainer>
      {muses &&
        muses.map((muse) => <MuseCard key={muse?.id} muse={muse}></MuseCard>)}
    </S.MuseListContainer>
  );
}
