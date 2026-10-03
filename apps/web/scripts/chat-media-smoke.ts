/**
 * What a chat message renders as, checked once for both clients.
 *
 * These predicates decide whether a message is a picture or forty characters of
 * blue text, and they now live in `@nw/chat` because the browser and the phone
 * each used to answer it for themselves — the phone said "text" and the browser
 * said "GIF" for the same message, which is the bug this fixes.
 *
 * Nothing here throws when it is wrong. A URL that stops being recognised as an
 * image just quietly becomes a link, on one client, for whoever is looking.
 */
import {
  conversationPreviewText,
  extractUrls,
  getAttachmentKind,
  getFileExtension,
  getFileNameFromUrl,
  isDirectImageUrl,
  isKlipyClip,
  isMediaOnlyMessage,
  RETENTION_NOTICES,
  RETENTION_PERIOD,
  retentionNoticeFor,
} from "@nw/chat";
import type { Conversation as ConversationType } from "@nw/types";

let failures = 0;

const check = (name: string, actual: unknown, expected: unknown) => {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a === b) {
    console.log(`PASS  ${name}  (${a})`);
  } else {
    failures += 1;
    console.error(`FAIL  ${name}\n        expected ${b}\n        actual   ${a}`);
  }
};

// ─── The message that started this ──────────────────────────────────────────

const KLIPY_GIF =
  "https://static.klipy.com/ii/4bbcf901ea0d5dec489bd8c608d7f1fd/ba/05/wLP3Qu3EJIv6dN.webp";

check("a Klipy webp is an image", isDirectImageUrl(KLIPY_GIF), true);
check("and the message is nothing else", isMediaOnlyMessage(KLIPY_GIF), true);
check(
  "surrounding whitespace does not change that",
  isMediaOnlyMessage(`  ${KLIPY_GIF}\n`),
  true,
);
check(
  "a caption alongside it keeps the bubble",
  isMediaOnlyMessage(`look at this ${KLIPY_GIF}`),
  false,
);
check(
  "two images keep the bubble too",
  isMediaOnlyMessage(`${KLIPY_GIF} ${KLIPY_GIF.replace("wLP3", "aBc9")}`),
  false,
);

// ─── Query strings, which is where extension sniffing usually breaks ────────

check(
  "Klipy's ?animated=true does not hide the extension",
  getFileExtension(`${KLIPY_GIF}?animated=true`),
  "webp",
);
check(
  "a Discord signed URL is still a png",
  getAttachmentKind(
    "https://cdn.discordapp.com/emojis/123.png?size=44&quality=lossless",
  ),
  "image",
);
check(
  "a fragment does not either",
  getFileExtension("https://example.com/a.gif#frag"),
  "gif",
);
check(
  "an extensionless URL is a file, not an image",
  getAttachmentKind("https://example.com/page"),
  "file",
);

// ─── Kinds ──────────────────────────────────────────────────────────────────

check("mp4 is video", getAttachmentKind("https://x.test/a.mp4"), "video");
check("mp3 is audio", getAttachmentKind("https://x.test/a.mp3"), "audio");
check("pdf is a file", getAttachmentKind("https://x.test/a.pdf"), "file");
check(
  "a Klipy mp4 is a clip",
  isKlipyClip("https://static.klipy.com/x/y.mp4"),
  true,
);
check(
  "any other mp4 is not",
  isKlipyClip("https://example.com/x/y.mp4"),
  false,
);

// ─── Finding URLs in text ───────────────────────────────────────────────────

check(
  "URLs are pulled out of a sentence",
  extractUrls("see https://a.test/x.png and https://b.test/y.gif ok"),
  ["https://a.test/x.png", "https://b.test/y.gif"],
);
check(
  "the same URL twice counts once",
  extractUrls(`${KLIPY_GIF} ${KLIPY_GIF}`).length,
  1,
);
check("plain text has no URLs", extractUrls("no links here"), []);
// The regex is global; a shared instance would carry `lastIndex` into the next
// message and start reading half way through it.
check(
  "a second call is not affected by the first",
  extractUrls("https://a.test/x.png"),
  ["https://a.test/x.png"],
);
check(
  "the file name is readable",
  getFileNameFromUrl(KLIPY_GIF),
  "wLP3Qu3EJIv6dN.webp",
);

// ─── The retention promise ──────────────────────────────────────────────────
// A number the two clients must never disagree about: it tells a person how
// long what they type survives.

check(
  "every variant states the same period",
  RETENTION_NOTICES.every((notice) => notice.line2.includes(RETENTION_PERIOD)),
  true,
);
check(
  "a conversation always gets the same notice",
  retentionNoticeFor("conv-1234") === retentionNoticeFor("conv-1234"),
  true,
);
check(
  "and the id actually selects it",
  new Set(
    Array.from({ length: 40 }, (_, index) => retentionNoticeFor(`c-${index}`)),
  ).size > 1,
  true,
);

// ─── Inbox previews ─────────────────────────────────────────────────────────
// The first line either client shows. A raw CDN URL here is the bug that made
// the phone's inbox unreadable.

const conversationWith = (message: string, extra = {}): ConversationType =>
  ({
    lastMessage: { attachments: [], message, type: "TEXT", ...extra },
  }) as unknown as ConversationType;

check(
  "a GIF reads as a GIF",
  conversationPreviewText(conversationWith("https://x.test/a.gif")),
  "Sent a GIF",
);
check(
  "a webp sticker reads as an image",
  conversationPreviewText(conversationWith(KLIPY_GIF)),
  "Sent an image",
);
check(
  "an mp4 reads as a video",
  conversationPreviewText(conversationWith("https://x.test/a.mp4")),
  "Sent a video",
);
check(
  "any other link reads as a link",
  conversationPreviewText(conversationWith("https://example.com/article")),
  "Sent a link",
);
check(
  "markup never reaches the preview",
  conversationPreviewText(
    conversationWith('<div style="text-align: center;">Hey there</div>'),
  ),
  "Hey there",
);
check(
  "a sentence containing a link stays a sentence",
  conversationPreviewText(conversationWith("look at https://x.test/a.gif")),
  "look at https://x.test/a.gif",
);
check(
  "free text truncates when the caller asks",
  conversationPreviewText(
    conversationWith("a message that is comfortably longer than twenty"),
    20,
  ),
  "a message that is co...",
);
check(
  "but a description never does",
  conversationPreviewText(conversationWith("https://x.test/a.mp3"), 5),
  "Sent an audio clip",
);
check(
  "an empty conversation invites one",
  conversationPreviewText({ lastMessage: null } as unknown as ConversationType),
  "Start a conversation",
);
check(
  "attachments are counted",
  conversationPreviewText(
    conversationWith("", { attachments: [{ url: "a" }, { url: "b" }] }),
  ),
  "Sent 2 attachments",
);

if (failures > 0) {
  // Thrown rather than `process.exit`: the shared packages narrow the ambient
  // `process` type to `{ env }`, and an unhandled throw is a non-zero exit.
  throw new Error(`${failures} smoke check(s) failed`);
}
console.log("\nALL PASS");
