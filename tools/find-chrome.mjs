import { existsSync } from "node:fs";

/**
 * A Chrome to drive.
 *
 * `puppeteer-core` deliberately ships no browser, which keeps the install
 * small — so find the one already on the machine. Chrome first: Edge renders
 * identically but its own first-run state has surprised captures before.
 *
 * A copy of `promo-gif/lib/browser.mjs`, on purpose: the route smoke used to
 * import that file through `../../promo-gif`, reaching out of this repository
 * into a sibling one that CI has no way to check out. Thirty lines duplicated
 * is the cheaper half of that trade.
 */
const CANDIDATES = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  `${process.env.LOCALAPPDATA ?? ""}/Google/Chrome/Application/chrome.exe`,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

export const findChrome = () => {
  for (const candidate of CANDIDATES) {
    if (candidate && existsSync(candidate)) return candidate;
  }
  throw new Error(
    "No Chrome or Edge found. Set PUPPETEER_EXECUTABLE_PATH to a Chromium binary.",
  );
};
