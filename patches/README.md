# Dependency patches

Applied by pnpm at install (`pnpm.patchedDependencies` in the root
`package.json`), so EAS builds get them too. To change one: edit the
`.patch` file, run `pnpm install`, and check the result in `node_modules`.

## react-native@0.81.5 — TextKit 1 for multiline `TextInput` on iOS

`RCTUITextView.mm`: one line in `initWithFrame:` that reads
`self.layoutManager`, which switches the `UITextView` from TextKit 2 (the
iOS 16+ default) to TextKit 1.

Why: React Native measures a multiline field with its own TextKit 1 layout
manager (`RCTTextLayoutManager`) but lets the live `UITextView` lay itself
out with TextKit 2, and never reconciles the two. In the editor, a line typed
in Times New Roman ran past the right edge of the field, wrapped late in
bursts, and the caret followed it off screen; Courier New and the bundled
fonts were fine (iPhone, iOS 26, 2026-10-17). Forcing TextKit 1 makes the
view and the measurement agree, which is how every RN text input behaved
before iOS 16.

Revisit when upgrading React Native: if upstream opts the text view into
TextKit 1 itself, or into TextKit 2 for measurement, drop this.

**This patch is inert, and was a wrong diagnosis.** Expo SDK 54 ships React
Native for iOS as a precompiled `React.xcframework` (`expo-build-properties`
→ `ios.buildReactNativeFromSource` is `false` by default and the app does
not set it), so `RCTUITextView.mm` is never compiled and the line above has
never run. A runtime swizzle to the same effect was built and shipped on
2026-11-02 and changed nothing: the text system was never the cause. The
cause was the font's leading (`lineGap`), which iOS adds under every line
while React Native's measurement leaves it out; the fix is in
`apps/mobile/src/components/editor/block-input.tsx` and
`apps/mobile/src/lib/editor-fonts.ts` (`fontLeading`). Remove this patch —
root `package.json` → `pnpm.patchedDependencies`, delete the file, then
`pnpm install` with Metro stopped (it locks `node_modules`).
