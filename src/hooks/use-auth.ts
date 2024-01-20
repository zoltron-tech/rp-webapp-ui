import { authenticate, reroute } from "@/app/actions";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  const verify = async () => {
    const isAuthenticated = await authenticate();
    if (isLoggedIn !== isAuthenticated) setIsLoggedIn(isAuthenticated);
    return isAuthenticated;
  };

  const authWall = async () => {
    const isAuthenticated = await verify();
    if (!isAuthenticated) {
      reroute("/");
    }
  };

  useEffect(() => {
    verify();
  }, [pathname]);

  return {
    isLoggedIn,
    verify,
    authWall,
  };
};
