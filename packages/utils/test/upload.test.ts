import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatBytes } from "../src/bytes.ts";
import {
  capForType,
  checkUploadAllowance,
  countRichTextMedia,
  countsTowardStorage,
  fileTooLargeMessage,
  MAX_POST_MEDIA,
  tooManyMediaMessage,
  type UploadPurpose,
  oversizeMessage,
  uploadCapsHint,
  formatResetIn,
  secondsToUtcMidnight,
  storageDailySummary,
  storageExplainer,
  storageSummary,
  storageUsedRatio,
  type StorageUsage,
  UPLOAD_FAILED_MESSAGE,
  uploadCapsLine,
  uploadRefusalMessage,
} from "../src/upload.ts";

const MB = 1024 * 1024;
const GB = 1024 * MB;

describe("formatBytes", () => {
  it("prints megabytes below a gigabyte", () => {
    assert.equal(formatBytes(340 * MB), "340 MB");
    assert.equal(formatBytes(500 * MB), "500 MB");
    assert.equal(formatBytes(120.4 * MB), "120 MB");
  });

  it("prints gigabytes with one decimal, dropping .0", () => {
    assert.equal(formatBytes(2 * GB), "2 GB");
    assert.equal(formatBytes(1.5 * GB), "1.5 GB");
    assert.equal(formatBytes(1.04 * GB), "1 GB");
    assert.equal(formatBytes(1.96 * GB), "2 GB");
  });

  it("never says 0 MB for something, nor 1024 MB", () => {
    assert.equal(formatBytes(200 * 1024), "<1 MB");
    assert.equal(formatBytes(1023.7 * MB), "1 GB");
  });

  it("treats nothing and nonsense as 0 MB", () => {
    for (const value of [0, -5, Number.NaN, null, undefined]) {
      assert.equal(formatBytes(value as number), "0 MB");
    }
  });
});

const CAPS = {
  audio: 50 * MB,
  image: 30 * MB,
  other: 40 * MB,
  video: 60 * MB,
};

describe("capForType", () => {
  it("maps each family to the service's cap", () => {
    assert.equal(capForType("image/png", CAPS), 30 * MB);
    assert.equal(capForType("IMAGE/JPEG", CAPS), 30 * MB);
    assert.equal(capForType("video/mp4", CAPS), 60 * MB);
    assert.equal(capForType("audio/mpeg", CAPS), 50 * MB);
    assert.equal(capForType("application/pdf", CAPS), 40 * MB);
    assert.equal(capForType(null, CAPS), 40 * MB);
    assert.equal(capForType("", CAPS), 40 * MB);
  });

  it("refuses nothing while the caps are unknown", () => {
    assert.equal(capForType("image/png", null), Number.POSITIVE_INFINITY);
    assert.equal(capForType("image/png", undefined), Number.POSITIVE_INFINITY);
    assert.equal(capForType("image/png", {}), Number.POSITIVE_INFINITY);
  });

  it("ignores a family value that is not a positive number", () => {
    for (const image of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      assert.equal(
        capForType("image/png", { ...CAPS, image }),
        Number.POSITIVE_INFINITY,
        String(image),
      );
    }
    assert.equal(
      capForType("image/png", { ...CAPS, image: "30" as unknown as number }),
      Number.POSITIVE_INFINITY,
    );
  });

  it("oversizeMessage names the cap only when the file is over it", () => {
    assert.equal(
      oversizeMessage({ size: 31 * MB, type: "image/png" }, CAPS),
      "File too large (max 30 MB).",
    );
    assert.equal(fileTooLargeMessage(30 * MB), "File too large (max 30 MB).");
    assert.equal(
      oversizeMessage({ size: 30 * MB, type: "image/png" }, CAPS),
      null,
    );
    assert.equal(
      oversizeMessage({ size: 999 * MB, type: "image/png" }, null),
      null,
    );
  });
});

describe("uploadCapsHint", () => {
  it("prints one cap when the families share it, else each", () => {
    assert.equal(uploadCapsHint(CAPS, ["image"]), "max 30 MB");
    assert.equal(
      uploadCapsHint(CAPS, ["image", "video"]),
      "max 30 MB per image, 60 MB per video",
    );
    assert.equal(
      uploadCapsHint({ ...CAPS, video: 30 * MB }, ["image", "video"]),
      "max 30 MB",
    );
  });

  it("is null without caps, and skips a family with none", () => {
    assert.equal(uploadCapsHint(null, ["image"]), null);
    assert.equal(uploadCapsHint({ image: 0 }, ["image"]), null);
    assert.equal(uploadCapsHint({ video: 60 * MB }, ["image", "video"]), "max 60 MB");
  });
});

