import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { attachmentCounts, richTextMediaCount } from "../src/lib/rich-text-media-count.ts";

const S3 = "https://rp-webapp-ui.s3.amazonaws.com/app-media/u1";
const pictures = (n: number) =>
  Array.from({ length: n }, (_, i) => `<p><img src="${S3}/p${i}.png"></p>`).join(
    "",
  );
const klipy = "https://static.klipy.com/ii/abc/clip.mp4";

describe("richTextMediaCount", () => {
  it("counts the pictures in the text plus a hosted attachment", () => {
    assert.equal(richTextMediaCount(pictures(4), `${S3}/a.mp4`), 5);
  });

  it("counts an attachment still uploading from the device", () => {
    assert.equal(attachmentCounts("file:///data/clip.mp4"), true);
  });

  it("does not count a Klipy GIF or clip in the attachment slot", () => {
    assert.equal(attachmentCounts(klipy), false);
    assert.equal(richTextMediaCount(pictures(4), klipy), 4);
  });

  it("does not count a third-party attachment", () => {
    assert.equal(attachmentCounts("https://i.imgur.com/a.mp4"), false);
    assert.equal(richTextMediaCount(pictures(4), "https://i.imgur.com/a.mp4"), 4);
  });

  it("does not count an empty attachment", () => {
    assert.equal(richTextMediaCount(pictures(2), null), 2);
    assert.equal(richTextMediaCount(pictures(2), "  "), 2);
  });
});
