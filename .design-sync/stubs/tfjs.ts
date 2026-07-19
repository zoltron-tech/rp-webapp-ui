// Browser-preview stub for @tensorflow/tfjs — NSFW model never loads in cards.
export const setBackend = async (_b: string) => false;
export const ready = async () => {};
export const tidy = (fn: () => unknown) => fn();
export const zeros = (_shape: number[]) => ({ dispose: () => {} });
export const browser = { fromPixels: () => ({ dispose: () => {} }) };
export const dispose = () => {};
export default { setBackend, ready, tidy, zeros, browser, dispose };
