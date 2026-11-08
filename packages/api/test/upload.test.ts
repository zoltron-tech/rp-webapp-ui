import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { API_MESSAGE } from "@nw/types";
import type { ApiClient } from "../src/client.ts";
import { isUploadRefusal, toMediaUrl } from "@nw/utils";
import {
  checkUploadAllowed,
  describeUploadRefusal,
  getStorageUsage,
  getUploadCaps,
  invalidateStorageUsage,
  loadStorageUsage,
  readUploadLimits,
  readUploadRefusal,
  requestPresignedUpload,
} from "../src/endpoints/profile.ts";

/** An ApiClient whose `raw` records the path and answers with `respond`. */
const fakeApi = (respond: (path: string) => Response) => {
  const paths: string[] = [];
  const api = {
    raw: async (path: string) => {
      paths.push(path);
      return respond(path);
    },
  } as unknown as ApiClient;
  return { api, paths };
};

const json = (status: number, body: unknown, headers?: HeadersInit) =>
  new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json", ...headers },
    status,
  });

const PRESIGNED = {
  fileUrl: "https://rp-webapp-ui.s3.amazonaws.com/k.png",
  method: "PUT",
  uploadUrl: "https://signed.example/k.png",
};

describe("requestPresignedUpload", () => {
  it("sends the exact size", async () => {
    const { api, paths } = fakeApi(() => json(200, PRESIGNED));
    const result = await requestPresignedUpload(api, {
      contentType: "image/png",
      size: 12345,
    });
    assert.deepEqual(result, PRESIGNED);
    const query = new URLSearchParams(paths[0].split("?")[1]);
    assert.equal(query.get("size"), "12345");
    assert.equal(query.get("contentType"), "image/png");
  });

  it("sends no purpose for a personal upload (the default)", async () => {
    for (const purpose of [undefined, null, "personal"] as const) {
      const { api, paths } = fakeApi(() => json(200, PRESIGNED));
      await requestPresignedUpload(api, {
        contentType: "image/png",
        prefix: "muse-1",
        purpose,
        size: 10,
      });
      const query = new URLSearchParams(paths[0].split("?")[1]);
      assert.equal(query.get("purpose"), null, String(purpose));
      assert.equal(query.get("prefix"), "muse-1");
      assert.equal(query.get("scoped"), null);
    }
  });

  it("sends purpose=post and keeps the account prefix (scoped)", async () => {
    const { api, paths } = fakeApi(() => json(200, PRESIGNED));
    await requestPresignedUpload(api, {
      contentType: "image/png",
      purpose: "post",
      size: 10,
      storyboardId: "ignored-for-posts",
    });
    const query = new URLSearchParams(paths[0].split("?")[1]);
    assert.equal(query.get("purpose"), "post");
    assert.equal(query.get("prefix"), null);
    assert.equal(query.get("scoped"), null);
  });

  it("sends purpose=storyboard with the storyboard id as prefix and scoped=false", async () => {
    const { api, paths } = fakeApi(() => json(200, PRESIGNED));
    const result = await requestPresignedUpload(api, {
      contentType: "image/png",
      // Whatever the caller had: the storyboard id wins.
      prefix: "story-codex",
      purpose: "storyboard",
      scoped: true,
      size: 10,
      storyboardId: "sb-42",
    });
    assert.deepEqual(result, PRESIGNED);
    const query = new URLSearchParams(paths[0].split("?")[1]);
    assert.equal(query.get("purpose"), "storyboard");
    assert.equal(query.get("prefix"), "sb-42");
    assert.equal(query.get("scoped"), "false");
    assert.equal(query.get("mediaBucket"), "APP_MEDIA");
  });

  it("never sends a storyboard upload without a storyboard id", async () => {
    for (const storyboardId of [undefined, null, "", "  "]) {
      const { api, paths } = fakeApi(() => json(200, PRESIGNED));
      const result = await requestPresignedUpload(api, {
        contentType: "image/png",
        prefix: "fallback",
        purpose: "storyboard",
        storyboardId,
      });
      assert.equal(result, API_MESSAGE.MediaError);
      assert.equal(paths.length, 0, String(storyboardId));
    }
  });

  it("returns 413 storyboard_full as a refusal", async () => {
    const { api } = fakeApi(() =>
      json(413, { code: "storyboard_full", message: "x" }),
    );
    const result = await requestPresignedUpload(api, {
      contentType: "image/png",
      purpose: "storyboard",
      storyboardId: "sb-1",
    });
    assert.ok(isUploadRefusal(result));
    assert.equal(result.code, "storyboard_full");
    assert.equal(result.status, 413);
  });

  it("leaves size out when unknown (transition)", async () => {
    for (const size of [undefined, null, 0, -1, Number.NaN]) {
      const { api, paths } = fakeApi(() => json(200, PRESIGNED));
      await requestPresignedUpload(api, { contentType: "image/png", size });
      assert.ok(!paths[0].includes("size="), String(size));
    }
  });

  it("returns a refusal for 413/429 with a code", async () => {
    const { api } = fakeApi(() =>
      json(
        429,
        { code: "upload_daily_limit", message: "nope" },
        { "Retry-After": "18000" },
      ),
    );
    const result = await requestPresignedUpload(api, {
      contentType: "image/png",
      size: 1,
    });
    assert.deepEqual(result, {
      code: "upload_daily_limit",
      refused: true,
      retryAfterSeconds: 18000,
      status: 429,
    });
  });

  it("returns MediaError for other failures", async () => {
    const { api } = fakeApi(() => json(500, {}));
    assert.equal(
      await requestPresignedUpload(api, { contentType: "image/png" }),
      "media_error",
    );
  });
});

