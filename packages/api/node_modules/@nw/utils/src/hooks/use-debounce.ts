import { useEffect, useState } from "react";

/**
 * The value, held back until it has stopped changing for `delay` ms.
 *
 * Generic rather than string-only: the picker copies this replaces were all
 * string search boxes, but `fandom-select` already needed the general form.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
