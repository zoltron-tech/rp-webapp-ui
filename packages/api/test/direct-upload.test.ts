import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { ApiClient } from "../src/client.ts";
import {
  confirmUpload,
  type DirectUploadTarget,
  putWithFetch,
  uploadMediaDirect,
} from "../src/endpoints/profile.ts";

const json = (status: number, body: unknown, headers?: HeadersInit) =>
  new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json", ...headers },
    status,
  });

const PRESIGNED = {
  fileUrl: "https://rp-webapp-ui.s3.amazonaws.com/app-media/u/k.png",
  method: "PUT",
  uploadUrl: "https://signed.example/app-media/u/k.png?X-Amz-Signature=x",
};

const MB = 1024 * 1024;

const USAGE = {
  dailyFiles: 0,
  dailyFilesLimit: 200,
  dailyLimitBytes: 500 * MB,
  dailyUsedBytes: 0,
  limitBytes: 2048 * MB,
  limits: {
    caps: { audio: 50 * MB, image: 30 * MB, other: 50 * MB, video: 50 * MB },
    enforce: true,
  },
  resetsAt: "2099-01-01T00:00:00Z",
  usedBytes: 0,
};

interface Routes {
  usage?: () => Response;
  presign?: () => Response;
  moderate?: () => Response;
}

/**
 * An ApiClient routing `/s3/usage`, `/s3/presigned-url` and `/s3/moderate`
 * to the given answers, recording every call. A fresh client per test also
 * keeps the module's usage cache from leaking between tests.
 */
const fakeApi = ({
  usage = () => json(200, USAGE),
  presign = () => json(200, PRESIGNED),
  moderate = () => json(200, { message: "success" }),
}: Routes = {}) => {
  const calls: { path: string; body?: unknown }[] = [];
  const api = {
    raw: async (path: string, options?: { body?: unknown }) => {
      calls.push({ body: options?.body, path });
      if (path.includes("/s3/usage")) return usage();
      if (path.includes("/s3/presigned-url")) return presign();
      if (path.includes("/s3/moderate")) return moderate();
      throw new Error(`unexpected ${path}`);
    },
  } as unknown as ApiClient;
  const count = (part: string) =>
    calls.filter((call) => call.path.includes(part)).length;
  return { api, calls, count };
};

/** A PUT that records what it was asked to send and answers `status`. */
const recordingPut = (status = 200) => {
  const targets: DirectUploadTarget[] = [];
  return {
    put: async (target: DirectUploadTarget) => {
      targets.push(target);
      return status;
    },
    targets,
  };
};

const IMAGE = { contentType: "image/png", size: 1234 };

