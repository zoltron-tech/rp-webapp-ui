import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ApiClient } from "@nw/api";
import type { UploadRefusal } from "@nw/utils";
import {
  type DirectUploadDeps,
  runDirectUpload,
} from "../src/lib/direct-upload.ts";

/**
 * The phone's direct upload with `fetch` and `expo-file-system` stubbed:
 * presign → PUT → `/s3/moderate`, and what each answer maps to.
 *
 * Run from apps/mobile:
 * node --experimental-transform-types --no-warnings
 *   --import ../../packages/richtext/test/register.mjs --test "test/**\/*.test.ts"
 */

const PRESIGNED = {
  fileUrl: "https://rp-webapp-ui.s3.amazonaws.com/app-media/a/m/k.png",
  method: "PUT",
  uploadUrl: "https://signed.example/k.png?sig=1",
};

const json = (status: number, body: unknown, headers?: HeadersInit) =>
  new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json", ...headers },
    status,
  });

interface Call {
  path: string;
  body?: unknown;
  method?: string;
}

/** `presign` and `moderate` answer the two routes; anything else is a failure. */
const fakeApi = ({
  presign = () => json(200, PRESIGNED),
  moderate = () => json(200, { message: "SUCCESS" }),
}: {
  presign?: () => Response;
  moderate?: () => Response;
} = {}) => {
  const calls: Call[] = [];
  const api = {
    raw: async (
      path: string,
      options?: { body?: unknown; method?: string },
    ) => {
      calls.push({ body: options?.body, method: options?.method, path });
      if (path.includes("/s3/presigned-url")) return presign();
      if (path.endsWith("/s3/moderate")) return moderate();
      return json(500, {});
    },
  } as unknown as ApiClient;
  return { api, calls };
};

const fakeDeps = ({
  size = 1234 as number | null | Error,
  refusal = null as UploadRefusal | null,
  status = 200,
} = {}) => {
  const log = {
    prechecks: [] as Array<[string, number]>,
    purposes: [] as string[],
    puts: [] as Array<{
      url: string;
      uri: string;
      method: string;
      type: string;
    }>,
    stored: 0,
  };
  const deps: DirectUploadDeps = {
    measure: async () => {
      if (size instanceof Error) throw size;
      return size;
    },
    precheck: async (contentType, bytes, purpose) => {
      log.prechecks.push([contentType, bytes]);
      log.purposes.push(purpose);
      return refusal;
    },
    put: async (url, uri, { contentType, method }) => {
      log.puts.push({ method, type: contentType, uri, url });
      return status;
    },
    stored: () => {
      log.stored += 1;
    },
  };
  return { deps, log };
};

const FILE = {
  contentType: "image/png",
  fileSize: 999,
  uri: "file:///cache/k.png",
};

const queryOf = (calls: Call[]) =>
  new URLSearchParams(
    calls
      .find((call) => call.path.includes("presigned-url"))
      ?.path.split("?")[1],
  );

