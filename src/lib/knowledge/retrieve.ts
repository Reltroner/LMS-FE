import type {
  KnowledgeChunk,
  KnowledgeIndex,
  KnowledgeSearchResult,
  RetrievalQueryInput,
} from "./types.ts";

const MAX_QUERY_LENGTH = 500;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;
const DEFAULT_MIN_SCORE = 1.25;

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "can", "could",
  "did", "do", "does", "for", "from", "had", "has", "have", "how", "i",
  "if", "in", "into", "is", "it", "its", "may", "might", "my", "no", "not",
  "of", "on", "or", "our", "out", "should", "so", "some", "such", "than",
  "that", "the", "their", "them", "then", "there", "these", "they", "this",
  "to", "up", "use", "using", "was", "we", "were", "what", "when", "where",
  "which", "who", "why", "will", "with", "would", "you", "your", "about",
  "explain", "tell", "me", "show", "mean", "means",
]);

// Generic container words that should not alone satisfy a multi-term topical query.
const CONTAINER_TOKENS = new Set([
  "lesson", "lessons", "course", "courses", "module", "modules", "section", "sections",
]);

export function normalizeText(input: string): string {
  return input
    .normalize("NFKC")
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function stemToken(token: string): string {
  if (token.length <= 3) return token;
  if (token.endsWith("ies") && token.length > 4) return `${token.slice(0, -3)}y`;
  if (token.endsWith("ing") && token.length > 5 && !token.endsWith("building") && !token.endsWith("thinking") && !token.endsWith("reasoning")) {
    return token.slice(0, -3);
  }
  if (token.endsWith("es") && token.length > 4 && /(?:shes|ches|xes|zes|ses)$/.test(token)) {
    return token.slice(0, -2);
  }
  if (token.endsWith("s") && !token.endsWith("ss") && !token.endsWith("us") && !token.endsWith("is")) {
    return token.slice(0, -1);
  }
  return token;
}

export function tokenize(input: string): string[] {
  const normalized = normalizeText(input);
  if (!normalized) return [];
  return normalized.split(/\s+/).filter((t) => t.length > 0);
}

export function extractQueryTokens(rawQuery: string): {
  normalizedPhrase: string;
  allTokens: string[];
  contentTokens: string[];
  topicalTokens: string[];
} {
  const bounded = rawQuery.slice(0, MAX_QUERY_LENGTH);
  const normalizedPhrase = normalizeText(bounded);
  const allTokens = tokenize(bounded);
  if (allTokens.length === 0) {
    return { normalizedPhrase: "", allTokens: [], contentTokens: [], topicalTokens: [] };
  }
  const nonStop = allTokens.filter((t) => !STOPWORDS.has(t));
  const contentTokens = nonStop.length > 0 ? nonStop : allTokens;
  const topicalTokens = contentTokens.filter((t) => !CONTAINER_TOKENS.has(t));
  return { normalizedPhrase, allTokens, contentTokens, topicalTokens };
}

function buildSnippet(content: string, queryTokens: readonly string[]): string {
  const clean = content.replace(/\s+/g, " ").trim();
  if (clean.length <= 240) return clean;

  const queryStems = new Set(queryTokens.map(stemToken));
  const sentences = content
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (sentences.length === 0) return `${clean.slice(0, 237)}...`;

  let bestIdx = 0;
  let bestHits = -1;
  for (let i = 0; i < sentences.length; i++) {
    const tokens = tokenize(sentences[i]);
    let hits = 0;
    for (const t of tokens) {
      if (queryStems.has(stemToken(t)) || queryTokens.includes(t)) {
        hits += 1;
      }
    }
    if (hits > bestHits) {
      bestHits = hits;
      bestIdx = i;
    }
  }

  let snippet = sentences[bestIdx];
  let nextIdx = bestIdx + 1;
  while (nextIdx < sentences.length && snippet.length + sentences[nextIdx].length + 1 <= 260) {
    snippet = `${snippet} ${sentences[nextIdx]}`;
    nextIdx += 1;
  }

  if (snippet.length > 260) {
    snippet = `${snippet.slice(0, 257).trimEnd()}...`;
  }
  return snippet;
}

type PreparedDoc = {
  chunk: KnowledgeChunk;
  normTitle: string;
  normHeading: string;
  normContent: string;
  normTags: string;
  stemCounts: Map<string, number>;
  titleStems: Set<string>;
  headingStems: Set<string>;
  tagStems: Set<string>;
  docLen: number;
};

const indexCache = new WeakMap<KnowledgeIndex, {
  docs: PreparedDoc[];
  avgDocLen: number;
  docFreq: Map<string, number>;
}>();

function prepareIndex(index: KnowledgeIndex) {
  const cached = indexCache.get(index);
  if (cached) return cached;

  const docs: PreparedDoc[] = [];
  const docFreq = new Map<string, number>();
  let totalLen = 0;

  for (const chunk of index.chunks) {
    if (chunk.visibility !== "public") continue;
    const normTitle = normalizeText(chunk.title);
    const normHeading = normalizeText(chunk.heading ?? "");
    const normContent = normalizeText(chunk.content);
    const normTags = normalizeText(chunk.tags.join(" "));

    const isLessonSubsection = chunk.sourceType === "lesson" && chunk.sectionId !== "lesson-overview";
    const searchableText = isLessonSubsection
      ? `${chunk.heading ?? ""} ${chunk.content} ${chunk.tags.join(" ")}`
      : `${chunk.title} ${chunk.heading ?? ""} ${chunk.content} ${chunk.tags.join(" ")}`;
    const bodyTokens = tokenize(searchableText);
    const stemCounts = new Map<string, number>();
    for (const token of bodyTokens) {
      const s = stemToken(token);
      stemCounts.set(s, (stemCounts.get(s) ?? 0) + 1);
    }
    for (const s of stemCounts.keys()) {
      docFreq.set(s, (docFreq.get(s) ?? 0) + 1);
    }

    const titleStems = new Set(tokenize(chunk.title).map(stemToken));
    const headingStems = new Set(tokenize(chunk.heading ?? "").map(stemToken));
    const tagStems = new Set(chunk.tags.flatMap((t) => tokenize(t)).map(stemToken));

    const docLen = Math.max(1, bodyTokens.length);
    totalLen += docLen;
    docs.push({
      chunk,
      normTitle,
      normHeading,
      normContent,
      normTags,
      stemCounts,
      titleStems,
      headingStems,
      tagStems,
      docLen,
    });
  }

  const avgDocLen = docs.length > 0 ? totalLen / docs.length : 1;
  const prepared = { docs, avgDocLen, docFreq };
  indexCache.set(index, prepared);
  return prepared;
}

const sourcePriority: Record<string, number> = {
  lesson: 3,
  course: 2,
  path: 1,
};

/**
 * Shared lexical + structural retrieval engine (BM25 + heading/title/phrase/coverage boosting)
 * powering both `/search` and `/assistant`.
 */
export function retrieveKnowledge(
  index: KnowledgeIndex,
  input: RetrievalQueryInput,
): KnowledgeSearchResult[] {
  if (!index || index.visibility !== "public" || !Array.isArray(index.chunks)) {
    throw new Error("Invalid or non-public knowledge index");
  }
  if (input.scope?.visibility && input.scope.visibility !== "public") {
    throw new Error("Unauthorized retrieval scope");
  }
  if (typeof input.query !== "string") return [];

  const { normalizedPhrase, allTokens, contentTokens, topicalTokens } = extractQueryTokens(input.query);
  if (contentTokens.length === 0 || !normalizedPhrase) return [];

  const limit = Math.min(Math.max(1, Math.trunc(input.limit ?? DEFAULT_LIMIT)), MAX_LIMIT);
  const minScore = input.minScore ?? DEFAULT_MIN_SCORE;

  const { docs, avgDocLen, docFreq } = prepareIndex(index);
  if (docs.length === 0) return [];

  const uniqueContentStems = [...new Set(contentTokens.map(stemToken))];
  const uniqueTopicalStems = [...new Set(topicalTokens.map(stemToken))];

  // Build consecutive token bigrams for phrase proximity boosting
  const bigrams: string[] = [];
  for (let i = 0; i < contentTokens.length - 1; i++) {
    bigrams.push(`${contentTokens[i]} ${contentTokens[i + 1]}`);
  }

  const N = docs.length;
  const k1 = 1.2;
  const b = 0.75;

  const scored: { result: KnowledgeSearchResult; rawScore: number }[] = [];

  for (const doc of docs) {
    const { chunk } = doc;
    if (input.scope?.courseSlug && chunk.courseSlug !== input.scope.courseSlug) continue;
    if (input.scope?.sourceTypes && !input.scope.sourceTypes.includes(chunk.sourceType)) continue;

    let bm25Score = 0;
    let matchedContentStems = 0;
    let matchedTopicalStems = 0;

    for (const stem of uniqueContentStems) {
      const tf = doc.stemCounts.get(stem) ?? 0;
      if (tf <= 0) continue;
      matchedContentStems += 1;
      if (uniqueTopicalStems.includes(stem)) {
        matchedTopicalStems += 1;
      }

      const df = docFreq.get(stem) ?? 0;
      const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
      const tfNorm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (doc.docLen / avgDocLen)));
      bm25Score += idf * tfNorm;

      // Field boosts
      const isLessonSubsection = chunk.sourceType === "lesson" && chunk.sectionId !== "lesson-overview";
      if (doc.headingStems.has(stem)) bm25Score += 1.8;
      if (!isLessonSubsection && doc.titleStems.has(stem)) bm25Score += 1.4;
      if (doc.tagStems.has(stem)) bm25Score += 1.0;
    }

    if (matchedContentStems === 0) continue;

    // If the query contains topical tokens, require topical token match and reject low-coverage noise
    if (uniqueTopicalStems.length > 0 && matchedTopicalStems === 0) {
      continue;
    }
    if (uniqueTopicalStems.length >= 3 && matchedTopicalStems / uniqueTopicalStems.length < 0.5) {
      continue;
    }
    if (uniqueTopicalStems.length === 2 && matchedTopicalStems < 1) {
      continue;
    }

    // Coverage boost: reward chunks matching most/all query terms
    const coverageRatio = matchedContentStems / uniqueContentStems.length;
    if (uniqueContentStems.length > 1) {
      bm25Score *= 0.65 + 0.7 * coverageRatio;
    }

    // Exact phrase & heading match boosts
    const isLessonSubsection = chunk.sourceType === "lesson" && chunk.sectionId !== "lesson-overview";
    if (normalizedPhrase.length >= 4) {
      if (doc.normHeading === normalizedPhrase || (!isLessonSubsection && doc.normTitle === normalizedPhrase)) {
        bm25Score += 5.0;
      } else if (doc.normHeading.includes(normalizedPhrase) || (!isLessonSubsection && doc.normTitle.includes(normalizedPhrase))) {
        bm25Score += 3.2;
      }
      if (doc.normContent.includes(normalizedPhrase)) {
        bm25Score += 2.5;
      }
    }

    // Bigram proximity boosts
    for (const bg of bigrams) {
      if (doc.normHeading.includes(bg)) bm25Score += 1.5;
      if (doc.normContent.includes(bg)) bm25Score += 1.1;
    }

    // Penalize overview-only lesson chunks slightly compared to specific lesson sections when both match
    if (chunk.sourceType === "lesson" && chunk.sectionId === "lesson-overview") {
      bm25Score *= 0.92;
    }

    if (bm25Score < minScore) continue;

    const relevance = Math.round(bm25Score * 100) / 100;
    const snippet = buildSnippet(chunk.content, allTokens);

    scored.push({
      rawScore: bm25Score,
      result: {
        chunkId: chunk.id,
        title: chunk.title,
        snippet,
        content: chunk.content,
        sourceUrl: chunk.sourceUrl,
        sourceType: chunk.sourceType,
        relevance,
        courseSlug: chunk.courseSlug,
        ...(chunk.pathSlug ? { pathSlug: chunk.pathSlug } : {}),
        ...(chunk.lessonId ? { lessonId: chunk.lessonId } : {}),
        ...(chunk.lessonSlug ? { lessonSlug: chunk.lessonSlug } : {}),
        ...(chunk.sectionId ? { sectionId: chunk.sectionId } : {}),
        ...(chunk.heading ? { heading: chunk.heading } : {}),
      },
    });
  }

  // Deterministic ranking: relevance desc -> sourceType priority desc -> chunkId asc
  scored.sort((a, b) => {
    if (b.result.relevance !== a.result.relevance) {
      return b.result.relevance - a.result.relevance;
    }
    const prioDiff = (sourcePriority[b.result.sourceType] ?? 0) - (sourcePriority[a.result.sourceType] ?? 0);
    if (prioDiff !== 0) return prioDiff;
    return a.result.chunkId.localeCompare(b.result.chunkId);
  });

  // Deduplicate identical snippets
  const deduplicated: KnowledgeSearchResult[] = [];
  const seenSnippets = new Set<string>();
  for (const { result } of scored) {
    const key = `${result.sourceUrl}::${result.snippet.toLowerCase()}`;
    if (seenSnippets.has(key)) continue;
    seenSnippets.add(key);
    deduplicated.push(result);
    if (deduplicated.length >= limit) break;
  }

  return deduplicated;
}
