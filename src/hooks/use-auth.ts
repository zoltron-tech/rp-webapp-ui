import { authenticate } from "@/app/actions";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const verify = async () => {
    const isAuthenticated = await authenticate();
    if (isLoggedIn !== isAuthenticated) setIsLoggedIn(isAuthenticated);
    return isAuthenticated;
  };

  useEffect(() => {
    verify();
  }, []);

  return {
    isLoggedIn,
    verify,
  };
};
