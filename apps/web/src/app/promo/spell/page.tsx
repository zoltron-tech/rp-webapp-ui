"use client";

import { namesToWords } from "@nw/spell/tokenizer";
import type { MentionDataItem, MentionTab } from "@nw/types";
import { useRef, useState } from "react";
import styled from "styled-components";
import {
  ChatRichInput,
  type ChatRichInputHandle,
} from "@/components/chat-rich-input";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/rich-text-editor-input";

/**
 * Spell-check lab — not a product route.
 *
 * Mounts the two editors the checker lives in (`RichTextEditor` for posts and
 * storyboard event threads, `ChatRichInput` for chat) with fixture names, so
 * the squiggles and the correction menu can be exercised and screenshotted
 * without a backend. Driven by the verification script in the session
 * scratchpad; also handy by hand at `/promo/spell`.
 */

const Page = styled.div`
  min-height: 100vh;
  padding: 24px 16px 120px;
  background: var(--bg-1, #111);
  color: var(--text);
  font-family: var(--font);
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-width: 640px;
  margin: 0 auto;
  box-sizing: border-box;
`;

const Label = styled.h2`
  margin: 0 0 8px;
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
`;

const Out = styled.pre`
  margin: 8px 0 0;
  padding: 8px 10px;
  font-size: 11px;
  white-space: pre-wrap;
  word-break: break-all;
  background: var(--bg-3, #222);
  border-radius: 8px;
  color: var(--text-secondary);
`;

const IGNORE = namesToWords(["Elara Vance", "umair", "Kael"]);

/** Fixture @mention candidates so the mention dropdown can be exercised. */
const MENTIONS: MentionDataItem[] = [
  { displayName: "kael", id: "n1", image: "", type: "NOVELIST" },
  { displayName: "umair", id: "n2", image: "", type: "NOVELIST" },
  {
    displayName: "Elara Vance",
    id: "m1",
    image: "",
    pennedBy: { image: null, username: "kael" },
    type: "MUSE",
  },
];

const MENTION_TABS: MentionTab[] = [
  {
    getData: async (prefix = "") =>
      MENTIONS.filter((m) =>
        m.displayName.toLowerCase().includes(prefix.toLowerCase()),
      ),
    iconKey: "avatar",
    id: "all",
    label: "All",
  },
];

export default function PromoSpellPage() {
  const richRef = useRef<RichTextEditorHandle>(null);
  const chatRef = useRef<ChatRichInputHandle>(null);
  const [richHtml, setRichHtml] = useState("");
  const [chatText, setChatText] = useState("");
  const [chatHtml, setChatHtml] = useState("");
  const [sent, setSent] = useState(0);

  return (
    <Page data-spell-lab>
      <section>
        <Label>Rich text editor (posts, event threads)</Label>
        <RichTextEditor
          ref={richRef}
          placeholder="Type your story here..."
          value=""
          onChange={setRichHtml}
          mentionTabs={MENTION_TABS}
          spellIgnore={IGNORE}
          desktopRounded
        />
        <Out data-rich-html>{richHtml}</Out>
      </section>

      <section>
        <Label>Chat composer</Label>
        <ChatRichInput
          ref={chatRef}
          value={chatText}
          onChange={setChatText}
          onHtmlChange={setChatHtml}
          onSubmit={() => setSent((n) => n + 1)}
          mentionItems={MENTIONS}
          spellIgnore={IGNORE}
        />
        <Out data-chat-html>{chatHtml}</Out>
        <Out data-chat-sent>sent: {sent}</Out>
      </section>
    </Page>
  );
}