describe("checkUploadAllowance", () => {
  const usage = (
    overrides: Partial<StorageUsage> = {},
    limits: Partial<NonNullable<StorageUsage["limits"]>> = {},
  ): StorageUsage => ({
    dailyFiles: 3,
    dailyFilesLimit: 200,
    dailyLimitBytes: 500 * MB,
    dailyUsedBytes: 100 * MB,
    limitBytes: 2 * GB,
    limits: {
      caps: CAPS,
      chatMediaHost: null,
      enforce: true,
      mediaHost: null,
      ...limits,
    },
    resetsAt: "2026-11-09T00:00:00Z",
    usedBytes: 1 * GB,
    ...overrides,
  });
  const code = (size: number, u: StorageUsage | null, type = "image/png") =>
    checkUploadAllowance({ size, type }, u)?.code ?? null;

  it("lets a file under every limit go", () => {
    assert.equal(code(5 * MB, usage()), null);
  });

  it("refuses nothing when the usage is unknown", () => {
    assert.equal(code(5 * GB, null), null);
  });

  it("checks the family cap first", () => {
    const refusal = checkUploadAllowance(
      { size: 31 * MB, type: "image/png" },
      usage({ usedBytes: 2 * GB }),
    );
    assert.equal(refusal?.code, "size_over_cap");
    assert.equal(refusal?.status, 413);
    assert.equal(refusal?.refused, true);
    assert.equal(code(55 * MB, usage(), "video/mp4"), null);
  });

  it("refuses past the storage room, then the daily room, then the file count", () => {
    assert.equal(
      code(20 * MB, usage({ usedBytes: 2 * GB - 10 * MB })),
      "storage_full",
    );
    assert.equal(
      code(20 * MB, usage({ dailyUsedBytes: 490 * MB })),
      "upload_daily_limit",
    );
    assert.equal(code(1, usage({ dailyFiles: 200 })), "upload_daily_limit");
    // Exactly the room left is allowed.
    assert.equal(code(10 * MB, usage({ usedBytes: 2 * GB - 10 * MB })), null);
  });

  it("checks only the cap while enforcement is off", () => {
    const off = (overrides: Partial<StorageUsage>) =>
      usage(overrides, { enforce: false });
    assert.equal(code(20 * MB, off({ usedBytes: 3 * GB })), null);
    assert.equal(code(20 * MB, off({ dailyUsedBytes: 500 * MB })), null);
    assert.equal(code(1, off({ dailyFiles: 500 })), null);
    assert.equal(code(31 * MB, off({})), "size_over_cap");
  });

  it("checks no cap (none known) without a limits object", () => {
    assert.equal(
      code(5 * GB, usage({ limits: null, usedBytes: 3 * GB })),
      null,
    );
  });

  it("exempts post and storyboard uploads from the storage total only", () => {
    const full = usage({ usedBytes: 2 * GB });
    const of = (purpose?: UploadPurpose, size = 5 * MB, u = full) =>
      checkUploadAllowance({ size, type: "image/png" }, u, purpose)?.code ??
      null;
    // Personal, explicit or by default, still counts.
    assert.equal(of(undefined), "storage_full");
    assert.equal(of("personal"), "storage_full");
    // Post and storyboard media do not; a storyboard's own room is the service's.
    assert.equal(of("post"), null);
    assert.equal(of("storyboard"), null);
    // The family cap and the daily limits still apply to both.
    assert.equal(of("post", 31 * MB), "size_over_cap");
    assert.equal(of("storyboard", 31 * MB), "size_over_cap");
    const dayBytes = usage({ dailyUsedBytes: 499 * MB, usedBytes: 2 * GB });
    assert.equal(of("post", 5 * MB, dayBytes), "upload_daily_limit");
    const dayFiles = usage({ dailyFiles: 200, usedBytes: 2 * GB });
    assert.equal(of("storyboard", 1, dayFiles), "upload_daily_limit");
    // Enforcement off: nothing but the cap, whatever the purpose.
    const off = usage(
      { dailyFiles: 999, usedBytes: 9 * GB },
      { enforce: false },
    );
    assert.equal(of("post", 5 * MB, off), null);
    assert.equal(of("storyboard", 31 * MB, off), "size_over_cap");
  });

  it("knows which purposes count toward storage", () => {
    assert.equal(countsTowardStorage(undefined), true);
    assert.equal(countsTowardStorage(null), true);
    assert.equal(countsTowardStorage("personal"), true);
    assert.equal(countsTowardStorage("post"), false);
    assert.equal(countsTowardStorage("storyboard"), false);
  });

  it("ignores limits the service reports as 0", () => {
    assert.equal(
      code(
        5 * MB,
        usage({ dailyFilesLimit: 0, dailyLimitBytes: 0, limitBytes: 0 }),
      ),
      null,
    );
  });
});