describe("runDirectUpload", () => {
  it("presigns with the measured size, PUTs the file, confirms, returns the URL", async () => {
    const { api, calls } = fakeApi();
    const { deps, log } = fakeDeps();
    const outcome = await runDirectUpload(
      api,
      FILE,
      { prefix: "muse-1" },
      deps,
    );

    assert.deepEqual(outcome, {
      kind: "uploaded",
      size: 1234,
      url: PRESIGNED.fileUrl,
    });
    assert.deepEqual(log.prechecks, [["image/png", 1234]]);
    const query = queryOf(calls);
    assert.equal(query.get("size"), "1234");
    assert.equal(query.get("contentType"), "image/png");
    assert.equal(query.get("mediaBucket"), "APP_MEDIA");
    assert.equal(query.get("prefix"), "muse-1");
    assert.equal(query.get("scoped"), null);
    assert.deepEqual(log.puts, [
      {
        method: "PUT",
        type: "image/png",
        uri: FILE.uri,
        url: PRESIGNED.uploadUrl,
      },
    ]);
    assert.equal(log.stored, 1);
    const moderate = calls.find((call) => call.path.endsWith("/s3/moderate"));
    assert.equal(moderate?.method, "POST");
    assert.deepEqual(moderate?.body, { fileUrl: PRESIGNED.fileUrl });
  });

  it("passes the chat bucket and an unscoped key through", async () => {
    const { api, calls } = fakeApi();
    const { deps } = fakeDeps();
    await runDirectUpload(
      api,
      { ...FILE, contentType: "video/mp4" },
      { mediaBucket: "CHAT_MEDIA", prefix: "conv-1", scoped: false },
      deps,
    );
    const query = queryOf(calls);
    assert.equal(query.get("mediaBucket"), "CHAT_MEDIA");
    assert.equal(query.get("prefix"), "conv-1");
    assert.equal(query.get("scoped"), "false");
    assert.equal(query.get("contentType"), "video/mp4");
  });

  it("checks and signs a personal upload by default, with no purpose sent", async () => {
    const { api, calls } = fakeApi();
    const { deps, log } = fakeDeps();
    await runDirectUpload(api, FILE, { prefix: "muse-1" }, deps);
    assert.deepEqual(log.purposes, ["personal"]);
    const query = queryOf(calls);
    assert.equal(query.get("purpose"), null);
    assert.equal(query.get("prefix"), "muse-1");
  });

  it("sends purpose=post, and the pre-check knows it", async () => {
    const { api, calls } = fakeApi();
    const { deps, log } = fakeDeps();
    await runDirectUpload(api, FILE, { purpose: "post" }, deps);
    assert.deepEqual(log.purposes, ["post"]);
    assert.equal(queryOf(calls).get("purpose"), "post");
    assert.equal(queryOf(calls).get("scoped"), null);
  });

  it("keys a storyboard upload under the storyboard, unscoped", async () => {
    const { api, calls } = fakeApi();
    const { deps, log } = fakeDeps();
    const outcome = await runDirectUpload(
      api,
      FILE,
      { purpose: "storyboard", storyboardId: "sb-7" },
      deps,
    );
    assert.equal(outcome.kind, "uploaded");
    assert.deepEqual(log.purposes, ["storyboard"]);
    const query = queryOf(calls);
    assert.equal(query.get("purpose"), "storyboard");
    assert.equal(query.get("prefix"), "sb-7");
    assert.equal(query.get("scoped"), "false");
  });

  it("fails a storyboard upload with no storyboard id before anything is sent", async () => {
    const { api, calls } = fakeApi();
    const { deps, log } = fakeDeps();
    const outcome = await runDirectUpload(
      api,
      FILE,
      { purpose: "storyboard", storyboardId: null },
      deps,
    );
    assert.deepEqual(outcome, { kind: "failed", stage: "presign" });
    assert.equal(calls.length, 0);
    assert.equal(log.prechecks.length, 0);
    assert.equal(log.puts.length, 0);
  });

  it("returns the service's storyboard_full as a refusal", async () => {
    const { api } = fakeApi({
      presign: () => json(413, { code: "storyboard_full" }),
    });
    const { deps, log } = fakeDeps();
    const outcome = await runDirectUpload(
      api,
      FILE,
      { purpose: "storyboard", storyboardId: "sb-7" },
      deps,
    );
    assert.equal(outcome.kind, "refused");
    assert.equal(
      outcome.kind === "refused" && outcome.refusal.code,
      "storyboard_full",
    );
    assert.equal(log.puts.length, 0);
  });

  it("leaves size out when the file can't be measured; the pre-check uses the picker's number", async () => {
    for (const size of [null, 0, new Error("content uri")]) {
      const { api, calls } = fakeApi();
      const { deps, log } = fakeDeps({ size });
      const outcome = await runDirectUpload(api, FILE, {}, deps);
      assert.equal(outcome.kind, "uploaded", String(size));
      assert.equal(queryOf(calls).get("size"), null, String(size));
      assert.deepEqual(log.prechecks, [["image/png", 999]]);
    }
  });

  it("stops before any request when the pre-check refuses", async () => {
    const refusal: UploadRefusal = {
      code: "storage_full",
      refused: true,
      retryAfterSeconds: null,
      status: 413,
    };
    const { api, calls } = fakeApi();
    const { deps, log } = fakeDeps({ refusal });
    const outcome = await runDirectUpload(api, FILE, {}, deps);
    assert.deepEqual(outcome, { kind: "refused", refusal });
    assert.equal(calls.length, 0);
    assert.equal(log.puts.length, 0);
  });

  for (const [status, code, headers, retry] of [
    [413, "size_over_cap", undefined, null],
    [413, "storage_full", undefined, null],
    [429, "upload_daily_limit", { "Retry-After": "3600" }, 3600],
  ] as const) {
    it(`maps a presign ${status} ${code} to a refusal and sends nothing`, async () => {
      const { api, calls } = fakeApi({
        presign: () => json(status, { code, message: "no" }, headers),
      });
      const { deps, log } = fakeDeps();
      const outcome = await runDirectUpload(api, FILE, {}, deps);
      assert.equal(outcome.kind, "refused");
      if (outcome.kind !== "refused") return;
      assert.equal(outcome.refusal.code, code);
      assert.equal(outcome.refusal.status, status);
      assert.equal(outcome.refusal.retryAfterSeconds, retry);
      assert.equal(log.puts.length, 0);
      assert.ok(!calls.some((call) => call.path.endsWith("/s3/moderate")));
    });
  }

  it("is a plain failure when the presign fails otherwise", async () => {
    const { api } = fakeApi({ presign: () => json(500, {}) });
    const { deps, log } = fakeDeps();
    assert.deepEqual(await runDirectUpload(api, FILE, {}, deps), {
      kind: "failed",
      stage: "presign",
    });
    assert.equal(log.puts.length, 0);
  });

  it("is a failure when the PUT is refused, and confirms nothing", async () => {
    const { api, calls } = fakeApi();
    const { deps, log } = fakeDeps({ status: 403 });
    assert.deepEqual(await runDirectUpload(api, FILE, {}, deps), {
      kind: "failed",
      stage: "put",
    });
    assert.equal(log.stored, 0);
    assert.ok(!calls.some((call) => call.path.endsWith("/s3/moderate")));
  });

  it("is a failure, not a throw, when the network goes", async () => {
    const api = {
      raw: async () => {
        throw new TypeError("Network request failed");
      },
    } as unknown as ApiClient;
    const { deps } = fakeDeps();
    assert.deepEqual(await runDirectUpload(api, FILE, {}, deps), {
      kind: "failed",
      stage: "error",
    });
  });

  it("maps moderate 422 to rejected", async () => {
    const { api } = fakeApi({
      moderate: () => json(422, { message: "MEDIA_REJECTED" }),
    });
    const { deps, log } = fakeDeps();
    assert.deepEqual(await runDirectUpload(api, FILE, {}, deps), {
      kind: "rejected",
    });
    assert.equal(log.stored, 1);
  });

  it("maps moderate 413 (deleted as over the cap) to a refusal", async () => {
    const { api } = fakeApi({
      moderate: () => json(413, { code: "size_over_cap", message: "no" }),
    });
    const { deps } = fakeDeps();
    const outcome = await runDirectUpload(api, FILE, {}, deps);
    assert.equal(outcome.kind, "refused");
    if (outcome.kind === "refused") {
      assert.equal(outcome.refusal.code, "size_over_cap");
    }
  });

  it("fails open on any other confirm answer (400, 401, 500, network)", async () => {
    const answers: Array<() => Response> = [
      () => json(400, {}),
      () => json(401, {}),
      () => json(500, {}),
      () => {
        throw new TypeError("Network request failed");
      },
    ];
    for (const moderate of answers) {
      const { api } = fakeApi({ moderate });
      const { deps } = fakeDeps();
      const outcome = await runDirectUpload(api, FILE, {}, deps);
      assert.equal(outcome.kind, "uploaded");
    }
  });
});
