import { useEffect, useState } from "react";

interface Dimensions {
  width: number | null;
  height: number | null;
}

export const useWindowDimensions = (): Dimensions => {
  const hasWindow = typeof window !== "undefined";

  const getWindowDimensions = (): Dimensions => {
    const width = hasWindow ? window.innerWidth : null;
    const height = hasWindow ? window.innerHeight : null;
    return {
      width,
      height,
    };
  };

  const [windowDimensions, setWindowDimensions] = useState<Dimensions>(
    getWindowDimensions(),
  );

  useEffect(() => {
    if (hasWindow) {
      const handleResize = () => setWindowDimensions(getWindowDimensions());
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [hasWindow]);

  return windowDimensions;
};
