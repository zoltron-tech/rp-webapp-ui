import { useEffect } from "react";

export const useOutsideClick = (
  refs: React.RefObject<HTMLElement | null>[],
  callback: () => void,
) =>
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutside = refs.every((ref) => {
        if (!ref.current || ref.current.contains(event.target as Node))
          return false;
        else return true;
      });

      if (isOutside) callback();
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [refs, callback]);