describe("readUploadRefusal", () => {
  it("reads storage_full and size_over_cap", async () => {
    assert.equal(
      (await readUploadRefusal(json(413, { code: "storage_full" })))?.code,
      "storage_full",
    );
    assert.equal(
      (await readUploadRefusal(json(413, { code: "size_over_cap" })))?.code,
      "size_over_cap",
    );
  });

  it("treats a 413 with no JSON code (nginx) as size_over_cap", async () => {
    const html = new Response("<html>413</html>", { status: 413 });
    assert.equal((await readUploadRefusal(html))?.code, "size_over_cap");
  });

  it("reads 503 upload_unavailable and a bare 415 as unsupported_type", async () => {
    assert.equal(
      (await readUploadRefusal(json(503, { code: "upload_unavailable" })))?.code,
      "upload_unavailable",
    );
    assert.equal(
      (await readUploadRefusal(new Response(null, { status: 415 })))?.code,
      "unsupported_type",
    );
  });

  it("ignores a 429 or 503 with no code and every other status", async () => {
    assert.equal(await readUploadRefusal(new Response("", { status: 429 })), null);
    assert.equal(await readUploadRefusal(new Response("", { status: 503 })), null);
    assert.equal(await readUploadRefusal(json(400, { code: "storage_full" })), null);
    assert.equal(await readUploadRefusal(json(500, {})), null);
  });
});

describe("getStorageUsage", () => {
  const body = {
    dailyFiles: 3,
    dailyFilesLimit: 200,
    dailyLimitBytes: 524288000,
    dailyUsedBytes: 125829120,
    limitBytes: 2147483648,
    resetsAt: "2026-11-09T00:00:00Z",
    usedBytes: 356515840,
  };

  it("returns the contract's fields", async () => {
    const { api, paths } = fakeApi(() => json(200, body));
    assert.deepEqual(await getStorageUsage(api), { ...body, limits: null });
    assert.ok(paths[0].endsWith("/s3/usage"));
  });

  it("reads the limits object", async () => {
    const limits = {
      caps: { audio: 3, image: 1, other: 4, video: 2 },
      chatMediaHost: null,
      enforce: true,
      mediaHost: "media.novelist.world",
    };
    const usage = await getStorageUsage(
      fakeApi(() => json(200, { ...body, limits })).api,
    );
    // A service that predates the storyboard limit reads it as null.
    assert.deepEqual(usage?.limits, { ...limits, storyboardLimitBytes: null });
    const withStoryboard = await getStorageUsage(
      fakeApi(() =>
        json(200, {
          ...body,
          limits: { ...limits, storyboardLimitBytes: 524288000 },
        }),
      ).api,
    );
    assert.equal(withStoryboard?.limits?.storyboardLimitBytes, 524288000);
  });

  it("is null on failure or without the totals", async () => {
    assert.equal(await getStorageUsage(fakeApi(() => json(500, {})).api), null);
    assert.equal(
      await getStorageUsage(fakeApi(() => json(200, { usedBytes: 1 })).api),
      null,
    );
    assert.equal(
      await getStorageUsage(
        fakeApi(() => {
          throw new Error("offline");
        }).api,
      ),
      null,
    );
  });

  it("defaults missing daily figures to 0", async () => {
    const usage = await getStorageUsage(
      fakeApi(() => json(200, { limitBytes: 10, usedBytes: 5 })).api,
    );
    assert.equal(usage?.dailyUsedBytes, 0);
    assert.equal(usage?.resetsAt, "");
  });
});

