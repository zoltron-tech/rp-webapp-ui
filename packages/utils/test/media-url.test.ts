import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  isOurS3Url,
  reverseWsrvUrl,
  setMediaHosts,
  toMediaUrl,
  wsrvImage,
} from "../src/image.ts";

const KEYS = [
  "RP_MEDIA_HOST",
  "EXPO_PUBLIC_RP_MEDIA_HOST",
  "RP_BUCKET_NAME",
  "EXPO_PUBLIC_RP_BUCKET_NAME",
] as const;

const saved: Partial<Record<(typeof KEYS)[number], string | undefined>> = {};

beforeEach(() => {
  for (const key of KEYS) {
    saved[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  setMediaHosts({ chatMediaHost: null, mediaHost: null });
  for (const key of KEYS) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
});

const GLOBAL = "https://rp-webapp-ui.s3.amazonaws.com/app-media/a/b.jpg";
const REGIONAL =
  "https://rp-webapp-ui.s3.us-east-1.amazonaws.com/app-media/a/b.jpg";
const CDN = "https://media.novelist.world/app-media/a/b.jpg";
const SIZE = { fit: "cover" as const, h: 120, w: 120 };

const wsrvParam = (url: string) =>
  new URLSearchParams(url.slice(url.indexOf("?") + 1)).get("url");

describe("toMediaUrl", () => {
  it("is a no-op while the media host is unset", () => {
    process.env.RP_BUCKET_NAME = "rp-webapp-ui";
    assert.equal(toMediaUrl(GLOBAL), GLOBAL);
    assert.equal(toMediaUrl(REGIONAL), REGIONAL);
  });

  it("rewrites both S3 host spellings to the media host", () => {
    process.env.RP_MEDIA_HOST = "media.novelist.world";
    assert.equal(toMediaUrl(GLOBAL), CDN);
    assert.equal(toMediaUrl(REGIONAL), CDN);
  });

  it("reads the native spelling of the variable too", () => {
    process.env.EXPO_PUBLIC_RP_MEDIA_HOST = "media.novelist.world";
    assert.equal(toMediaUrl(GLOBAL), CDN);
  });

  it("tolerates a scheme or trailing slash in the configured host", () => {
    process.env.RP_MEDIA_HOST = "https://media.novelist.world/";
    assert.equal(toMediaUrl(GLOBAL), CDN);
  });

  it("uses the configured bucket when there is one", () => {
    process.env.RP_MEDIA_HOST = "media.novelist.world";
    process.env.RP_BUCKET_NAME = "staging-bucket";
    assert.equal(
      toMediaUrl("https://staging-bucket.s3.amazonaws.com/k.png"),
      "https://media.novelist.world/k.png",
    );
    // Production's bucket is then someone else's.
    assert.equal(toMediaUrl(GLOBAL), GLOBAL);
  });

  it("leaves foreign, look-alike and already-rewritten URLs alone", () => {
    process.env.RP_MEDIA_HOST = "media.novelist.world";
    for (const url of [
      "https://example.com/rp-webapp-ui.s3.amazonaws.com/x.jpg",
      "https://other-bucket.s3.amazonaws.com/x.jpg",
      "https://rp-webapp-ui.s3.amazonaws.com.evil.com/x.jpg",
      "https://rp-webapp-ui.s3foo.amazonaws.com/x.jpg",
      "http://rp-webapp-ui.s3.amazonaws.com/x.jpg",
      "https://wsrv.nl/?url=rp-webapp-ui.s3.amazonaws.com/x.jpg",
      CDN,
    ]) {
      assert.equal(toMediaUrl(url), url, url);
    }
  });

  it("passes null, undefined and empty through", () => {
    process.env.RP_MEDIA_HOST = "media.novelist.world";
    assert.equal(toMediaUrl(null), null);
    assert.equal(toMediaUrl(undefined), undefined);
    assert.equal(toMediaUrl(""), "");
  });
});

describe("isOurS3Url", () => {
  it("knows the bucket on either endpoint", () => {
    process.env.RP_BUCKET_NAME = "rp-webapp-ui";
    assert.ok(isOurS3Url(GLOBAL));
    assert.ok(isOurS3Url(REGIONAL));
    assert.ok(!isOurS3Url(CDN));
  });

  it("knows the media host once it is set", () => {
    process.env.RP_BUCKET_NAME = "rp-webapp-ui";
    process.env.RP_MEDIA_HOST = "media.novelist.world";
    assert.ok(isOurS3Url(GLOBAL));
    assert.ok(isOurS3Url(CDN));
    assert.ok(!isOurS3Url("https://media.novelist.world.evil.com/x.jpg"));
  });

  it("knows nothing with no configuration", () => {
    assert.ok(!isOurS3Url(GLOBAL));
  });
});

describe("wsrvImage", () => {
  it("emits the global S3 endpoint while the media host is unset", () => {
    process.env.RP_BUCKET_NAME = "rp-webapp-ui";
    const regional = wsrvImage(REGIONAL, SIZE);
    assert.equal(
      wsrvParam(regional),
      "rp-webapp-ui.s3.amazonaws.com/app-media/a/b.jpg",
    );
    assert.equal(wsrvImage(GLOBAL, SIZE), regional);
    assert.equal(reverseWsrvUrl(regional), GLOBAL);
  });

  it("emits the media host for every spelling once it is set", () => {
    process.env.RP_BUCKET_NAME = "rp-webapp-ui";
    process.env.RP_MEDIA_HOST = "media.novelist.world";
    const fromGlobal = wsrvImage(GLOBAL, SIZE);
    assert.equal(wsrvParam(fromGlobal), "media.novelist.world/app-media/a/b.jpg");
    assert.equal(wsrvImage(REGIONAL, SIZE), fromGlobal);
    assert.equal(wsrvImage(CDN, SIZE), fromGlobal);
    assert.equal(reverseWsrvUrl(fromGlobal), CDN);
  });

  it("works on the media host even without a bucket name", () => {
    process.env.RP_MEDIA_HOST = "media.novelist.world";
    assert.equal(
      wsrvParam(wsrvImage(GLOBAL, SIZE)),
      "media.novelist.world/app-media/a/b.jpg",
    );
  });

  it("returns the unresized source through the media host for a null profile", () => {
    process.env.RP_BUCKET_NAME = "rp-webapp-ui";
    assert.equal(wsrvImage(GLOBAL, null), GLOBAL);
    process.env.RP_MEDIA_HOST = "media.novelist.world";
    assert.equal(wsrvImage(GLOBAL, null), CDN);
  });

  it("leaves foreign URLs untouched", () => {
    process.env.RP_BUCKET_NAME = "rp-webapp-ui";
    process.env.RP_MEDIA_HOST = "media.novelist.world";
    const foreign = "https://example.com/x.jpg";
    assert.equal(wsrvImage(foreign, SIZE), foreign);
    assert.equal(wsrvImage(foreign, null), foreign);
  });

  it("is a no-op with no configuration at all", () => {
    assert.equal(wsrvImage(GLOBAL, SIZE), GLOBAL);
  });
});

describe("hosts from the service (limits on /s3/usage)", () => {
  const CHAT =
    "https://rp-webapp-ui.s3.amazonaws.com/chat-media/acc/conv/photo.jpg";

  it("uses the service's media host, over the build's variable", () => {
    process.env.RP_MEDIA_HOST = "old.example";
    setMediaHosts({ chatMediaHost: null, mediaHost: "media.novelist.world" });
    assert.equal(toMediaUrl(GLOBAL), CDN);
    assert.ok(isOurS3Url(CDN));
  });

  it("falls back to the build's variable when the service sends null", () => {
    process.env.RP_MEDIA_HOST = "media.novelist.world";
    setMediaHosts({ chatMediaHost: null, mediaHost: null });
    assert.equal(toMediaUrl(GLOBAL), CDN);
  });

  it("keeps chat media on the bucket until a chat host is set", () => {
    process.env.RP_MEDIA_HOST = "media.novelist.world";
    setMediaHosts({ chatMediaHost: null, mediaHost: "media.novelist.world" });
    assert.equal(toMediaUrl(CHAT), CHAT);
    assert.equal(
      wsrvParam(wsrvImage(CHAT, SIZE)),
      "rp-webapp-ui.s3.amazonaws.com/chat-media/acc/conv/photo.jpg",
    );
  });

  it("moves chat media to the chat host by configuration alone", () => {
    setMediaHosts({
      chatMediaHost: "https://chat.novelist.world/",
      mediaHost: null,
    });
    const chatCdn = "https://chat.novelist.world/chat-media/acc/conv/photo.jpg";
    assert.equal(toMediaUrl(CHAT), chatCdn);
    // Non-chat media stays where it is: no media host anywhere.
    assert.equal(toMediaUrl(GLOBAL), GLOBAL);
    assert.ok(isOurS3Url(chatCdn));
    assert.equal(
      wsrvParam(wsrvImage(chatCdn, SIZE)),
      "chat.novelist.world/chat-media/acc/conv/photo.jpg",
    );
  });

  it("serves each kind of key from its own host when both are set", () => {
    setMediaHosts({
      chatMediaHost: "chat.novelist.world",
      mediaHost: "media.novelist.world",
    });
    assert.equal(toMediaUrl(GLOBAL), CDN);
    assert.equal(
      toMediaUrl(CHAT),
      "https://chat.novelist.world/chat-media/acc/conv/photo.jpg",
    );
  });
});
