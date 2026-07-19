# Novelist World UI — usage conventions

Dark-first roleplay/creative-writing app UI. React + styled-components (styles ship in the JS bundle) + CSS custom properties for tokens.

## Wrapping and setup (required)

Wrap every screen in `DSProvider` — it supplies the styled-components theme, the global store, auth/socket/UI/music contexts, and the token-bearing wrapper (`.dark` + accent class). Components rendered outside it lose theme values and several crash on missing contexts.

```jsx
import { DSProvider, Button, MuseCard } from "rp-webapp";

<DSProvider>
  <div style={{ background: "var(--bg-1)", color: "var(--text)", minHeight: "100vh", padding: 16 }}>
    <Button variant="primary">Create Muse</Button>
  </div>
</DSProvider>
```

The app is dark-themed on near-black surfaces. Body font is Montserrat (weights 100–900 shipped); display fonts available: Savate, PlayfairDisplaySC, ZillaSlab, ShantellSans, Genos, BodoniModaSC, Tourney, MontserratUnderline.

## Styling idiom: CSS custom properties, not utility classes

There is no Tailwind. Style your own layout glue with inline styles or plain CSS using the token variables (all defined in `styles.css`):

- Surfaces: `--bg-1` (page) … `--bg-12` (highest-contrast text-on-surface). Cards sit on `--bg-2`/`--bg-3`; borders use `--bg-6`/`--bg-7`.
- Accent: `--accent-1` … `--accent-12` plus alpha `--accent-a1…a12`, and shortcuts `--accent`, `--accent-hover`, `--accent-active`. The accent resolves from the accent class on the wrapper: `jade` (default), `crimson`, `iris`, `cyan`, `mint`, `amber`, `lotus`, `lime`, `red` — put one of these class names on a container to re-theme everything inside it.
- Text: `--text`, `--text-secondary`.
- Status colors (radix scales, always defined): success `--grass-9`, error `--tomato-9`, warning `--amber-9`, info `--blue-9`.
- Type scale: `--font-size` (14px base), `--font-size-small`, `--font-size-input`, `--font-size-h1…h6`; weights `--font-weight-regular/medium/semi-bold/bold`. Font stack: `var(--font)`.
- Radius: `--border-radius` (0.3rem).

Component chrome (buttons, cards, inputs…) is styled internally by styled-components — pass props, don't restyle their internals with CSS overrides.

## Where the truth lives

- `styles.css` (and its imports) — every token above, the accent-class definitions, all @font-face rules.
- `components/<group>/<Name>/<Name>.d.ts` — the component's props contract; `<Name>.prompt.md` — usage notes and examples.
- Data-driven components (MuseCard, ChatBubble, Prompt, ConversationCard…) take full domain objects (Muse, Message, Novelist). Their `.d.ts` names the type; give complete nested objects — they dereference nested fields at render (e.g. `message.sender.username`, `muse.fandom.name`).

## Idiomatic composition example

```jsx
import { DSProvider, ChatBubble, Button } from "rp-webapp";

const marcus = { id: "n2", username: "marcus_wren", name: "Marcus", image: avatarUrl, messageSourceType: "NOVELIST" };
const message = {
  id: "m1", senderId: "n2", conversationId: "c1", sender: marcus, type: "TEXT",
  image: "", message: "The storm broke just as Wren reached the lighthouse.",
  isRead: true, reactions: [], attachments: [], createdAt: "2026-07-18T21:14:00Z",
};

<DSProvider>
  <div style={{ padding: 16, maxWidth: 560, background: "var(--bg-1)" }}>
    <ChatBubble currentUsername="elena_inks" message={message} />
    <Button variant="secondary" size="sm">Reply</Button>
  </div>
</DSProvider>
```