describe("readUploadLimits", () => {
  it("is null without an object", () => {
    for (const value of [undefined, null, "x", 3]) {
      assert.equal(readUploadLimits(value), null);
    }
  });

  it("zeroes unusable caps, drops all-unusable caps, defaults enforce off", () => {
    assert.deepEqual(
      readUploadLimits({
        caps: { audio: -1, image: 10, other: "9", video: Number.NaN },
        chatMediaHost: "  ",
        mediaHost: 5,
      }),
      {
        caps: { audio: 0, image: 10, other: 0, video: 0 },
        chatMediaHost: null,
        enforce: false,
        mediaHost: null,
        storyboardLimitBytes: null,
      },
    );
    for (const bad of [0, -1, "5", Number.NaN, null]) {
      assert.equal(
        readUploadLimits({ storyboardLimitBytes: bad })?.storyboardLimitBytes,
        null,
        String(bad),
      );
    }
    assert.equal(readUploadLimits({ caps: { image: 0 } })?.caps, null);
    assert.equal(readUploadLimits({ enforce: "true" })?.enforce, false);
  });
});

describe("the cached limits loader", () => {
  const MB = 1024 * 1024;
  const usageBody = (overrides: Record<string, unknown> = {}) => ({
    dailyFiles: 0,
    dailyFilesLimit: 200,
    dailyLimitBytes: 500 * MB,
    dailyUsedBytes: 0,
    limitBytes: 2048 * MB,
    limits: {
      caps: { audio: 50 * MB, image: 30 * MB, other: 50 * MB, video: 50 * MB },
      chatMediaHost: null,
      enforce: false,
      mediaHost: null,
    },
    resetsAt: "2026-11-09T00:00:00Z",
    usedBytes: 0,
    ...overrides,
  });

  it("reads once within the TTL, again when fresh or invalidated", async () => {
    invalidateStorageUsage();
    const { api, paths } = fakeApi(() => json(200, usageBody()));
    await loadStorageUsage(api);
    await loadStorageUsage(api);
    assert.equal(paths.length, 1);
    await loadStorageUsage(api, { fresh: true });
    assert.equal(paths.length, 2);
    invalidateStorageUsage();
    await getUploadCaps(api);
    assert.equal(paths.length, 3);
  });

  it("does not keep a failed read", async () => {
    invalidateStorageUsage();
    const { api, paths } = fakeApi(() => json(500, {}));
    assert.equal(await getUploadCaps(api), null);
    assert.equal(await getUploadCaps(api), null);
    assert.equal(paths.length, 2);
  });

  it("checks the cap always, storage and daily only while enforced", async () => {
    invalidateStorageUsage();
    const full = { dailyFiles: 200, usedBytes: 2048 * MB };
    const off = fakeApi(() => json(200, usageBody(full))).api;
    assert.equal(
      await checkUploadAllowed(off, { size: 5 * MB, type: "image/png" }),
      null,
    );
    assert.equal(
      (await checkUploadAllowed(off, { size: 31 * MB, type: "image/png" }))
        ?.code,
      "size_over_cap",
    );
    invalidateStorageUsage();
    const limits = { ...usageBody().limits, enforce: true };
    const on = fakeApi(() => json(200, usageBody({ ...full, limits }))).api;
    assert.equal(
      (await checkUploadAllowed(on, { size: 5 * MB, type: "image/png" }))?.code,
      "storage_full",
    );
  });

  it("exempts post and storyboard uploads from the storage total, not from the cap or the day", async () => {
    invalidateStorageUsage();
    const limits = { ...usageBody().limits, enforce: true };
    const full = fakeApi(() =>
      json(200, usageBody({ limits, usedBytes: 2048 * MB })),
    ).api;
    const file = { size: 5 * MB, type: "image/png" };
    assert.equal((await checkUploadAllowed(full, file))?.code, "storage_full");
    assert.equal(await checkUploadAllowed(full, file, "post"), null);
    assert.equal(await checkUploadAllowed(full, file, "storyboard"), null);
    assert.equal(
      (
        await checkUploadAllowed(
          full,
          { size: 31 * MB, type: "image/png" },
          "storyboard",
        )
      )?.code,
      "size_over_cap",
    );
    invalidateStorageUsage();
    const dayUsed = fakeApi(() =>
      json(200, usageBody({ dailyFiles: 200, limits })),
    ).api;
    assert.equal(
      (await checkUploadAllowed(dayUsed, file, "post"))?.code,
      "upload_daily_limit",
    );
  });

  it("words storyboard_full with the storyboard's limit when the service sends it", async () => {
    invalidateStorageUsage();
    const refusal = {
      code: "storyboard_full",
      refused: true as const,
      retryAfterSeconds: null,
      status: 413,
    };
    const without = fakeApi(() => json(200, usageBody())).api;
    assert.equal(
      await describeUploadRefusal(without, refusal),
      "This storyboard has used all of its storage. Delete some media from the storyboard to make room.",
    );
    invalidateStorageUsage();
    const limits = { ...usageBody().limits, storyboardLimitBytes: 500 * MB };
    const withLimit = fakeApi(() => json(200, usageBody({ limits }))).api;
    assert.equal(
      await describeUploadRefusal(withLimit, refusal),
      "This storyboard has used all 500 MB of its storage. Delete some media from the storyboard to make room.",
    );
  });

  it("refuses nothing when the limits cannot be read", async () => {
    invalidateStorageUsage();
    const api = fakeApi(() => json(500, {})).api;
    assert.equal(
      await checkUploadAllowed(api, { size: 999 * MB, type: "image/png" }),
      null,
    );
  });

  it("words a refusal with the service's numbers", async () => {
    invalidateStorageUsage();
    const api = fakeApi(() => json(200, usageBody())).api;
    assert.equal(
      await describeUploadRefusal(
        api,
        { code: "size_over_cap", refused: true, retryAfterSeconds: null, status: 413 },
        "image/png",
      ),
      "File too large (max 30 MB).",
    );
    assert.equal(
      await describeUploadRefusal(api, {
        code: "storage_full",
        refused: true,
        retryAfterSeconds: null,
        status: 413,
      }),
      "You've used all 2 GB of your storage. Delete some media to make room.",
    );
  });

  it("hands the service's media hosts to toMediaUrl", async () => {
    invalidateStorageUsage();
    const limits = {
      ...usageBody().limits,
      chatMediaHost: "chat.novelist.world",
      mediaHost: "media.novelist.world",
    };
    await loadStorageUsage(fakeApi(() => json(200, usageBody({ limits }))).api);
    assert.equal(
      toMediaUrl("https://rp-webapp-ui.s3.amazonaws.com/app-media/a.png"),
      "https://media.novelist.world/app-media/a.png",
    );
    assert.equal(
      toMediaUrl("https://rp-webapp-ui.s3.amazonaws.com/chat-media/c/a.png"),
      "https://chat.novelist.world/chat-media/c/a.png",
    );
    // Cleared again by a read whose hosts are null.
    invalidateStorageUsage();
    await loadStorageUsage(fakeApi(() => json(200, usageBody())).api);
    assert.equal(
      toMediaUrl("https://rp-webapp-ui.s3.amazonaws.com/app-media/a.png"),
      "https://rp-webapp-ui.s3.amazonaws.com/app-media/a.png",
    );
  });
});
