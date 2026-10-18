import {
  type RefCallback,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * Whether an element is on screen, or about to be.
 *
 * A thread with thirty links used to fire thirty requests the moment it
 * mounted, most of them for cards below the fold the reader might never
 * reach. Each card now waits until it is within a screen's height of the
 * viewport before it asks for its data; the skeleton it shows meanwhile
 * costs nothing. Once near, always near: a card that scrolled away keeps
 * what it fetched.
 *
 * Without `IntersectionObserver` (an old browser, a test) everything counts
 * as near, which is the behaviour before this existed.
 */
const MARGIN = "600px 0px";

export const useNearViewport = (): [RefCallback<Element>, boolean] => {
  const [near, setNear] = useState(
    () => typeof IntersectionObserver === "undefined",
  );
  const observer = useRef<IntersectionObserver | null>(null);
  const node = useRef<Element | null>(null);

  const ref = useCallback<RefCallback<Element>>((element) => {
    node.current = element;
  }, []);

  useEffect(() => {
    if (near) return;
    const element = node.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.current?.disconnect();
        }
      },
      { rootMargin: MARGIN },
    );
    observer.current.observe(element);
    return () => observer.current?.disconnect();
  }, [near]);

  return [ref, near];
};
