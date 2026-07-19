// Browser-preview stub for nsfwjs — classification unavailable in cards;
// load() rejects so callers fall into their existing error paths.
export type NSFWJS = { classify: (el: unknown) => Promise<never[]>; model: unknown };
export const load = async (_url?: string): Promise<NSFWJS> => {
  throw new Error("nsfwjs unavailable in preview");
};
export default { load };
