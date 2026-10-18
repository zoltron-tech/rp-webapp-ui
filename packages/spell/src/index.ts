export { createSpellEngine, type SpellEngine } from "./engine";
export { type LemmaForm, lemmaForms } from "./inflect";
export {
  createThesaurus,
  type Thesaurus,
  type ThesaurusEntry,
  type ThesaurusOptions,
} from "./thesaurus";
export {
  type CheckContext,
  isCheckable,
  matchCase,
  namesToWords,
  normalizeText,
  normalizeWord,
  splitHyphenated,
  tokenize,
  type WordToken,
} from "./tokenizer";
