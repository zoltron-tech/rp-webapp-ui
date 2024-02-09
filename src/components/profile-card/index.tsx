"use client";
import { getUserNovelist } from "@/app/rp/novelists/actions";
import { useAuthContext } from "@/hooks";
import { Novelist } from "@/types";
import { Logger } from "@/utils/services";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { Card } from "../common";

export type ProfileCardProps = {};

export const ProfileCard: FC<ProfileCardProps> = ({}) => {
  const { push } = useRouter();
  const [novelist, setNovelist] = useState<Novelist>();
  const { user, state } = useAuthContext();

  const fetchData = async () => {
    const fetchedNovelist = await getUserNovelist();

    if (!fetchedNovelist) {
      push("/rp/profile/edit");
      return;
    }

    setNovelist(fetchedNovelist);
  };

  useEffect(() => {
    if (state !== "LOADING" && (!user || !novelist)) {
      fetchData();
    }
  }, [state]);

  Logger.info("ProfileCard rendered");

  return <Card>Profile Card</Card>;
};
