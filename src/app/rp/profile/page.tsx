"use client";

import { ProfileCard } from "@/components";
import { useAuth } from "@/hooks";
import { Logger } from "@/utils/services";
import { useEffect, useState } from "react";

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
    <div>
      <ProfileCard />
    </div>
  );
}