describe("uploadRefusalMessage", () => {
  it("names the configured total for storage_full", () => {
    assert.equal(
      uploadRefusalMessage(
        { code: "storage_full", retryAfterSeconds: null },
        { limitBytes: 2 * GB },
      ),
      "You've used all 2 GB of your storage. Delete some media to make room.",
    );
    assert.equal(
      uploadRefusalMessage(
        { code: "storage_full", retryAfterSeconds: null },
        { limitBytes: 5 * GB },
      ),
      "You've used all 5 GB of your storage. Delete some media to make room.",
    );
  });

  it("leaves the number out when the total is unknown", () => {
    assert.equal(
      uploadRefusalMessage({ code: "storage_full", retryAfterSeconds: null }),
      "You've used all of your storage. Delete some media to make room.",
    );
  });

  it("reads Retry-After for the daily limit, rounding up", () => {
    const message = (seconds: number) =>
      uploadRefusalMessage({
        code: "upload_daily_limit",
        retryAfterSeconds: seconds,
      });
    assert.equal(
      message(5 * 3600),
      "You've reached today's upload limit. It resets in 5 h.",
    );
    assert.equal(
      message(4 * 3600 + 1),
      "You've reached today's upload limit. It resets in 5 h.",
    );
    assert.equal(
      message(40 * 60),
      "You've reached today's upload limit. It resets in 40 min.",
    );
  });

  it("falls back to the next UTC midnight without Retry-After", () => {
    const now = new Date("2026-11-08T19:00:00Z");
    assert.equal(secondsToUtcMidnight(now), 5 * 3600);
    assert.equal(
      uploadRefusalMessage(
        { code: "upload_daily_limit", retryAfterSeconds: null },
        { now },
      ),
      "You've reached today's upload limit. It resets in 5 h.",
    );
  });

  it("counts down to resetsAt for a refusal made before any upload", () => {
    assert.equal(
      uploadRefusalMessage(
        { code: "upload_daily_limit", retryAfterSeconds: null },
        {
          now: new Date("2026-11-08T21:30:00Z"),
          resetsAt: "2026-11-09T00:00:00Z",
        },
      ),
      "You've reached today's upload limit. It resets in 3 h.",
    );
    // A resetsAt already past falls back to the next UTC midnight.
    assert.equal(
      uploadRefusalMessage(
        { code: "upload_daily_limit", retryAfterSeconds: null },
        {
          now: new Date("2026-11-08T19:00:00Z"),
          resetsAt: "2026-11-08T00:00:00Z",
        },
      ),
      "You've reached today's upload limit. It resets in 5 h.",
    );
  });

  it("names the service's cap for size_over_cap", () => {
    const refusal = { code: "size_over_cap", retryAfterSeconds: null };
    assert.equal(
      uploadRefusalMessage(refusal, { capBytes: 30 * MB }),
      "File too large (max 30 MB).",
    );
    assert.equal(
      uploadRefusalMessage(refusal, { capBytes: 200 * MB }),
      "File too large (max 200 MB).",
    );
    assert.equal(
      uploadRefusalMessage(refusal, { capBytes: Number.POSITIVE_INFINITY }),
      "This file is too large to upload.",
    );
    assert.equal(
      uploadRefusalMessage(refusal),
      "This file is too large to upload.",
    );
  });

  it("words the unavailable, rejected and unsupported refusals", () => {
    const line = (code: string) =>
      uploadRefusalMessage({ code, retryAfterSeconds: null });
    assert.equal(
      line("upload_unavailable"),
      "Uploads are paused for a moment. Please try again.",
    );
    assert.equal(
      line("media_rejected"),
      "This image appears to contain sexual content, which isn't allowed on Novelist World.",
    );
    assert.equal(line("unsupported_type"), "This type of file can't be uploaded.");
  });

  it("words storyboard_full, with the storyboard's limit when known", () => {
    const refusal = { code: "storyboard_full", retryAfterSeconds: null };
    assert.equal(
      uploadRefusalMessage(refusal),
      "This storyboard has used all of its storage. Delete some media from the storyboard to make room.",
    );
    assert.equal(
      uploadRefusalMessage(refusal, { storyboardLimitBytes: 500 * MB }),
      "This storyboard has used all 500 MB of its storage. Delete some media from the storyboard to make room.",
    );
    // The account's total is not the storyboard's: never borrowed.
    assert.equal(
      uploadRefusalMessage(refusal, { limitBytes: 2 * GB }),
      "This storyboard has used all of its storage. Delete some media from the storyboard to make room.",
    );
    assert.equal(
      uploadRefusalMessage(refusal, { storyboardLimitBytes: Number.NaN }),
      "This storyboard has used all of its storage. Delete some media from the storyboard to make room.",
    );
  });

  it("words too_many_media with the post limit", () => {
    assert.equal(
      uploadRefusalMessage({ code: "too_many_media", retryAfterSeconds: null }),
      "You can add up to 5 images or videos to a post.",
    );
  });

  it("gives an unknown code the generic line, never server text", () => {
    assert.equal(
      uploadRefusalMessage({ code: "<b>new_code</b>", retryAfterSeconds: 9 }),
      UPLOAD_FAILED_MESSAGE,
    );
  });

  it("formats reset times", () => {
    assert.equal(formatResetIn(1), "1 min");
    assert.equal(formatResetIn(3600), "1 h");
    assert.equal(formatResetIn(0), "1 min");
  });
});

