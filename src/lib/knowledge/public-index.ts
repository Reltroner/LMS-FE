import rawIndex from "../../../.public-content/knowledge-index.json" with { type: "json" };
import { retrieveKnowledge } from "./retrieve.ts";
import type { KnowledgeIndex, KnowledgeSearchResult, RetrievalQueryInput } from "./types.ts";

export const publicKnowledgeIndex: KnowledgeIndex = rawIndex as KnowledgeIndex;

export function retrievePublicKnowledge(
  input: RetrievalQueryInput,
): KnowledgeSearchResult[] {
  return retrieveKnowledge(publicKnowledgeIndex, {
    ...input,
    scope: { ...input.scope, visibility: "public" },
  });
}