describe("uploadMediaDirect", () => {
  it("presigns with the exact size, PUTs, confirms, and returns the file URL", async () => {
    const { api, calls, count } = fakeApi();
    const { put, targets } = recordingPut();
    const result = await uploadMediaDirect(api, {
      ...IMAGE,
      mediaBucket: "APP_MEDIA",
      prefix: "muse-1",
      put,
      scoped: false,
    });
    assert.deepEqual(result, { fileUrl: PRESIGNED.fileUrl, ok: true });

    const presign = calls.find((call) => call.path.includes("presigned-url"));
    const query = new URLSearchParams(presign?.path.split("?")[1]);
    assert.equal(query.get("contentType"), "image/png");
    assert.equal(query.get("size"), "1234");
    assert.equal(query.get("mediaBucket"), "APP_MEDIA");
    assert.equal(query.get("prefix"), "muse-1");
    assert.equal(query.get("scoped"), "false");

    assert.equal(targets.length, 1);
    assert.equal(targets[0].uploadUrl, PRESIGNED.uploadUrl);
    assert.equal(targets[0].method, "PUT");
    assert.equal(count("/s3/moderate"), 1);
    const moderate = calls.find((call) => call.path.includes("/s3/moderate"));
    assert.deepEqual(moderate?.body, { fileUrl: PRESIGNED.fileUrl });
  });

  it("sends chat media to CHAT_MEDIA and still confirms it", async () => {
    const { api, calls, count } = fakeApi();
    const { put } = recordingPut();
    const result = await uploadMediaDirect(api, {
      contentType: "video/mp4",
      mediaBucket: "CHAT_MEDIA",
      prefix: "conv-1",
      put,
      size: 99,
    });
    assert.equal(result.ok, true);
    const presign = calls.find((call) => call.path.includes("presigned-url"));
    assert.ok(presign?.path.includes("mediaBucket=CHAT_MEDIA"));
    assert.equal(count("/s3/moderate"), 1);
  });

  describe("purpose", () => {
    const FULL = () => json(200, { ...USAGE, usedBytes: USAGE.limitBytes });

    it("refuses a personal upload when storage is full, before any presign", async () => {
      const { api, count } = fakeApi({ usage: FULL });
      const result = await uploadMediaDirect(api, {
        ...IMAGE,
        put: recordingPut().put,
      });
      assert.equal(result.ok, false);
      assert.equal(
        !result.ok && result.refused && result.refusal.code,
        "storage_full",
      );
      assert.equal(count("presigned-url"), 0);
    });

    it("lets a post upload past a full account total, with purpose=post", async () => {
      const { api, calls } = fakeApi({ usage: FULL });
      const result = await uploadMediaDirect(api, {
        ...IMAGE,
        purpose: "post",
        put: recordingPut().put,
      });
      assert.equal(result.ok, true);
      const presign = calls.find((call) => call.path.includes("presigned-url"));
      const query = new URLSearchParams(presign?.path.split("?")[1]);
      assert.equal(query.get("purpose"), "post");
      assert.equal(query.get("scoped"), null);
    });

    it("keys a storyboard upload under the storyboard, unscoped", async () => {
      const { api, calls } = fakeApi({ usage: FULL });
      const result = await uploadMediaDirect(api, {
        ...IMAGE,
        purpose: "storyboard",
        put: recordingPut().put,
        storyboardId: "sb-9",
      });
      assert.equal(result.ok, true);
      const presign = calls.find((call) => call.path.includes("presigned-url"));
      const query = new URLSearchParams(presign?.path.split("?")[1]);
      assert.equal(query.get("purpose"), "storyboard");
      assert.equal(query.get("prefix"), "sb-9");
      assert.equal(query.get("scoped"), "false");
    });

    it("sends nothing for a storyboard upload with no storyboard id", async () => {
      const { api, calls } = fakeApi();
      const { put, targets } = recordingPut();
      const result = await uploadMediaDirect(api, {
        ...IMAGE,
        purpose: "storyboard",
        put,
      });
      assert.deepEqual(result, {
        message: "Upload failed. Please try again.",
        ok: false,
        refused: false,
        stage: "presign",
      });
      assert.equal(calls.length, 0);
      assert.equal(targets.length, 0);
    });

    it("words the service's storyboard_full", async () => {
      const { api } = fakeApi({
        presign: () => json(413, { code: "storyboard_full" }),
        usage: () =>
          json(200, {
            ...USAGE,
            limits: { ...USAGE.limits, storyboardLimitBytes: 1024 * MB },
          }),
      });
      const result = await uploadMediaDirect(api, {
        ...IMAGE,
        purpose: "storyboard",
        put: recordingPut().put,
        storyboardId: "sb-9",
      });
      assert.equal(result.ok, false);
      assert.equal(!result.ok && result.stage, "presign");
      assert.equal(
        !result.ok && result.message,
        "This storyboard has used all 1 GB of its storage. Delete some media from the storyboard to make room.",
      );
    });
  });

  describe("the PUT's Content-Type", () => {
    it("is exactly the signed type", async () => {
      const type = "video/quicktime";
      const { api, calls } = fakeApi();
      const { put, targets } = recordingPut();
      await uploadMediaDirect(api, { contentType: type, put, size: 10 });
      const presign = calls.find((call) => call.path.includes("presigned-url"));
      const signed = new URLSearchParams(presign?.path.split("?")[1]).get(
        "contentType",
      );
      assert.equal(signed, type);
      assert.equal(targets[0].contentType, signed);
    });

    it("signs and sends application/octet-stream for a blank type", async () => {
      const { api, calls } = fakeApi();
      const { put, targets } = recordingPut();
      await uploadMediaDirect(api, { contentType: "", put, size: 10 });
      const presign = calls.find((call) => call.path.includes("presigned-url"));
      assert.equal(
        new URLSearchParams(presign?.path.split("?")[1]).get("contentType"),
        "application/octet-stream",
      );
      assert.equal(targets[0].contentType, "application/octet-stream");
    });

    describe("putWithFetch", () => {
      const realFetch = globalThis.fetch;
      afterEach(() => {
        globalThis.fetch = realFetch;
      });

      it("PUTs the blob with the signed Content-Type header", async () => {
        const seen: { url: string; init?: RequestInit }[] = [];
        globalThis.fetch = (async (url: string, init?: RequestInit) => {
          seen.push({ init, url });
          return new Response(null, { status: 200 });
        }) as typeof fetch;
        // The blob's own type differs: the header must still be the signed one.
        const blob = new Blob(["abc"], { type: "image/jpeg" });
        const { api } = fakeApi({
          presign: () => json(200, { ...PRESIGNED, method: "PUT" }),
        });
        const result = await uploadMediaDirect(api, {
          body: blob,
          contentType: "image/png",
          size: blob.size,
        });
        assert.equal(result.ok, true);
        assert.equal(seen.length, 1);
        assert.equal(seen[0].url, PRESIGNED.uploadUrl);
        assert.equal(seen[0].init?.method, "PUT");
        assert.equal(seen[0].init?.body, blob);
        assert.deepEqual(seen[0].init?.headers, { "Content-Type": "image/png" });
      });

      it("resolves the status", async () => {
        globalThis.fetch = (async () =>
          new Response(null, { status: 403 })) as unknown as typeof fetch;
        assert.equal(
          await putWithFetch(new Blob(["x"]))({
            contentType: "image/png",
            method: "PUT",
            uploadUrl: "https://signed.example/x",
          }),
          403,
        );
      });
    });
  });

  describe("refusals", () => {
    const refusedBy = async (routes: Routes, size = IMAGE.size) => {
      const fake = fakeApi(routes);
      const { put, targets } = recordingPut();
      const result = await uploadMediaDirect(fake.api, {
        contentType: "image/png",
        put,
        size,
      });
      return { ...fake, result, targets };
    };

    it("refuses over the cap before anything is sent (client check)", async () => {
      const { result, targets, count } = await refusedBy({}, 31 * MB);
      assert.equal(result.ok, false);
      assert.ok(!result.ok && result.refused);
      assert.equal(!result.ok && result.refused && result.refusal.code, "size_over_cap");
      assert.equal(!result.ok && result.stage, "check");
      assert.equal(!result.ok && result.message, "File too large (max 30 MB).");
      assert.equal(count("presigned-url"), 0);
      assert.equal(targets.length, 0);
    });

    it("413 size_over_cap from the presign", async () => {
      const { result, targets } = await refusedBy({
        presign: () => json(413, { code: "size_over_cap", message: "server text" }),
      });
      assert.ok(!result.ok && result.refused);
      assert.equal(!result.ok && result.refused && result.refusal.code, "size_over_cap");
      assert.equal(!result.ok && result.message, "File too large (max 30 MB).");
      assert.equal(targets.length, 0);
    });

    it("413 storage_full", async () => {
      const { result } = await refusedBy({
        presign: () => json(413, { code: "storage_full", message: "server text" }),
      });
      assert.ok(!result.ok && result.refused);
      assert.equal(
        !result.ok && result.message,
        "You've used all 2 GB of your storage. Delete some media to make room.",
      );
    });

    it("429 upload_daily_limit with Retry-After", async () => {
      const { result } = await refusedBy({
        presign: () =>
          json(
            429,
            { code: "upload_daily_limit", message: "server text" },
            { "Retry-After": "18000" },
          ),
      });
      assert.ok(!result.ok && result.refused);
      assert.equal(!result.ok && result.refused && result.refusal.retryAfterSeconds, 18000);
      assert.equal(
        !result.ok && result.message,
        "You've reached today's upload limit. It resets in 5 h.",
      );
    });

    it("503 upload_unavailable", async () => {
      const { result, targets } = await refusedBy({
        presign: () => json(503, { code: "upload_unavailable", message: "lock" }),
      });
      assert.ok(!result.ok && result.refused);
      assert.equal(
        !result.ok && result.message,
        "Uploads are paused for a moment. Please try again.",
      );
      assert.equal(targets.length, 0);
    });

    it("415 unsupported type", async () => {
      const { result, targets } = await refusedBy({
        presign: () => new Response(null, { status: 415 }),
      });
      assert.ok(!result.ok && result.refused);
      assert.equal(!result.ok && result.refused && result.refusal.code, "unsupported_type");
      assert.equal(!result.ok && result.message, "This type of file can't be uploaded.");
      assert.equal(targets.length, 0);
    });

    it("422 media_rejected from the confirm", async () => {
      const { result, targets } = await refusedBy({
        moderate: () => json(422, { message: "media_rejected" }),
      });
      assert.equal(targets.length, 1);
      assert.ok(!result.ok && result.refused);
      assert.equal(!result.ok && result.stage, "confirm");
      assert.equal(!result.ok && result.refused && result.refusal.code, "media_rejected");
      assert.equal(
        !result.ok && result.message,
        "This image appears to contain sexual content, which isn't allowed on Novelist World.",
      );
    });

    it("413 size_over_cap from the confirm", async () => {
      const { result } = await refusedBy({
        moderate: () => json(413, { code: "size_over_cap", message: "x" }),
      });
      assert.ok(!result.ok && result.refused);
      assert.equal(!result.ok && result.stage, "confirm");
      assert.equal(!result.ok && result.refused && result.refusal.code, "size_over_cap");
    });

    it("never passes the service's own message on", async () => {
      const { result } = await refusedBy({
        presign: () => json(413, { code: "<b>new_code</b>", message: "<b>internal</b>" }),
      });
      assert.equal(!result.ok && result.message, "Upload failed. Please try again.");
    });
  });

  describe("plain failures", () => {
    it("a 500 from the presign", async () => {
      const { api } = fakeApi({ presign: () => json(500, {}) });
      const { put, targets } = recordingPut();
      const result = await uploadMediaDirect(api, { ...IMAGE, put });
      assert.deepEqual(result, {
        message: "Upload failed. Please try again.",
        ok: false,
        refused: false,
        stage: "presign",
      });
      assert.equal(targets.length, 0);
    });

    it("a 403 from S3 (signature mismatch) does not confirm", async () => {
      const { api, count } = fakeApi();
      const { put } = recordingPut(403);
      const result = await uploadMediaDirect(api, { ...IMAGE, put });
      assert.equal(!result.ok && !result.refused && result.stage, "put");
      assert.equal(count("/s3/moderate"), 0);
    });

    it("a network failure on the PUT does not confirm or throw", async () => {
      const { api, count } = fakeApi();
      const result = await uploadMediaDirect(api, {
        ...IMAGE,
        put: async () => {
          throw new TypeError("Failed to fetch");
        },
      });
      assert.equal(!result.ok && !result.refused && result.stage, "put");
      assert.equal(count("/s3/moderate"), 0);
    });

    it("a network failure on the confirm keeps the URL unused", async () => {
      const { api } = fakeApi({
        moderate: () => {
          throw new TypeError("Failed to fetch");
        },
      });
      const { put } = recordingPut();
      const result = await uploadMediaDirect(api, { ...IMAGE, put });
      assert.equal(result.ok, false);
      assert.equal(!result.ok && !result.refused && result.stage, "confirm");
    });

    it("no bytes and no PUT is a failure before any call", async () => {
      const { api, calls } = fakeApi();
      const result = await uploadMediaDirect(api, IMAGE);
      assert.equal(result.ok, false);
      assert.equal(calls.length, 0);
    });
  });

  it("goes ahead when the usage cannot be read (the service decides)", async () => {
    const { api } = fakeApi({ usage: () => json(500, {}) });
    const { put } = recordingPut();
    const result = await uploadMediaDirect(api, { ...IMAGE, put, size: 31 * MB });
    assert.equal(result.ok, true);
  });

  it("re-reads usage after a stored upload (the next check in a batch)", async () => {
    const { api, count } = fakeApi();
    const { put } = recordingPut();
    await uploadMediaDirect(api, { ...IMAGE, put });
    await uploadMediaDirect(api, { ...IMAGE, put });
    assert.equal(count("/s3/usage"), 2);
  });
});

describe("confirmUpload", () => {
  it("maps 200, 422, 413 and the rest", async () => {
    const at = (response: () => Response) =>
      confirmUpload(fakeApi({ moderate: response }).api, PRESIGNED.fileUrl);
    assert.deepEqual(await at(() => json(200, {})), { ok: true });
    const rejected = await at(() => json(422, {}));
    assert.equal(!rejected.ok && rejected.refusal?.code, "media_rejected");
    const over = await at(() => json(413, { code: "size_over_cap" }));
    assert.equal(!over.ok && over.refusal?.code, "size_over_cap");
    assert.deepEqual(await at(() => json(400, {})), { ok: false, refusal: null });
    assert.deepEqual(await at(() => json(401, {})), { ok: false, refusal: null });
    assert.deepEqual(await at(() => json(500, {})), { ok: false, refusal: null });
  });
});
