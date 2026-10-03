export type AttributeSuggestion = {
  label: string;
  keywords: string[];
};

/**
 * Each entry maps a suggested attribute label to a list of keywords that
 * qualify the suggestion. The dropdown shows a match if the user's typed
 * text is a case-insensitive prefix of, or substring match with, any keyword.
 */
export const ATTRIBUTE_SUGGESTIONS: AttributeSuggestion[] = [
  {
    keywords: ["house", "hou", "home", "section", "dormitory", "dorm", "guild"],
    label: "House",
  },
  {
    keywords: ["wand", "wan", "stick", "staff", "weapon", "wands"],
    label: "Wand",
  },
  {
    keywords: ["species", "spec", "race", "type", "kind", "creature"],
    label: "Species",
  },
  {
    keywords: ["age", "old", "years", "born", "dob"],
    label: "Age",
  },
  {
    keywords: [
      "occupation",
      "occup",
      "job",
      "work",
      "career",
      "profession",
      "role",
      "class",
    ],
    label: "Occupation",
  },
  {
    keywords: ["alias", "nickname", "nick", "aka", "pseudonym"],
    label: "Alias",
  },
  {
    keywords: [
      "alignment",
      "align",
      "side",
      "faction",
      "allegiance",
      "team",
      "affiliation",
    ],
    label: "Alignment",
  },
  {
    keywords: [
      "powers",
      "power",
      "abilities",
      "ability",
      "skills",
      "skill",
      "magic",
      "talent",
    ],
    label: "Powers",
  },
  {
    keywords: ["weakness", "weak", "flaw", "vulnerable", "vulnerability"],
    label: "Weakness",
  },
  {
    keywords: [
      "birthplace",
      "birth",
      "born",
      "origin",
      "hometown",
      "city",
      "country",
    ],
    label: "Birthplace",
  },
  {
    keywords: ["height", "tall", "size", "stature", "ht"],
    label: "Height",
  },
  {
    keywords: ["eye", "eyes", "iris", "color", "colour", "ecolor"],
    label: "Eye Color",
  },
  {
    keywords: ["hair", "locks", "haircolor", "hcolor"],
    label: "Hair Color",
  },
  {
    keywords: [
      "personality",
      "person",
      "trait",
      "character",
      "nature",
      "disposition",
    ],
    label: "Personality",
  },
  {
    keywords: ["quote", "saying", "motto", "phrase", "catchphrase"],
    label: "Quote",
  },
  {
    keywords: ["affiliation", "group", "org", "organization", "club"],
    label: "Affiliation",
  },
  {
    keywords: ["status", "condition", "alive", "dead", "state"],
    label: "Status",
  },
  {
    keywords: ["rank", "level", "tier", "grade", "position", "title"],
    label: "Rank",
  },
  {
    keywords: ["weapon", "arms", "sword", "gun", "blade", "tool"],
    label: "Weapon",
  },
  {
    keywords: ["nationality", "nation", "country", "citizenship"],
    label: "Nationality",
  },
  {
    keywords: ["patronus", "patron", "guardian", "spirit"],
    label: "Patronus",
  },
  {
    keywords: ["blood", "status", "purity", "muggle", "pure"],
    label: "Blood Status",
  },
  {
    keywords: ["ability", "gift", "power", "talent", "skill"],
    label: "Ability",
  },
];

/**
 * Returns suggestions whose keywords start with or contain the typed query.
 * Always case-insensitive. Returns at most `limit` results.
 */
export function filterSuggestions(
  query: string,
  limit = 8,
): AttributeSuggestion[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: AttributeSuggestion[] = [];

  for (const suggestion of ATTRIBUTE_SUGGESTIONS) {
    const labelMatch = suggestion.label.toLowerCase().startsWith(q);
    const keywordMatch = suggestion.keywords.some((kw) =>
      kw.toLowerCase().startsWith(q),
    );

    if (labelMatch || keywordMatch) {
      results.push(suggestion);
      if (results.length >= limit) break;
    }
  }

  return results;
}
