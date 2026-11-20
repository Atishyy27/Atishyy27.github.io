// One place for the open-source headline wording, so the home page, /oss,
// metadata and the RAG index cannot drift apart. Numbers come from OSS_STATS
// only. Imports nothing else, so the node-side checks can load it.

import { OSS_STATS as S } from "./oss-stats";

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

export const ossHeadline = {
  contributions: S.contributions,
  noun: plural(S.contributions, "contribution", "contributions"),
  nounTitle: plural(S.contributions, "Contribution", "Contributions"),
  counts: `${S.merged} merged · ${S.open} open`,
  orgs: `across ${S.orgsLanded} ${plural(S.orgsLanded, "organisation", "organisations")}`,
};

/** "56 contributions across 27 organisations (56 merged, 64 open)" */
export function ossHeadlineText(): string {
  return `${S.contributions} ${ossHeadline.noun} ${ossHeadline.orgs} (${S.merged} merged, ${S.open} open)`;
}

/** "56 merged · 64 open" */
export const ossCountsText = ossHeadline.counts;
