/**
 * The spell-check dictionary's two files are bundled as assets (see
 * `metro.config.js` `assetExts`), so importing one yields Metro's asset
 * module id, which `expo-asset` resolves to a local file.
 */
declare module "*.aff" {
  const id: number;
  export default id;
}

declare module "*.dic" {
  const id: number;
  export default id;
}
