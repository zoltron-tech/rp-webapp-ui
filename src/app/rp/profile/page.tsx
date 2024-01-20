"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks";

import styles from "./page.module.css";
import dynamic from "next/dynamic";
import { Logger } from "@/utils/services";

const DynamicProfileCard = dynamic(
  () => import("../../../components/profile-card"),
  {
    loading: () => <p>Loading...</p>,
  }
);

export default function ProfilePage({}) {
  const { authWall } = useAuth();
  const [initialRender, setInitialRender] = useState(true);

  useEffect(() => {
    if (initialRender) {
      setInitialRender(false);
      return;
    }
  }, [initialRender]);

  useEffect(() => {
    authWall();
  }, []);

  Logger.log("yaha pohanchay hain hum:");

  return (
    <div className={styles.container}>
      <DynamicProfileCard />
    </div>
  );
}
