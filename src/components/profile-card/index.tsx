"use client";
import { getUserNovelist } from "@/app/rp/novelists/actions";
import { Novelist } from "@/types";
import { Logger } from "@/utils/services";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { Card } from "../common";
import { useGlobalState } from "@/context/store/stores";

export type ProfileCardProps = {};

export const ProfileCard: FC<ProfileCardProps> = ({}) => {
  const { push } = useRouter();
  const [novelist, setNovelist] = useState<Novelist>();
  const authState = useGlobalState("authState");
  const user = useGlobalState("user");

  const fetchData = async () => {
    const fetchedNovelist = await getUserNovelist();

    if (!fetchedNovelist) {
      push("/rp/profile/edit");
      return;
    }

    setNovelist(fetchedNovelist);
  };

  useEffect(() => {
    if (authState !== "LOADING" && (!user || !novelist)) {
      fetchData();
    }
  }, [authState]);

  Logger.info("ProfileCard rendered");

  return <Card>Profile Card</Card>;
};
