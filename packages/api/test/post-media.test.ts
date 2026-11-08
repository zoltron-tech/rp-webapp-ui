import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { API_MESSAGE } from "@nw/types";
import { type ApiClient, createApiClient } from "../src/client.ts";
import { submitPrompt } from "../src/endpoints/profile.ts";
import {
  isTooManyMedia,
  updatePromptComment,
} from "../src/endpoints/prompt.ts";

/**
 * The prompt, comment and reply saves answer 422 `{ code: "too_many_media" }`
 * past the five-media limit (owner decision 2026-11-08); every client reads
 * that through `isTooManyMedia`.
 */

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status,
  });

/** An ApiClient whose `raw` answers every call with `respond`. */
const rawApi = (respond: () => Response) =>
  ({ raw: async () => respond() }) as unknown as ApiClient;

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

/** A real client over a stubbed `fetch`, for the generic `request` path. */
const clientAnswering = (respond: () => Response) => {
  globalThis.fetch = (async () => respond()) as typeof fetch;
  return createApiClient({
    authHeaderName: "Authorization",
    baseUrl: "https://api.example",
    getToken: () => "token",
  });
};

const PROMPT = {
  media: "",
  source: {
    image: "",
    name: "N",
    sourceId: "n",
    sourceType: "NOVELIST" as const,
    urlProp: "n",
  },
  text: "<p>hi</p>",
};

describe("submitPrompt", () => {
  it("maps 422 too_many_media to TooManyMedia", async () => {
    const result = await submitPrompt(
      rawApi(() => json(422, { code: "too_many_media", message: "x" })),
      PROMPT,
      "comment",
    );
    assert.equal(result.message, API_MESSAGE.TooManyMedia);
    assert.equal(isTooManyMedia(result), true);
  });

  it("keeps any other 422 an ordinary failure", async () => {
    for (const body of [{ code: "something_else" }, "not json", null]) {
      const result = await submitPrompt(
        rawApi(() => json(422, body)),
        PROMPT,
      );
      assert.equal(result.message, API_MESSAGE.UncategorizedError);
      assert.equal(isTooManyMedia(result), false);
    }
  });
});

describe("the generic request path", () => {
  it("hands on a 422's code (updatePromptComment)", async () => {
    const api = clientAnswering(() => json(422, { code: "too_many_media" }));
    const result = await updatePromptComment(api, "p1", "<p>x</p>", "reply");
    assert.equal(result.message, API_MESSAGE.Error);
    assert.equal(isTooManyMedia(result), true);
  });

  it("leaves other failures in the plain shape", async () => {
    const api = clientAnswering(() => json(400, { code: "too_many_media" }));
    const result = await updatePromptComment(api, "p1", "<p>x</p>", "prompt");
    assert.deepEqual(result, { message: API_MESSAGE.Error });
    const noCode = clientAnswering(() => json(422, { message: "nope" }));
    assert.deepEqual(
      await updatePromptComment(noCode, "p1", "<p>x</p>", "prompt"),
      { message: API_MESSAGE.Error },
    );
  });
});

describe("isTooManyMedia", () => {
  it("reads both shapes and nothing else", () => {
    assert.equal(isTooManyMedia({ message: API_MESSAGE.TooManyMedia }), true);
    assert.equal(
      isTooManyMedia({ code: "too_many_media", message: "error" }),
      true,
    );
    const others = [null, undefined, "too_many_media", {}, { message: "error" }];
    for (const value of others) {
      assert.equal(isTooManyMedia(value), false);
    }
  });
});
