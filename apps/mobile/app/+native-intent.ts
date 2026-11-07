import { appPathFor } from "@/lib/web-links";

/** Expo Router asks this before it resolves any link the system hands over. */
export const redirectSystemPath = ({ path }: { path: string }): string =>
  appPathFor(path);
