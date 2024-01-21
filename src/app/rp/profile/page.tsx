"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks";
import { Logger } from "@/utils/services";
import { ProfileCard } from "@/components";

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