describe("storage row copy", () => {
  const usage = {
    dailyFiles: 3,
    dailyFilesLimit: 200,
    dailyLimitBytes: 500 * MB,
    dailyUsedBytes: 120 * MB,
    limitBytes: 2 * GB,
    resetsAt: "2026-11-09T00:00:00Z",
    usedBytes: 340 * MB,
  };

  it("summarises used of total", () => {
    assert.equal(storageSummary(usage), "340 MB of 2 GB");
  });

  it("shows the daily line only when something went up today", () => {
    assert.equal(
      storageDailySummary(usage),
      "Today: 120 MB of 500 MB uploaded",
    );
    assert.equal(storageDailySummary({ ...usage, dailyUsedBytes: 0 }), null);
    assert.equal(storageDailySummary({ ...usage, dailyLimitBytes: 0 }), null);
  });

  it("clamps the bar ratio", () => {
    assert.equal(storageUsedRatio({ limitBytes: 100, usedBytes: 90 }), 0.9);
    assert.equal(storageUsedRatio({ limitBytes: 100, usedBytes: 250 }), 1);
    assert.equal(storageUsedRatio({ limitBytes: 0, usedBytes: 5 }), 0);
  });

  it("explains what counts, deleting, and the daily reset", () => {
    const { lines, title } = storageExplainer(usage);
    assert.equal(title, "Storage");
    assert.equal(lines.length, 3);
    assert.match(lines[0], /2 GB/);
    assert.match(
      lines[0],
      /chats, posts, comments, replies and storyboards doesn't count/,
    );
    assert.match(lines[1], /Deleting media/);
    assert.match(lines[2], /500 MB or 200 files/);
    assert.match(lines[2], /It resets at /);
  });

  it("adds the service's caps, and no number it did not send", () => {
    const { lines } = storageExplainer({
      ...usage,
      limits: {
        caps: CAPS,
        chatMediaHost: null,
        enforce: false,
        mediaHost: null,
      },
    });
    assert.equal(lines.length, 4);
    assert.equal(
      lines[2],
      "Images up to 30 MB, video up to 60 MB, audio up to 50 MB, other files up to 40 MB.",
    );
    assert.equal(storageExplainer({ ...usage, limits: null }).lines.length, 3);
    assert.equal(uploadCapsLine(null), null);
    assert.equal(uploadCapsLine({ video: 200 * MB }), "Video up to 200 MB.");
  });
});

describe("post media cap", () => {
  it("is five, with copy per kind", () => {
    assert.equal(MAX_POST_MEDIA, 5);
    assert.equal(
      tooManyMediaMessage(),
      "You can add up to 5 images or videos to a post.",
    );
    assert.equal(
      tooManyMediaMessage("prompt"),
      "You can add up to 5 images or videos to a post.",
    );
    assert.equal(
      tooManyMediaMessage("comment"),
      "You can add up to 5 images or videos to a comment.",
    );
    assert.equal(
      tooManyMediaMessage("reply"),
      "You can add up to 5 images or videos to a reply.",
    );
  });

  it("counts pictures, GIFs, video and audio in a body", () => {
    assert.equal(countRichTextMedia(null), 0);
    assert.equal(countRichTextMedia(""), 0);
    assert.equal(countRichTextMedia("<p>just words</p>"), 0);
    const body = [
      '<div><span class="inline-image-container"><img src="https://x/a.png" class="inline-image" data-width-pct="50"></span></div>',
      '<div><img src="https://static.klipy.com/b.gif" class="inline-image"></div>',
      '<div><img src="https://x/c.png" alt="plain"></div>',
      '<video src="https://x/d.mp4"></video>',
      "<AUDIO src='https://x/e.mp3'></AUDIO>",
    ].join("");
    assert.equal(countRichTextMedia(body), 5);
  });

  it("leaves mention and dialog avatars out", () => {
    const body =
      '<p><span class="mention-tag"><img src="https://x/u.png" alt="U" class="mention-avatar"><span class="mention-text">U</span></span></p>' +
      "<p><img class='dialog-avatar' src='https://x/m.png'></p>" +
      '<p><img class="inline-image" src="https://x/a.png"></p>';
    assert.equal(countRichTextMedia(body), 1);
  });
});
